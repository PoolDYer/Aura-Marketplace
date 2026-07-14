import { Test } from '@nestjs/testing';
import { PaymentsModule } from './payments.module';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from '../../l05-infrastructure/payments/mercadopago.service';
import { PaymentsController } from '../../l01-presentation/payments/payments.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

describe('PaymentsModule', () => {
  it('should compile PaymentsModule and resolve dependencies successfully', async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token';
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        PaymentsModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(MercadoPagoService)).toBeDefined();
    expect(moduleRef.get(PaymentsService)).toBeDefined();
    expect(moduleRef.get(PaymentsController)).toBeDefined();
  });
});
