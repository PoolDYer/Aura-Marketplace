import { Module } from '@nestjs/common';
import { CartController } from '../../l01-presentation/cart/cart.controller';
import { CartService } from './cart.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
