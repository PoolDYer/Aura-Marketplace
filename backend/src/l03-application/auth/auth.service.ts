import { Injectable, UnauthorizedException, BadRequestException, HttpException, HttpStatus, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';
import { IRefreshTokenRepository } from '../../l04-domain/ports/refresh-token-repository.interface';
import { ITokenRevocadoRepository } from '../../l04-domain/ports/token-revocado-repository.interface';
import { IHasher } from '../../l04-domain/ports/hasher.interface';
import { IMailSender } from '../../l04-domain/ports/mail-sender.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { UsuarioEntity } from '../../l04-domain/auth/usuario.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('IUserRepository') private userRepo: IUserRepository,
    @Inject('IRefreshTokenRepository') private refreshTokenRepo: IRefreshTokenRepository,
    @Inject('ITokenRevocadoRepository') private tokenRevocadoRepo: ITokenRevocadoRepository,
    @Inject('IHasher') private hasher: IHasher,
    @Inject('IMailSender') private mailService: IMailSender,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing?.estado === 'PENDIENTE') {
      const passwordHash = await this.hasher.hash(dto.password);
      const pendingUser = await this.userRepo.update(existing.id, {
        nombre: dto.nombre,
        passwordHash,
        rol: dto.rol ?? existing.rol ?? 'COMPRADOR',
      });

      const token = this.createEmailVerificationToken(pendingUser.id);
      await this.mailService.sendVerificationEmail(pendingUser.email, token);

      return { message: 'Ya existia una cuenta pendiente. Enviamos un nuevo correo de verificacion.' };
    }
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const passwordHash = await this.hasher.hash(dto.password);
    const user = await this.userRepo.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol: dto.rol ?? 'COMPRADOR',
    });

    const token = this.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Registro exitoso. Verifique su correo.' };
  }

  async login(dto: LoginDto) {
    const userData = await this.userRepo.findByEmail(dto.email);
    if (!userData) throw new UnauthorizedException('Credenciales inválidas');

    const user = new UsuarioEntity(userData as any);

    if (user.estado === 'PENDIENTE') {
      throw new HttpException('EMAIL_NOT_VERIFIED', HttpStatus.FORBIDDEN);
    }

    if (user.estado === 'SUSPENDIDO') {
      throw new HttpException('ACCOUNT_SUSPENDED', HttpStatus.FORBIDDEN);
    }

    if (user.isBloqueado()) {
      throw new HttpException('ACCOUNT_LOCKED', HttpStatus.FORBIDDEN);
    }

    const validPassword = await this.hasher.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      user.registrarIntentoFallido();
      await this.userRepo.update(user.id, { 
        intentosFallidos: user.intentosFallidos,
        bloqueadoHasta: user.bloqueadoHasta
      });
      if (user.isBloqueado()) {
         throw new HttpException('ACCOUNT_LOCKED', HttpStatus.FORBIDDEN);
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.resetearIntentosFallidos();
    await this.userRepo.update(user.id, { intentosFallidos: 0, bloqueadoHasta: null });

    return this.generateTokens(user);
  }

  async verifyEmail(token: string) {
    let payload: { sub?: string; purpose?: string };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException('El enlace de verificacion es invalido o expiro');
    }

    if (!payload.sub || payload.purpose !== 'email_verification') {
      throw new BadRequestException('El enlace de verificacion es invalido');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (user.estado === 'ACTIVO') {
      await this.syncVerifiedUserWithNeonAuth(user);
      return { message: 'Tu correo ya estaba verificado.' };
    }

    if (user.estado === 'SUSPENDIDO') {
      throw new BadRequestException('La cuenta esta suspendida');
    }

    const verifiedUser = await this.userRepo.update(user.id, { estado: 'ACTIVO' });
    await this.syncVerifiedUserWithNeonAuth(verifiedUser);

    return { message: 'Correo verificado correctamente. Ya puedes iniciar sesion.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user || user.estado !== 'PENDIENTE') {
      return { message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.' };
    }

    const token = this.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user || user.estado === 'SUSPENDIDO') {
      return { message: 'Si el correo existe, enviaremos un enlace para restablecer la contrasena.' };
    }

    const token = this.createPasswordResetToken(user.id, user.passwordHash);
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Si el correo existe, enviaremos un enlace para restablecer la contrasena.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Las contrasenas no coinciden');
    }

    let payload: { sub?: string; purpose?: string; pwdv?: string };

    try {
      payload = await this.jwtService.verifyAsync(dto.token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException('El enlace para restablecer contrasena es invalido o expiro');
    }

    if (!payload.sub || payload.purpose !== 'password_reset' || !payload.pwdv) {
      throw new BadRequestException('El enlace para restablecer contrasena es invalido');
    }

    const user = await this.userRepo.findAuthById(payload.sub);
    if (!user || user.estado === 'SUSPENDIDO') {
      throw new BadRequestException('El enlace para restablecer contrasena es invalido');
    }

    if (this.createPasswordVersion(user.passwordHash) !== payload.pwdv) {
      throw new BadRequestException('El enlace para restablecer contrasena ya fue utilizado');
    }

    const passwordHash = await this.hasher.hash(dto.password);
    await this.userRepo.update(user.id, {
      passwordHash,
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });

    return { message: 'Contrasena actualizada correctamente. Ya puedes iniciar sesion.' };
  }

  async refresh(refreshTokenStr: string) {
    const record = await this.refreshTokenRepo.findByToken(refreshTokenStr);

    if (!record || record.revocado || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return this.generateTokens(new UsuarioEntity(record.usuario as any));
  }

  async logout(refreshTokenStr: string, accessToken?: string) {
    await this.refreshTokenRepo.revokeManyByToken(refreshTokenStr);

    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken) as any;
      if (decoded && decoded.exp) {
        await this.tokenRevocadoRepo.create(accessToken, new Date(decoded.exp * 1000));
      }
    }

    return { message: 'Cierre de sesión exitoso' };
  }

  private async generateTokens(user: UsuarioEntity) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.create(refreshToken, user.id, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    };
  }

  private createEmailVerificationToken(userId: string) {
    return this.jwtService.sign(
      { sub: userId, purpose: 'email_verification' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '1h',
      },
    );
  }

  private createPasswordResetToken(userId: string, passwordHash: string) {
    return this.jwtService.sign(
      { sub: userId, purpose: 'password_reset', pwdv: this.createPasswordVersion(passwordHash) },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '20m',
      },
    );
  }

  private createPasswordVersion(passwordHash: string) {
    return createHash('sha256').update(passwordHash).digest('hex').slice(0, 24);
  }

  private async syncVerifiedUserWithNeonAuth(user: { email: string; nombre?: string | null }) {
    const apiKey = process.env.NEON_API_KEY;
    const projectId = process.env.NEON_PROJECT_ID;
    const branchId = process.env.NEON_BRANCH_ID;
    const syncRequired = process.env.NEON_AUTH_SYNC_REQUIRED === 'true';

    if (!apiKey || !projectId || !branchId) {
      const message = 'Neon Auth sync is not configured. Set NEON_API_KEY, NEON_PROJECT_ID and NEON_BRANCH_ID.';
      if (syncRequired) {
        throw new BadRequestException(message);
      }

      this.logger.warn(message);
      return;
    }

    const response = await fetch(
      `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/auth/users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.nombre || user.email.split('@')[0],
        }),
      },
    );

    if (response.ok || response.status === 409) {
      return;
    }

    const body = await response.text();
    throw new BadRequestException(`No se pudo registrar el usuario en Neon Auth: ${response.status} ${body}`);
  }
}
