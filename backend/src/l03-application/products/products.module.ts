import { Module } from '@nestjs/common';
import { ProductsController } from '../../l01-presentation/products/products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { InfrastructureModule } from '../../l05-infrastructure/infrastructure.module';

@Module({
  imports: [DatabaseModule, InfrastructureModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
