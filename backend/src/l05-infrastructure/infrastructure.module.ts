import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { Argon2HasherService } from './security/argon2-hasher.service';
import { DummyMailService } from './notifications/dummy-mail.service';
import { MockStorageProvider } from './storage/mock-storage.provider';
import { MockNotificationProvider } from './notifications/mock-notification.provider';
import { CloudinaryService } from './storage/cloudinary.service';
import { SimpleCacheService } from './cache/simple-cache.service';

@Module({
  providers: [
    PrismaService,
    Argon2HasherService,
    DummyMailService,
    MockStorageProvider,
    CloudinaryService,
    MockNotificationProvider,
    SimpleCacheService,
  ],
  exports: [
    PrismaService,
    Argon2HasherService,
    DummyMailService,
    MockStorageProvider,
    CloudinaryService,
    MockNotificationProvider,
    SimpleCacheService,
  ],
})
export class InfrastructureModule {}
