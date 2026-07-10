import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { NotificationsController } from '../../l01-presentation/notifications/notifications.controller';
import { InfrastructureModule } from '../../l05-infrastructure/infrastructure.module';

@Module({
  imports: [DatabaseModule, InfrastructureModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
