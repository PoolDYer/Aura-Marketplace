import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './prisma-user-repository.adapter';
import { PrismaRefreshTokenRepository } from './prisma-refresh-token-repository.adapter';
import { PrismaTokenRevocadoRepository } from './prisma-token-revocado-repository.adapter';
import { PrismaProductRepository } from './prisma-product-repository.adapter';
import { PrismaCategoriaRepository } from './prisma-categoria-repository.adapter';
import { PrismaCartRepository } from './prisma-cart-repository.adapter';
import { PrismaOrderRepository } from './prisma-order-repository.adapter';
import { PrismaReviewRepository } from './prisma-review-repository.adapter';
import { PrismaFavoriteRepository } from './prisma-favorite-repository.adapter';
import { PrismaPromotionRepository } from './prisma-promotion-repository.adapter';
import { PrismaNotificationRepository } from './prisma-notification-repository.adapter';
import { PrismaAuditRepository } from './prisma-audit-repository.adapter';
import { PrismaAdminRepository } from './prisma-admin-repository.adapter';
import { PrismaConversationRepository } from './prisma-conversation-repository.adapter';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: 'ITokenRevocadoRepository',
      useClass: PrismaTokenRevocadoRepository,
    },
    {
      provide: 'IProductRepository',
      useClass: PrismaProductRepository,
    },
    {
      provide: 'ICategoriaRepository',
      useClass: PrismaCategoriaRepository,
    },
    {
      provide: 'ICartRepository',
      useClass: PrismaCartRepository,
    },
    {
      provide: 'IOrderRepository',
      useClass: PrismaOrderRepository,
    },
    {
      provide: 'IReviewRepository',
      useClass: PrismaReviewRepository,
    },
    {
      provide: 'IFavoriteRepository',
      useClass: PrismaFavoriteRepository,
    },
    {
      provide: 'IPromotionRepository',
      useClass: PrismaPromotionRepository,
    },
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'IAuditRepository',
      useClass: PrismaAuditRepository,
    },
    {
      provide: 'IAdminRepository',
      useClass: PrismaAdminRepository,
    },
    {
      provide: 'IConversationRepository',
      useClass: PrismaConversationRepository,
    },
  ],
  exports: [
    PrismaService,
    'IUserRepository',
    'IRefreshTokenRepository',
    'ITokenRevocadoRepository',
    'IProductRepository',
    'ICategoriaRepository',
    'ICartRepository',
    'IOrderRepository',
    'IReviewRepository',
    'IFavoriteRepository',
    'IPromotionRepository',
    'INotificationRepository',
    'IAuditRepository',
    'IAdminRepository',
    'IConversationRepository',
  ],
})
export class DatabaseModule {}
