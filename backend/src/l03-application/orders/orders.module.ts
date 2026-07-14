import { Module } from '@nestjs/common';
import { OrdersController } from '../../l01-presentation/orders/orders.controller';
import { VendorOrdersController } from '../../l01-presentation/orders/vendor-orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController, VendorOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
