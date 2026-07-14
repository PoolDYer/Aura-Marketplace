import { Test } from '@nestjs/testing';
import { CategoriesModule } from './categories.module';
import { CategoriesService } from './categories.service';
import { CategoriesController } from '../../l01-presentation/categories/categories.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

describe('CategoriesModule', () => {
  it('should compile CategoriesModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        CategoriesModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(CategoriesService)).toBeDefined();
    expect(moduleRef.get(CategoriesController)).toBeDefined();
  });
});
