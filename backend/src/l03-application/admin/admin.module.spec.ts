import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from './admin.module';
import { AdminService } from './admin.service';
import { AdminController } from '../../l01-presentation/admin/admin.controller';

describe('AdminModule', () => {
  it('should compile AdminModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        AdminModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AdminService)).toBeDefined();
    expect(moduleRef.get(AdminController)).toBeDefined();
  });
});
