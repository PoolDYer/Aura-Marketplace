import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from './cart.module';
import { CartService } from './cart.service';
import { CartController } from '../../l01-presentation/cart/cart.controller';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

describe('CartModule', () => {
  it('should compile CartModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        CartModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(CartService)).toBeDefined();
    expect(moduleRef.get(CartController)).toBeDefined();
  });
});
