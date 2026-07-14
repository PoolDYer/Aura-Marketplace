import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { Argon2HasherService } from './security/argon2-hasher.service';
import { ConsoleMailService } from './notifications/console-mail.service';
import { ResendMailService } from './notifications/resend-mail.service';
import { MockStorageProvider } from './storage/mock-storage.provider';
import { MockNotificationProvider } from './notifications/mock-notification.provider';
import { CloudinaryService } from './storage/cloudinary.service';
import { SimpleCacheService } from './cache/simple-cache.service';

@Module({
  providers: [
    PrismaService,
    Argon2HasherService,
    {
      provide: 'IHasher',
      useClass: Argon2HasherService,
    },
    ConsoleMailService,
    ResendMailService,
    {
      provide: 'IMailSender',
      inject: [ConsoleMailService, ResendMailService],
      useFactory: (consoleMail: ConsoleMailService, resendMail: ResendMailService) =>
        process.env.RESEND_API_KEY ? resendMail : consoleMail,
    },
    MockStorageProvider,
    CloudinaryService,
    MockNotificationProvider,
    {
      provide: 'INotificationProvider',
      useClass: MockNotificationProvider,
    },
    SimpleCacheService,
    {
      provide: 'ICacheProvider',
      useClass: SimpleCacheService,
    },
  ],
  exports: [
    PrismaService,
    Argon2HasherService,
    'IHasher',
    ConsoleMailService,
    ResendMailService,
    'IMailSender',
    MockStorageProvider,
    CloudinaryService,
    MockNotificationProvider,
    'INotificationProvider',
    SimpleCacheService,
    'ICacheProvider',
  ],
})
export class InfrastructureModule {}
