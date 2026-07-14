import { Test } from '@nestjs/testing';
import { NotificationsModule } from './notifications.module';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from '../../l01-presentation/notifications/notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

describe('NotificationsModule', () => {
  it('should compile NotificationsModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        NotificationsModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(NotificationsService)).toBeDefined();
    expect(moduleRef.get(NotificationsController)).toBeDefined();
  });
});
