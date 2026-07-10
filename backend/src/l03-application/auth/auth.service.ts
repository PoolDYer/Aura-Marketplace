import { Injectable, UnauthorizedException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { Argon2HasherService } from '../../l05-infrastructure/security/argon2-hasher.service';
import { DummyMailService } from '../../l05-infrastructure/notifications/dummy-mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsuarioEntity } from '../../l04-domain/auth/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private hasher: Argon2HasherService,
    private mailService: DummyMailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const passwordHash = await this.hasher.hash(dto.password);
    const user = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash,
        rol: dto.rol ?? 'COMPRADOR',
      },
    });

    const token = this.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Registro exitoso. Verifique su correo.' };
  }

  async login(dto: LoginDto) {
    const userData = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!userData) throw new UnauthorizedException('Credenciales inválidas');

    const user = new UsuarioEntity(userData);

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
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { 
          intentosFallidos: user.intentosFallidos,
          bloqueadoHasta: user.bloqueadoHasta
        }
      });
      if (user.isBloqueado()) {
         throw new HttpException('ACCOUNT_LOCKED', HttpStatus.FORBIDDEN);
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    user.resetearIntentosFallidos();
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null }
    });

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

    const user = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (user.estado === 'ACTIVO') {
      return { message: 'Tu correo ya estaba verificado.' };
    }

    if (user.estado === 'SUSPENDIDO') {
      throw new BadRequestException('La cuenta esta suspendida');
    }

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { estado: 'ACTIVO' },
    });

    return { message: 'Correo verificado correctamente. Ya puedes iniciar sesion.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });

    if (!user || user.estado !== 'PENDIENTE') {
      return { message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.' };
    }

    const token = this.createEmailVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Si la cuenta requiere verificacion, enviaremos un nuevo correo.' };
  }

  async refresh(refreshTokenStr: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { usuario: true }
    });

    if (!record || record.revocado || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    return this.generateTokens(new UsuarioEntity(record.usuario));
  }

  async logout(refreshTokenStr: string, accessToken?: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshTokenStr },
      data: { revocado: true }
    });

    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken) as any;
      if (decoded && decoded.exp) {
        await this.prisma.tokenRevocado.create({
          data: {
            token: accessToken,
            expiraEn: new Date(decoded.exp * 1000)
          }
        });
      }
    }

    return { message: 'Cierre de sesión exitoso' };
  }

  private async generateTokens(user: UsuarioEntity) {
    const payload = { sub: user.id, email: user.email, rol: user.rol };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        usuarioId: user.id,
        expiresAt,
      },
    });

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
}
