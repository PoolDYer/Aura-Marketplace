import { Module } from '@nestjs/common';
import { PaymentsController } from '../../l01-presentation/payments/payments.controller';
import { MercadoPagoService } from '../../l05-infrastructure/payments/mercadopago.service';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MercadoPagoService,
    {
      provide: 'IPaymentGateway',
      useClass: MercadoPagoService,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
