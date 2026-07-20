const preferenceCreate = jest.fn();
const paymentCreate = jest.fn();
const paymentGet = jest.fn();
const validateSignature = jest.fn();

jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn((config) => config),
  Preference: jest.fn(() => ({ create: preferenceCreate })),
  Payment: jest.fn(() => ({ create: paymentCreate, get: paymentGet })),
  WebhookSignatureValidator: { validate: validateSignature },
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';

describe('MercadoPagoService', () => {
  const order = {
    id: 'order-1',
    compradorId: 'user-1',
    estado: 'PENDIENTE',
    total: 100,
    numeroConfirmacion: 'ORD-1',
    comprador: { nombre: 'Ada', email: 'ada@test.dev' },
    lineas: [{ publicacionId: 'p1', nombreProducto: 'Silla', cantidad: 2, precioUnitario: 50 }],
  };

  const createPrisma = (orderOverride: any = order) => ({
    orden: {
      findFirst: jest.fn().mockResolvedValue(orderOverride),
      findUnique: jest.fn().mockResolvedValue(orderOverride),
      update: jest.fn(),
    },
    pago: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(async (callback) =>
      callback({
        orden: { update: jest.fn() },
        pago: { upsert: jest.fn() },
      }),
    ),
  });

  const createService = (values: Record<string, string | undefined> = {}, prisma = createPrisma()) => {
    const config = {
      get: jest.fn((key: string) => values[key] ?? (key === 'MERCADOPAGO_ACCESS_TOKEN' ? 'token' : undefined)),
    };
    return { service: new MercadoPagoService(config as any, prisma as any), prisma, config };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires an access token during construction', () => {
    const config = { get: jest.fn(() => undefined) };

    expect(() => new MercadoPagoService(config as any, createPrisma() as any)).toThrow('MERCADOPAGO_ACCESS_TOKEN no configurado');
  });

  it('returns the public Mercado Pago key without exposing private credentials', async () => {
    const { service } = createService({
      MERCADOPAGO_PUBLIC_KEY: ' "pk_test_public" ',
      MERCADOPAGO_ACCESS_TOKEN: 'APP_USR_private',
    });

    await expect(service.getPublicConfig()).resolves.toEqual({
      mercadoPagoPublicKey: 'pk_test_public',
    });
  });

  it('creates checkout preferences and persists pending payments', async () => {
    const { service, prisma } = createService({
      FRONTEND_URL: 'https://front.test',
      BACKEND_URL: 'https://api.test',
      MERCADOPAGO_CURRENCY: 'USD',
    });
    preferenceCreate.mockResolvedValueOnce({ id: 'pref-1', init_point: 'https://pay.test' });

    await expect(service.createCheckoutPreference('user-1', 'order-1')).resolves.toEqual({
      preferenceId: 'pref-1',
      url: 'https://pay.test',
    });

    expect(preferenceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          auto_return: 'approved',
          notification_url: 'https://api.test/payments/webhook',
          items: [expect.objectContaining({ currency_id: 'USD' })],
        }),
        requestOptions: { idempotencyKey: 'order-order-1' },
      }),
    );
    expect(prisma.pago.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { ordenId: 'order-1' } }));
  });

  it('rejects missing or non-pending orders before payment creation', async () => {
    const prisma = createPrisma();
    prisma.orden.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...order, estado: 'CONFIRMADA' });
    const { service } = createService({}, prisma);

    await expect(service.createCheckoutPreference('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.createCheckoutPreference('user-1', 'order-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('wraps preference SDK failures and missing checkout URLs', async () => {
    const { service } = createService();
    preferenceCreate.mockRejectedValueOnce(new Error('sdk')).mockRejectedValueOnce({}).mockResolvedValueOnce({ id: 'pref-1' });

    await expect(service.createCheckoutPreference('user-1', 'order-1')).rejects.toThrow('sdk');
    await expect(service.createCheckoutPreference('user-1', 'order-1')).rejects.toThrow(
      'Mercado Pago rechazo la preferencia de pago',
    );
    await expect(service.createCheckoutPreference('user-1', 'order-1')).rejects.toThrow('Mercado Pago no devolvio una URL');
  });

  it('returns a clear setup message when Mercado Pago rejects the access token', async () => {
    const { service } = createService();
    preferenceCreate.mockRejectedValueOnce(new Error('invalid access token'));

    await expect(service.createCheckoutPreference('user-1', 'order-1')).rejects.toThrow(
      'Mercado Pago no esta configurado correctamente. Revisa MERCADOPAGO_ACCESS_TOKEN en Render.',
    );
  });

  it('creates Brick initialization preferences', async () => {
    const { service, prisma } = createService({ MERCADOPAGO_CURRENCY: 'PEN' });
    preferenceCreate.mockResolvedValueOnce({ id: 'pref-1', sandbox_init_point: 'https://sandbox.test' });

    await expect(service.createBrickInitialization('user-1', 'order-1')).resolves.toEqual({
      preferenceId: 'pref-1',
      amount: 100,
      currency: 'PEN',
      payer: { email: 'ada@test.dev', firstName: 'Ada' },
    });
    expect(prisma.pago.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ metodoPago: 'mercadopago_bricks' }) }),
    );
  });

  it('uses a sandbox payer email when Mercado Pago test credentials are configured', async () => {
    const { service } = createService({
      MERCADOPAGO_ACCESS_TOKEN: 'TEST-access-token',
      MERCADOPAGO_TEST_PAYER_EMAIL: 'buyer-test@auraperu.shop',
    });
    preferenceCreate.mockResolvedValueOnce({ id: 'pref-1', sandbox_init_point: 'https://sandbox.test' });
    paymentCreate.mockResolvedValueOnce({ id: 123, status: 'approved', payment_method_id: 'visa', transaction_amount: 100 });

    await expect(service.createBrickInitialization('user-1', 'order-1')).resolves.toMatchObject({
      payer: { email: 'buyer-test@auraperu.shop' },
    });

    await service.processBrickPayment('user-1', 'order-1', {
      token: 'tok',
      payment_method_id: 'visa',
      installments: 1,
      payer: { email: 'ada@test.dev' },
    });

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          payer: expect.objectContaining({ email: 'buyer-test@auraperu.shop' }),
        }),
      }),
    );
  });

  it('adds HTTPS return and webhook options to Brick preferences when configured', async () => {
    const { service } = createService({ FRONTEND_URL: 'https://front.test', BACKEND_URL: 'https://api.test' });
    preferenceCreate.mockResolvedValueOnce({ id: 'pref-https' });

    await service.createBrickInitialization('user-1', 'order-1');

    expect(preferenceCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          auto_return: 'approved',
          notification_url: 'https://api.test/payments/webhook',
        }),
      }),
    );
  });

  it('wraps Brick preference failures without SDK messages', async () => {
    const { service } = createService();
    preferenceCreate.mockRejectedValueOnce({});

    await expect(service.createBrickInitialization('user-1', 'order-1')).rejects.toThrow(
      'Mercado Pago rechazo la preferencia de pago',
    );
  });

  it('processes Brick payments with normalized method payloads', async () => {
    const { service, prisma } = createService({ BACKEND_URL: 'https://api.test' });
    paymentCreate.mockResolvedValueOnce({ id: 123, status: 'approved', payment_method_id: 'yape', transaction_amount: 100 });

    await expect(
      service.processBrickPayment('user-1', 'order-1', { paymentMethodId: 'yape', token: 'tok' }),
    ).resolves.toMatchObject({
      success: true,
      status: 'APROBADO',
      orderId: 'order-1',
      paymentId: '123',
      paymentMethod: 'mercadopago_yape',
    });

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          payment_method_id: 'yape',
          installments: 1,
          notification_url: 'https://api.test/payments/webhook',
        }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('rounds Mercado Pago amounts to two decimals before creating payments', async () => {
    const decimalOrder = {
      ...order,
      total: '99.98999999999999',
      lineas: [{ publicacionId: 'p1', nombreProducto: 'Camisa', cantidad: 1, precioUnitario: '99.98999999999999' }],
    };
    const { service } = createService({}, createPrisma(decimalOrder));
    paymentCreate.mockResolvedValueOnce({ id: 123, status: 'approved', payment_method_id: 'visa', transaction_amount: 99.99 });

    await service.processBrickPayment('user-1', 'order-1', { payment_method_id: 'visa', token: 'tok', installments: 1 });

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          transaction_amount: 99.99,
          additional_info: expect.objectContaining({
            items: [expect.objectContaining({ unit_price: 99.99 })],
          }),
        }),
      }),
    );
  });

  it('wraps Brick payment SDK failures', async () => {
    const { service } = createService();
    paymentCreate.mockRejectedValueOnce(new Error('card rejected')).mockRejectedValueOnce({});

    await expect(service.processBrickPayment('user-1', 'order-1', {})).rejects.toThrow('card rejected');
    await expect(service.processBrickPayment('user-1', 'order-1', {})).rejects.toThrow('Mercado Pago rechazo el pago');
  });

  it('explains live credentials rejections during tests', async () => {
    const { service } = createService();
    paymentCreate.mockRejectedValueOnce(new Error('Unauthorized use of live credentials'));

    await expect(service.processBrickPayment('user-1', 'order-1', {})).rejects.toThrow(
      'Mercado Pago rechazo la prueba porque estas usando credenciales de produccion.',
    );
  });

  it('validates webhooks, extracts payment ids and verifies payments', async () => {
    const { service } = createService({ MERCADOPAGO_WEBHOOK_SECRET: 'secret' });
    paymentGet.mockResolvedValueOnce({ id: 99, status: 'rejected', external_reference: 'order-1', payment_method_id: 'visa' });

    await expect(
      service.handleWebhook('sig', 'req-1', '', Buffer.from(JSON.stringify({ resource: '/v1/payments/99' }))),
    ).resolves.toEqual({ received: true });

    expect(validateSignature).toHaveBeenCalledWith(expect.objectContaining({ secret: 'secret', dataId: '' }));
    expect(paymentGet).toHaveBeenCalledWith({ id: '99' });
  });

  it('accepts webhook payloads without payment ids', async () => {
    const { service } = createService();

    await expect(service.handleWebhook('', '', '', {})).resolves.toEqual({ received: true });
    await expect(service.handleWebhook('', '', '', null as any)).resolves.toEqual({ received: true });
    expect(paymentGet).not.toHaveBeenCalled();
  });

  it('extracts payment ids from data and payment payloads', async () => {
    const { service } = createService();
    paymentGet
      .mockResolvedValueOnce({ id: 'p-data', status: 'approved', external_reference: 'order-1' })
      .mockResolvedValueOnce({ id: 'p-type', status: 'approved', external_reference: 'order-1' });

    await service.handleWebhook('', '', '', { data: { id: 777 } });
    await service.handleWebhook('', '', '', { type: 'payment', id: 888 });

    expect(paymentGet).toHaveBeenCalledWith({ id: '777' });
    expect(paymentGet).toHaveBeenCalledWith({ id: '888' });
  });

  it('verifies payments with metadata and handles missing order references', async () => {
    const { service } = createService();
    paymentGet
      .mockResolvedValueOnce({ id: 'p1', status: 'refunded', metadata: { order_id: 'order-1' } })
      .mockResolvedValueOnce({ id: 'p2', status: 'cancelled', metadata: {} })
      .mockResolvedValueOnce({ id: 'p3', status: undefined, metadata: { orderId: 'order-1' } });

    await expect(service.verifyPayment('p1')).resolves.toMatchObject({ status: 'REEMBOLSADO', success: false });
    await expect(service.verifyPayment('p2')).resolves.toEqual({ success: false, status: 'RECHAZADO', orderId: null });
    await expect(service.verifyPayment('p3')).resolves.toMatchObject({ status: 'PENDIENTE', success: false });
    await expect(service.verifyPayment('')).rejects.toThrow('payment_id es requerido');
  });

  it('returns payment status only for the buyer order', async () => {
    const prisma = createPrisma();
    prisma.orden.findFirst.mockResolvedValueOnce({
      id: 'order-1',
      estado: 'CONFIRMADA',
      pago: { referenciaPasarela: 'pay-1', estado: 'APROBADO', metodoPago: 'mercadopago_yape' },
    });
    const { service } = createService({}, prisma);

    await expect(service.getPaymentStatus('user-1', 'order-1')).resolves.toEqual({
      ordenId: 'order-1',
      estadoOrden: 'CONFIRMADA',
      pago: { referencia: 'pay-1', estado: 'APROBADO', metodo: 'mercadopago_yape' },
    });

    prisma.orden.findFirst.mockResolvedValueOnce({ id: 'order-2', estado: 'PENDIENTE', pago: null });
    await expect(service.getPaymentStatus('user-1', 'order-2')).resolves.toEqual({
      ordenId: 'order-2',
      estadoOrden: 'PENDIENTE',
      pago: null,
    });

    prisma.orden.findFirst.mockResolvedValueOnce(null);
    await expect(service.getPaymentStatus('user-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns failed status when the paid order no longer exists', async () => {
    const prisma = createPrisma();
    prisma.orden.findUnique.mockResolvedValueOnce(null);
    const { service } = createService({}, prisma);
    paymentGet.mockResolvedValueOnce({ id: 'p1', status: 'approved', external_reference: 'missing' });

    await expect(service.verifyPayment('p1')).resolves.toEqual({
      success: false,
      status: 'APROBADO',
      orderId: 'missing',
    });
  });
});
