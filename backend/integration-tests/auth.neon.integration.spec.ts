import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { NeonAuthService } from '../src/l03-application/auth/neon-auth.service';

describe('Neon Auth Integration Test', () => {
  let neonAuthService: NeonAuthService;
  let configService: ConfigService;

  beforeAll(async () => {
    // Mock dependencies to focus on Neon Auth service and its jose network verification
    const mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    const mockTokenRevocadoRepo = {
      findByToken: jest.fn(),
    };

    const mockHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({}),
      ],
      providers: [
        NeonAuthService,
        { provide: 'IUserRepository', useValue: mockUserRepo },
        { provide: 'ITokenRevocadoRepository', useValue: mockTokenRevocadoRepo },
        { provide: 'IHasher', useValue: mockHasher },
      ],
    }).compile();

    neonAuthService = moduleRef.get(NeonAuthService);
    configService = moduleRef.get(ConfigService);
  });

  it('should fetch JWKS keys from Neon Auth endpoint and reject invalid token', async () => {
    const jwksUrl = configService.get('NEON_AUTH_JWKS_URL');
    expect(jwksUrl).toBeDefined();
    expect(jwksUrl).toContain('neonauth');

    // Verify network connectivity by attempting to fetch the JWKS URL directly
    const response = await fetch(jwksUrl);
    expect(response.ok).toBe(true);

    const keysBody = await response.json();
    expect(keysBody).toBeDefined();
    expect(keysBody.keys).toBeDefined();
    expect(Array.isArray(keysBody.keys)).toBe(true);

    // Call validateAccessToken with a dummy token, expecting it to be rejected cryptographically
    // (this confirms that the remote JWK set was queried and the token validation pipeline is functional)
    const dummyToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImR1bW15In0.eyN1c2VySWQiOiIxMjMifQ.signature';
    await expect(neonAuthService.validateAccessToken(dummyToken)).rejects.toThrow(UnauthorizedException);
  });
});
