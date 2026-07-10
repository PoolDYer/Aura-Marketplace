import { Module } from '@nestjs/common';
import { PaymentsController } from '../../l01-presentation/payments/payments.controller';
import { MercadoPagoService } from '../../l05-infrastructure/payments/mercadopago.service';

@Module({
  controllers: [PaymentsController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class PaymentsModule {}
