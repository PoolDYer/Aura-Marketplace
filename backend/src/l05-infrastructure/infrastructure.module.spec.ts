import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure.module';
import { PrismaService } from './database/prisma.service';
import { SimpleCacheService } from './cache/simple-cache.service';

describe('InfrastructureModule', () => {
  it('should compile the module and resolve providers successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        InfrastructureModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(PrismaService)).toBeDefined();
    expect(moduleRef.get(SimpleCacheService)).toBeDefined();
  });
});
