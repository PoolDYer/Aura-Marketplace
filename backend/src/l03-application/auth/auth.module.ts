import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from '../../l01-presentation/auth/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../../l05-infrastructure/database/database.module';
import { Argon2HasherService } from '../../l05-infrastructure/security/argon2-hasher.service';
import { DummyMailService } from '../../l05-infrastructure/notifications/dummy-mail.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Argon2HasherService, DummyMailService],
  exports: [AuthService],
})
export class AuthModule {}
