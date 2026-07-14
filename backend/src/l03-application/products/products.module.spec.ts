import { Test } from '@nestjs/testing';
import { ProductsModule } from './products.module';
import { ProductsService } from './products.service';
import { ProductsController } from '../../l01-presentation/products/products.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

describe('ProductsModule', () => {
  it('should compile ProductsModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        ProductsModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(ProductsService)).toBeDefined();
    expect(moduleRef.get(ProductsController)).toBeDefined();
  });
});
