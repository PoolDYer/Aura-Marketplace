import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule, createJwtModuleOptions } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from '../../l01-presentation/auth/auth.controller';

describe('AuthModule', () => {
  it('should compile AuthModule and resolve dependencies successfully', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: jest.fn().mockReturnValue('dummy-secret') })
      .compile();

    expect(moduleRef).toBeDefined();
    expect(moduleRef.get(AuthService)).toBeDefined();
    expect(moduleRef.get(AuthController)).toBeDefined();
  });

  it('builds JWT module options from ConfigService', async () => {
    const config = { get: jest.fn().mockReturnValue('secret') };

    await expect(createJwtModuleOptions(config as any)).resolves.toEqual({
      secret: 'secret',
      signOptions: { expiresIn: '15m' },
    });
  });
});
