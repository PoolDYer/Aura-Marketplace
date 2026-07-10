import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { CategoriesController } from '../../l01-presentation/categories/categories.controller';
import { InfrastructureModule } from '../../l05-infrastructure/infrastructure.module';

@Module({
  imports: [DatabaseModule, InfrastructureModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
