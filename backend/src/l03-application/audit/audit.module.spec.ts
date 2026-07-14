import { Test } from '@nestjs/testing';
import { AuditModule } from './audit.module';
import { AuditService } from './audit.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';

describe('AuditModule', () => {
  it('should compile AuditModule and resolve AuditService successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule, AuditModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AuditService)).toBeDefined();
  });
});
