import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from '../../l01-presentation/auth/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { NeonAuthService } from './neon-auth.service';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { InfrastructureModule } from '../../l05-infrastructure/infrastructure.module';

export async function createJwtModuleOptions(configService: ConfigService) {
  return {
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '15m' as const },
  };
}

@Global()
@Module({
  imports: [
    DatabaseModule,
    InfrastructureModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createJwtModuleOptions,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, NeonAuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, NeonAuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
