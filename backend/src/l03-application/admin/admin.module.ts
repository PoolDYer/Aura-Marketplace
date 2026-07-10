import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { AdminController } from '../../l01-presentation/admin/admin.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
