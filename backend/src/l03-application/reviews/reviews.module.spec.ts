import { Test } from '@nestjs/testing';
import { ReviewsModule } from './reviews.module';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from '../../l01-presentation/reviews/reviews.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

describe('ReviewsModule', () => {
  it('should compile ReviewsModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        ReviewsModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(ReviewsService)).toBeDefined();
    expect(moduleRef.get(ReviewsController)).toBeDefined();
  });
});
