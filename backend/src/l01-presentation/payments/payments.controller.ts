import { Body, Controller, Get, Headers, Param, Post, Query, RawBodyRequest, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { Public } from '../../l03-application/auth/decorators/public.decorator';
import { MercadoPagoService } from '../../l05-infrastructure/payments/mercadopago.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:orderId')
  @ApiOperation({ summary: 'Crear preferencia de pago con Mercado Pago Checkout Pro' })
  createCheckoutPreference(@Request() req, @Param('orderId') orderId: string) {
    return this.mercadoPagoService.createCheckoutPreference(req.user.sub, orderId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('brick/:orderId')
  @ApiOperation({ summary: 'Inicializar Payment Brick de Mercado Pago' })
  createBrickInitialization(@Request() req, @Param('orderId') orderId: string) {
    return this.mercadoPagoService.createBrickInitialization(req.user.sub, orderId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('process/:orderId')
  @ApiOperation({ summary: 'Procesar pago enviado desde Payment Brick' })
  processBrickPayment(@Request() req, @Param('orderId') orderId: string, @Body() body: any) {
    return this.mercadoPagoService.processBrickPayment(req.user.sub, orderId, body);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Mercado Pago' })
  async handleWebhook(
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('data.id') dataId: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const body = (req as any).rawBody || (req as any).body;
    return this.mercadoPagoService.handleWebhook(xSignature, xRequestId, dataId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiOperation({ summary: 'Verificar pago de Mercado Pago' })
  verifyPayment(
    @Query('payment_id') paymentId: string,
    @Query('collection_id') collectionId: string,
    @Query('order_id') orderId: string,
  ) {
    return this.mercadoPagoService.verifyPayment(paymentId || collectionId, orderId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':ordenId')
  @ApiOperation({ summary: 'Obtener estado del pago de una orden' })
  getPaymentStatus(@Request() req, @Param('ordenId') orderId: string) {
    return this.mercadoPagoService.getPaymentStatus(req.user.sub, orderId);
  }
}
