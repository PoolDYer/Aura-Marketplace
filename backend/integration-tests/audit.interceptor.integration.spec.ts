import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Controller, Post, INestApplication, UseInterceptors, Get, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { AuditInterceptor } from '../src/l03-application/audit/audit.interceptor';
import { AuditService } from '../src/l03-application/audit/audit.service';
import { PrismaService } from '../src/l05-infrastructure/database/prisma.service';
import { PrismaAuditRepository } from '../src/l05-infrastructure/database/prisma-audit-repository.adapter';
import { ExecutionContext } from '@nestjs/common';

// Custom Guard to inject a mock user into request for testing audit logging
@Injectable()
class MockAuthGuard {
  static userId: string = 'dummy';
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: MockAuthGuard.userId }; // Populate userId for interceptor
    return true;
  }
}

// 1. Create a dummy controller for testing the AuditInterceptor
@Controller('api/test-audit')
@UseInterceptors(AuditInterceptor)
class TestAuditController {
  @Post('create')
  createItem() {
    return { ok: true };
  }

  @Post('fail')
  failItem() {
    throw new Error('Database Error');
  }

  @Get('query')
  queryItem() {
    return { data: 'no-audit' }; // GET on non-admin should not audit
  }
}

describe('Audit Interceptor Internal Integration Test', () => {
  jest.setTimeout(25000);
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestAuditController],
      providers: [
        PrismaService,
        AuditService,
        {
          provide: 'IAuditRepository',
          useClass: PrismaAuditRepository,
        },
      ],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();
    
    // Globally apply mock auth guard to populate request.user
    app.useGlobalGuards(new MockAuthGuard());
    
    await app.init();
    await prisma.$connect();

    // Clean up any stale test user
    await prisma.usuario.deleteMany({
      where: { email: 'audit-test-buyer@aura.com' },
    });

    // Create a real test user in the database to satisfy the foreign key constraint
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Audit Test Buyer',
        email: 'audit-test-buyer@aura.com',
        passwordHash: 'hash',
        rol: 'COMPRADOR',
        estado: 'ACTIVO',
      },
    });
    testUserId = user.id;
    MockAuthGuard.userId = user.id;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
    await app.close();
  });

  async function cleanup() {
    if (testUserId) {
      // 1. Delete audit logs associated with this user
      await prisma.auditoria.deleteMany({
        where: { usuarioId: testUserId },
      });
      // 2. Delete the user
      await prisma.usuario.deleteMany({
        where: { id: testUserId },
      });
    }
  }

  it('should log audit event on successful mutations', async () => {
    // 1. Call POST create
    await request(app.getHttpServer())
      .post('/api/test-audit/create')
      .expect(201);

    // Wait a brief moment for async tap interceptor
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Query database for logged auditoria record
    const logs = await prisma.auditoria.findMany({
      where: { usuarioId: testUserId },
      orderBy: { timestamp: 'desc' },
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].accion).toBe('POST');
    expect(logs[0].modulo).toBe('test-audit');
    expect(logs[0].resultado).toBe('EXITO');
  });

  it('should log audit event with FAIL result on failures', async () => {
    // 1. Call POST fail
    await request(app.getHttpServer())
      .post('/api/test-audit/fail')
      .expect(500);

    // Wait a brief moment
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Query database for logged auditoria record
    const logs = await prisma.auditoria.findMany({
      where: {
        usuarioId: testUserId,
        resultado: 'FALLO',
      },
    });

    expect(logs).toHaveLength(1);
    expect(logs[0].accion).toBe('POST');
    expect(logs[0].modulo).toBe('test-audit');
  });

  it('should NOT log audit event on GET queries', async () => {
    const initialLogsCount = await prisma.auditoria.count({
      where: { usuarioId: testUserId },
    });

    // Call GET query
    await request(app.getHttpServer())
      .get('/api/test-audit/query')
      .expect(200);

    // Wait a brief moment
    await new Promise((resolve) => setTimeout(resolve, 800));

    const finalLogsCount = await prisma.auditoria.count({
      where: { usuarioId: testUserId },
    });

    // Count should remain unchanged
    expect(finalLogsCount).toBe(initialLogsCount);
  });
});
