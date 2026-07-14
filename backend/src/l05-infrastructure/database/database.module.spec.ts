import { Test } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { PrismaService } from './prisma.service';

describe('DatabaseModule', () => {
  it('should compile DatabaseModule and resolve PrismaService successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(PrismaService)).toBeDefined();
  });
});
