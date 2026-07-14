import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { FavoritesModule } from './favorites.module';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from '../../l01-presentation/favorites/favorites.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

describe('FavoritesModule', () => {
  it('should compile FavoritesModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        FavoritesModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(FavoritesService)).toBeDefined();
    expect(moduleRef.get(FavoritesController)).toBeDefined();
  });
});
