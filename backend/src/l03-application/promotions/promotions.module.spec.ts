import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PromotionsModule } from './promotions.module';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from '../../l01-presentation/promotions/promotions.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

describe('PromotionsModule', () => {
  it('should compile PromotionsModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        PromotionsModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(PromotionsService)).toBeDefined();
    expect(moduleRef.get(PromotionsController)).toBeDefined();
  });
});
