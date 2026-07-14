import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from './orders.module';
import { OrdersService } from './orders.service';
import { OrdersController } from '../../l01-presentation/orders/orders.controller';
import { VendorOrdersController } from '../../l01-presentation/orders/vendor-orders.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

describe('OrdersModule', () => {
  it('should compile OrdersModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        OrdersModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(OrdersService)).toBeDefined();
    expect(moduleRef.get(OrdersController)).toBeDefined();
    expect(moduleRef.get(VendorOrdersController)).toBeDefined();
  });
});
