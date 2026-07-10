import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './l05-infrastructure/database/database.module';
import { AuthModule } from './l03-application/auth/auth.module';
import { UsersModule } from './l03-application/users/users.module';
import { AdminModule } from './l03-application/admin/admin.module';
import { CategoriesModule } from './l03-application/categories/categories.module';
import { ProductsModule } from './l03-application/products/products.module';
import { CartModule } from './l03-application/cart/cart.module';
import { OrdersModule } from './l03-application/orders/orders.module';
import { PaymentsModule } from './l03-application/payments/payments.module';
import { AgentModule } from './l02-agent/agent.module';
import { AuditModule } from './l03-application/audit/audit.module';
import { FavoritesModule } from './l03-application/favorites/favorites.module';
import { ReviewsModule } from './l03-application/reviews/reviews.module';
import { PromotionsModule } from './l03-application/promotions/promotions.module';
import { AuditInterceptor } from './l03-application/audit/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NotificationsModule } from './l03-application/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AdminModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AgentModule,
    AuditModule,
    FavoritesModule,
    ReviewsModule,
    PromotionsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}

