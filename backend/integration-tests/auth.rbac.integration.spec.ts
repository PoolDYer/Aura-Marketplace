import { Controller, Get, UseGuards, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';

import { JwtAuthGuard } from '../src/l03-application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/l03-application/auth/guards/roles.guard';
import { Public } from '../src/l03-application/auth/decorators/public.decorator';
import { Roles } from '../src/l03-application/auth/decorators/roles.decorator';
import { NeonAuthService } from '../src/l03-application/auth/neon-auth.service';
import { RolUsuario } from '../src/l04-domain/auth/usuario.entity';

// 1. Create a dummy controller with various route access roles
@Controller('test-rbac')
@UseGuards(JwtAuthGuard, RolesGuard)
class TestRbacController {
  @Get('public')
  @Public()
  getPublic() {
    return { message: 'public' };
  }

  @Get('comprador')
  @Roles(RolUsuario.COMPRADOR)
  getComprador() {
    return { message: 'comprador' };
  }

  @Get('vendedor')
  @Roles(RolUsuario.VENDEDOR)
  getVendedor() {
    return { message: 'vendedor' };
  }

  @Get('admin')
  @Roles(RolUsuario.ADMINISTRADOR)
  getAdmin() {
    return { message: 'admin' };
  }
}

describe('Auth RBAC Internal Integration Test', () => {
  let app: INestApplication;
  let mockNeonAuthService: Partial<NeonAuthService>;

  beforeAll(async () => {
    // 2. Mock NeonAuthService token validator
    mockNeonAuthService = {
      validateAccessToken: jest.fn().mockImplementation(async (token: string) => {
        if (token === 'buyer-token') {
          return { id: 'u1', rol: 'COMPRADOR', email: 'buyer@test.com', nombre: 'Buyer' };
        }
        if (token === 'vendor-token') {
          return { id: 'u2', rol: 'VENDEDOR', email: 'vendor@test.com', nombre: 'Vendor' };
        }
        if (token === 'admin-token') {
          return { id: 'u3', rol: 'ADMINISTRADOR', email: 'admin@test.com', nombre: 'Admin' };
        }
        throw new UnauthorizedException('Token inválido');
      }),
      validateLocalAccessToken: jest.fn().mockImplementation(async (token: string) => {
        throw new UnauthorizedException('Token inválido');
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [TestRbacController],
      providers: [
        Reflector,
        JwtAuthGuard,
        RolesGuard,
        { provide: NeonAuthService, useValue: mockNeonAuthService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow access to public routes without authorization header', async () => {
    const res = await request(app.getHttpServer())
      .get('/test-rbac/public')
      .expect(200);

    expect(res.body.message).toBe('public');
  });

  it('should reject access to protected routes when no authorization header is provided', async () => {
    await request(app.getHttpServer())
      .get('/test-rbac/comprador')
      .expect(401);
  });

  it('should allow access to comprador route for buyers, but reject for vendors', async () => {
    // Buyers should succeed
    const res = await request(app.getHttpServer())
      .get('/test-rbac/comprador')
      .set('Authorization', 'Bearer buyer-token')
      .expect(200);

    expect(res.body.message).toBe('comprador');

    // Vendors should be forbidden (403)
    await request(app.getHttpServer())
      .get('/test-rbac/comprador')
      .set('Authorization', 'Bearer vendor-token')
      .expect(403);
  });

  it('should allow access to admin route for admins, but reject for buyers and vendors', async () => {
    // Admins succeed
    const res = await request(app.getHttpServer())
      .get('/test-rbac/admin')
      .set('Authorization', 'Bearer admin-token')
      .expect(200);

    expect(res.body.message).toBe('admin');

    // Buyers forbidden
    await request(app.getHttpServer())
      .get('/test-rbac/admin')
      .set('Authorization', 'Bearer buyer-token')
      .expect(403);

    // Vendors forbidden
    await request(app.getHttpServer())
      .get('/test-rbac/admin')
      .set('Authorization', 'Bearer vendor-token')
      .expect(403);
  });
});
