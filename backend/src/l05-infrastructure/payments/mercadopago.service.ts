import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference, WebhookSignatureValidator } from 'mercadopago';
import { PrismaService } from '../database/prisma.service';
import { IPaymentGateway } from '../../l04-domain/ports/payment-gateway.interface';

type MercadoPagoWebhookPayload = {
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
  resource?: string;
  type?: string;
};

type BrickPaymentPayload = Record<string, any>;

@Injectable()
export class MercadoPagoService implements IPaymentGateway {
  private readonly preference: Preference;
  private readonly payment: Payment;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accessToken = this.getConfigValue('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    });

    this.preference = new Preference(client);
    this.payment = new Payment(client);
  }

  async getPublicConfig() {
    return {
      mercadoPagoPublicKey: this.getConfigValue('MERCADOPAGO_PUBLIC_KEY') || '',
    };
  }

  async createCheckoutPreference(userId: string, orderId: string) {
    const order = await this.getPendingOrder(userId, orderId);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const currencyId = this.getCurrency();

    const payerEmail = this.getPayerEmail(order);
    const preferenceBody = {
      items: order.lineas.map((linea) => ({
        id: linea.publicacionId,
        title: linea.nombreProducto,
        quantity: linea.cantidad,
        unit_price: Number(linea.precioUnitario),
        currency_id: currencyId,
      })),
      payer: {
        name: order.comprador.nombre,
        email: payerEmail,
      },
      external_reference: order.id,
      metadata: {
        orderId: order.id,
        buyerId: userId,
      },
      back_urls: {
        success: `${frontendUrl}/orders/success?order_id=${order.id}`,
        pending: `${frontendUrl}/orders/success?order_id=${order.id}&status=pending`,
        failure: `${frontendUrl}/orders/success?order_id=${order.id}&status=failure`,
      },
      ...(frontendUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      ...(backendUrl ? { notification_url: `${backendUrl}/payments/webhook` } : {}),
      statement_descriptor: 'AURA',
    };

    let preference;
    try {
      preference = await this.preference.create({
        body: preferenceBody,
        requestOptions: {
          idempotencyKey: `order-${order.id}`,
        },
      });
    } catch (err) {
      throw new BadRequestException(this.getMercadoPagoErrorMessage(err, 'Mercado Pago rechazo la preferencia de pago'));
    }

    await this.prisma.pago.upsert({
      where: { ordenId: order.id },
      update: {
        referenciaPasarela: preference.id,
        monto: order.total,
        estado: 'PENDIENTE',
        metodoPago: 'mercadopago',
      },
      create: {
        ordenId: order.id,
        referenciaPasarela: preference.id,
        monto: order.total,
        estado: 'PENDIENTE',
        metodoPago: 'mercadopago',
      },
    });

    const checkoutUrl = preference.init_point || preference.sandbox_init_point;
    if (!checkoutUrl || !preference.id) {
      throw new BadRequestException('Mercado Pago no devolvio una URL de checkout');
    }

    return { preferenceId: preference.id, url: checkoutUrl };
  }

  async createBrickInitialization(userId: string, orderId: string) {
    const order = await this.getPendingOrder(userId, orderId);
    const preference = await this.createPreferenceForOrder(userId, order);

    await this.prisma.pago.upsert({
      where: { ordenId: order.id },
      update: {
        referenciaPasarela: preference.id,
        monto: order.total,
        estado: 'PENDIENTE',
        metodoPago: 'mercadopago_bricks',
      },
      create: {
        ordenId: order.id,
        referenciaPasarela: preference.id,
        monto: order.total,
        estado: 'PENDIENTE',
        metodoPago: 'mercadopago_bricks',
      },
    });

    return {
      preferenceId: preference.id,
      amount: Number(order.total),
      currency: this.getCurrency(),
      payer: {
        email: this.getPayerEmail(order),
        firstName: order.comprador.nombre,
      },
    };
  }

  async processBrickPayment(userId: string, orderId: string, payload: BrickPaymentPayload) {
    const order = await this.getPendingOrder(userId, orderId);
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const { paymentMethodId, ...mercadoPagoPayload } = payload;
    const paymentMethod = payload.payment_method_id || paymentMethodId;

    const payerEmail = this.isMercadoPagoTestMode()
      ? this.getPayerEmail(order)
      : mercadoPagoPayload.payer?.email || order.comprador.email;

    const paymentBody = {
      ...mercadoPagoPayload,
      ...(paymentMethod ? { payment_method_id: paymentMethod } : {}),
      ...(paymentMethod === 'yape' && !payload.installments ? { installments: 1 } : {}),
      transaction_amount: Number(order.total),
      description: `Aura - Orden ${order.numeroConfirmacion}`,
      external_reference: order.id,
      metadata: {
        ...(mercadoPagoPayload.metadata || {}),
        orderId: order.id,
        buyerId: userId,
      },
      payer: {
        ...(mercadoPagoPayload.payer || {}),
        email: payerEmail,
      },
      additional_info: {
        ...(mercadoPagoPayload.additional_info || {}),
        items: order.lineas.map((linea) => ({
          id: linea.publicacionId,
          title: linea.nombreProducto,
          quantity: linea.cantidad,
          unit_price: Number(linea.precioUnitario),
        })),
      },
      ...(backendUrl ? { notification_url: `${backendUrl}/payments/webhook` } : {}),
      statement_descriptor: 'AURA',
    };

    let paymentResponse;
    try {
      paymentResponse = await this.payment.create({
        body: paymentBody,
        requestOptions: {
          idempotencyKey: `brick-${order.id}-${Date.now()}`,
        },
      });
    } catch (err) {
      throw new BadRequestException(this.getMercadoPagoErrorMessage(err, 'Mercado Pago rechazo el pago'));
    }

    return this.applyPaymentStatus(paymentResponse, order.id);
  }

  async handleWebhook(
    xSignature: string,
    xRequestId: string,
    dataId: string,
    payload: MercadoPagoWebhookPayload | Buffer,
  ) {
    const webhookSecret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');

    if (webhookSecret) {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret: webhookSecret,
        toleranceSeconds: 300,
      });
    }

    const body = this.parseWebhookPayload(payload);
    const paymentId = dataId || this.extractPaymentId(body);

    if (paymentId) {
      await this.verifyPayment(paymentId);
    }

    return { received: true };
  }

  async verifyPayment(paymentId: string, fallbackOrderId?: string) {
    if (!paymentId) throw new BadRequestException('payment_id es requerido');

    const payment = await this.payment.get({ id: paymentId });
    const orderId = payment.external_reference || payment.metadata?.order_id || payment.metadata?.orderId || fallbackOrderId;

    if (!orderId) {
      return { success: false, status: this.mapPaymentStatus(payment.status), orderId: null };
    }

    return this.applyPaymentStatus(payment, orderId);
  }

  async getPaymentStatus(userId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: { id: orderId, compradorId: userId },
      include: { pago: true },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    return {
      ordenId: order.id,
      estadoOrden: order.estado,
      pago: order.pago
        ? {
            referencia: order.pago.referenciaPasarela,
            estado: order.pago.estado,
            metodo: order.pago.metodoPago,
          }
        : null,
    };
  }

  private parseWebhookPayload(payload: MercadoPagoWebhookPayload | Buffer): MercadoPagoWebhookPayload {
    if (Buffer.isBuffer(payload)) {
      return JSON.parse(payload.toString()) as MercadoPagoWebhookPayload;
    }

    return payload || {};
  }

  private extractPaymentId(payload: MercadoPagoWebhookPayload) {
    if (payload.data?.id) return String(payload.data.id);
    if (payload.type === 'payment' && payload.id) return String(payload.id);

    const paymentResource = payload.resource?.match(/payments\/(\d+)/);
    return paymentResource?.[1];
  }

  private mapPaymentStatus(status?: string) {
    if (status === 'approved') return 'APROBADO';
    if (status === 'rejected' || status === 'cancelled') return 'RECHAZADO';
    if (status === 'refunded' || status === 'charged_back') return 'REEMBOLSADO';
    return 'PENDIENTE';
  }

  private async getPendingOrder(userId: string, orderId: string) {
    const order = await this.prisma.orden.findFirst({
      where: { id: orderId, compradorId: userId },
      include: { lineas: true, comprador: true },
    });

    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.estado !== 'PENDIENTE') {
      throw new BadRequestException('La orden no esta pendiente de pago');
    }

    return order;
  }

  private async createPreferenceForOrder(userId: string, order: any) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const currencyId = this.getCurrency();

    const payerEmail = this.getPayerEmail(order);
    const preferenceBody = {
      items: order.lineas.map((linea) => ({
        id: linea.publicacionId,
        title: linea.nombreProducto,
        quantity: linea.cantidad,
        unit_price: Number(linea.precioUnitario),
        currency_id: currencyId,
      })),
      payer: {
        name: order.comprador.nombre,
        email: payerEmail,
      },
      external_reference: order.id,
      metadata: {
        orderId: order.id,
        buyerId: userId,
      },
      back_urls: {
        success: `${frontendUrl}/orders/success?order_id=${order.id}`,
        pending: `${frontendUrl}/orders/success?order_id=${order.id}&status=pending`,
        failure: `${frontendUrl}/orders/success?order_id=${order.id}&status=failure`,
      },
      ...(frontendUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      ...(backendUrl ? { notification_url: `${backendUrl}/payments/webhook` } : {}),
      statement_descriptor: 'AURA',
    };

    try {
      return await this.preference.create({
        body: preferenceBody,
        requestOptions: {
          idempotencyKey: `order-${order.id}`,
        },
      });
    } catch (err) {
      throw new BadRequestException(this.getMercadoPagoErrorMessage(err, 'Mercado Pago rechazo la preferencia de pago'));
    }
  }

  private async applyPaymentStatus(payment: any, orderId: string) {
    const estadoPago = this.mapPaymentStatus(payment.status);
    const metodoPago = payment.payment_method_id ? `mercadopago_${payment.payment_method_id}` : 'mercadopago_bricks';
    const order = await this.prisma.orden.findUnique({ where: { id: orderId } });

    if (!order) {
      return { success: false, status: estadoPago, orderId };
    }

    await this.prisma.$transaction(async (tx) => {
      if (estadoPago === 'APROBADO' && order.estado === 'PENDIENTE') {
        await tx.orden.update({
          where: { id: orderId },
          data: { estado: 'CONFIRMADA' },
        });
      }

      await tx.pago.upsert({
        where: { ordenId: orderId },
        update: {
          referenciaPasarela: String(payment.id),
          estado: estadoPago,
          metodoPago,
        },
        create: {
          ordenId: orderId,
          referenciaPasarela: String(payment.id),
          monto: payment.transaction_amount || order.total,
          estado: estadoPago,
          metodoPago,
        },
      });
    });

    return {
      success: estadoPago === 'APROBADO',
      status: estadoPago,
      orderId,
      paymentId: String(payment.id),
      statusDetail: payment.status_detail,
      paymentMethod: metodoPago,
    };
  }

  private getCurrency() {
    return this.getConfigValue('MERCADOPAGO_CURRENCY') || 'PEN';
  }

  private isMercadoPagoTestMode() {
    return (this.getConfigValue('MERCADOPAGO_ACCESS_TOKEN') || '').startsWith('TEST-');
  }

  private getPayerEmail(order: any) {
    if (!this.isMercadoPagoTestMode()) {
      return order.comprador.email;
    }

    const configuredEmail = this.getConfigValue('MERCADOPAGO_TEST_PAYER_EMAIL');
    if (configuredEmail) {
      return configuredEmail;
    }

    const safeOrderId = String(order.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'order';
    return `test-buyer-${safeOrderId}@auraperu.shop`;
  }

  private getConfigValue(key: string) {
    const value = this.configService.get<string>(key);

    return typeof value === 'string' ? value.trim().replace(/^["']|["']$/g, '').trim() : value;
  }

  private getMercadoPagoErrorMessage(err: any, fallback: string) {
    const message = this.extractMercadoPagoErrorMessage(err);
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('invalid access token')) {
      return 'Mercado Pago no esta configurado correctamente. Revisa MERCADOPAGO_ACCESS_TOKEN en Render.';
    }

    if (normalizedMessage.includes('unauthorized use of live credentials')) {
      return 'Mercado Pago rechazo la prueba porque estas usando credenciales de produccion. Usa una cuenta Yape real o cambia a credenciales de prueba de Mercado Pago.';
    }

    if (normalizedMessage.includes('internal_error')) {
      return 'Mercado Pago devolvio internal_error. Para aprobar una compra de prueba con tarjeta usa titular APRO, DNI 12345678 y una tarjeta de prueba.';
    }

    if (normalizedMessage.includes('cannot be paid by the same account') || normalizedMessage.includes('payer and collector')) {
      return 'Mercado Pago rechazo el pago porque el comprador y el vendedor pertenecen a la misma cuenta de prueba. Usa un usuario comprador de prueba distinto al vendedor.';
    }

    return message || fallback;
  }

  private extractMercadoPagoErrorMessage(err: any) {
    const messages = new Set<string>();
    const addMessage = (value: unknown) => {
      if (typeof value === 'string' && value.trim()) messages.add(value.trim());
    };
    const collectFrom = (value: any) => {
      if (!value) return;

      addMessage(value.message);
      addMessage(value.error);
      addMessage(value.description);
      addMessage(value.status_detail);

      if (Array.isArray(value.cause)) {
        value.cause.forEach(collectFrom);
      } else if (value.cause && value.cause !== value) {
        collectFrom(value.cause);
      }
    };

    collectFrom(err);

    return Array.from(messages).join(' - ');
  }
}
