import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolUsuario } from '../../l04-domain/auth/usuario.entity';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';
import { ITokenRevocadoRepository } from '../../l04-domain/ports/token-revocado-repository.interface';
import { IHasher } from '../../l04-domain/ports/hasher.interface';

type NeonJwtPayload = {
  sub?: string;
  id?: string;
  email?: string;
  name?: string;
};

@Injectable()
export class NeonAuthService {
  private jwks: any;

  constructor(
    private readonly configService: ConfigService,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
    @Inject('ITokenRevocadoRepository') private readonly tokenRevocadoRepo: ITokenRevocadoRepository,
    private readonly jwtService: JwtService,
    @Inject('IHasher') private readonly hasher: IHasher,
  ) {}

  async validateAccessToken(token: string) {
    const payload = await this.verifyToken(token);
    const neonUserId = payload.sub || payload.id;
    const email = payload.email?.toLowerCase();

    if (!neonUserId || !email) {
      throw new UnauthorizedException('Token de Neon incompleto');
    }

    const nombre = this.resolveName(payload.name, email);
    const existingById = await this.userRepo.findById(neonUserId);
    const existingByEmail = existingById
      ? null
      : await this.userRepo.findByEmail(email);

    const user = existingById
      ? await this.userRepo.update(existingById.id, {
          email,
          nombre,
          estado: existingById.estado === 'PENDIENTE' ? 'ACTIVO' : existingById.estado,
        })
      : existingByEmail
        ? await this.userRepo.update(existingByEmail.id, {
            nombre: existingByEmail.nombre || nombre,
            estado: existingByEmail.estado === 'PENDIENTE' ? 'ACTIVO' : existingByEmail.estado,
          })
        : await this.userRepo.create({
            id: neonUserId,
            nombre,
            email,
            passwordHash: 'NEON_AUTH',
            estado: 'ACTIVO',
            rol: 'COMPRADOR',
          });

    if (user.estado === 'SUSPENDIDO') {
      throw new ForbiddenException('ACCOUNT_SUSPENDED');
    }

    return {
      id: user.id,
      sub: user.id,
      neonSub: neonUserId,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };
  }

  async validateLocalAccessToken(token: string) {
    let payload: { sub?: string; email?: string; rol?: RolUsuario };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token local invalido o expirado');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Token local incompleto');
    }

    const revoked = await this.tokenRevocadoRepo.findByToken(token);
    if (revoked) {
      throw new UnauthorizedException('Token revocado');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (user.estado === 'SUSPENDIDO') throw new ForbiddenException('ACCOUNT_SUSPENDED');
    if (user.estado === 'PENDIENTE') throw new ForbiddenException('EMAIL_NOT_VERIFIED');

    return {
      id: user.id,
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };
  }

  async getRegistrationStatus(token: string) {
    const identity = await this.getNeonIdentity(token);
    const existing = await this.findLocalUser(identity.neonUserId, identity.email);

    return {
      registered: Boolean(existing),
      user: existing
        ? {
            id: existing.id,
            nombre: existing.nombre,
            email: existing.email,
            rol: existing.rol,
          }
        : null,
      neonUser: {
        id: identity.neonUserId,
        email: identity.email,
        nombre: identity.nombre,
        emailVerified: true,
      },
    };
  }

  async completeGoogleRegistration(token: string, dto: { nombre: string; password: string; rol?: RolUsuario }) {
    const identity = await this.getNeonIdentity(token);
    const existing = await this.findLocalUser(identity.neonUserId, identity.email);
    const passwordHash = await this.hasher.hash(dto.password);
    const role = dto.rol === 'VENDEDOR' || dto.rol === 'COMPRADOR' ? dto.rol : 'COMPRADOR';

    const user = existing
      ? await this.userRepo.update(existing.id, {
          nombre: dto.nombre.trim(),
          passwordHash,
          estado: existing.estado === 'SUSPENDIDO' ? 'SUSPENDIDO' : 'ACTIVO',
          rol: existing.rol === 'ADMINISTRADOR' ? existing.rol : role,
        })
      : await this.userRepo.create({
          id: identity.neonUserId,
          nombre: dto.nombre.trim(),
          email: identity.email,
          passwordHash,
          estado: 'ACTIVO',
          rol: role,
        });

    if (user.estado === 'SUSPENDIDO') {
      throw new ForbiddenException('ACCOUNT_SUSPENDED');
    }

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async syncProfile(userId: string, dto: { nombre?: string; rol?: RolUsuario }) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (user.estado === 'SUSPENDIDO') throw new ForbiddenException('ACCOUNT_SUSPENDED');

    const requestedRole = dto.rol === 'VENDEDOR' || dto.rol === 'COMPRADOR' ? dto.rol : undefined;
    const nextRole = user.rol === 'ADMINISTRADOR' ? user.rol : requestedRole ?? user.rol;

    const updated = await this.userRepo.update(user.id, {
      nombre: dto.nombre?.trim() || user.nombre,
      rol: nextRole,
      estado: user.estado === 'PENDIENTE' ? 'ACTIVO' : user.estado,
    });

    return {
      user: {
        id: updated.id,
        nombre: updated.nombre,
        email: updated.email,
        rol: updated.rol,
      },
    };
  }

  private async verifyToken(token: string): Promise<NeonJwtPayload> {
    const authUrl = this.getAuthUrl();
    const issuer = new URL(authUrl).origin;
    const jwksUrl = this.configService.get<string>('NEON_AUTH_JWKS_URL') || `${authUrl}/.well-known/jwks.json`;

    if (!this.jwks) {
      const jose = await this.importJose();
      this.jwks = jose.createRemoteJWKSet(new URL(jwksUrl));
    }

    try {
      const jose = await this.importJose();
      const { payload } = await jose.jwtVerify(token, this.jwks, {
        issuer,
        audience: issuer,
      });
      return payload as NeonJwtPayload;
    } catch {
      throw new UnauthorizedException('Token de Neon invalido o expirado');
    }
  }

  private async getNeonIdentity(token: string) {
    const payload = await this.verifyToken(token);
    const neonUserId = payload.sub || payload.id;
    const email = payload.email?.toLowerCase();

    if (!neonUserId || !email) {
      throw new UnauthorizedException('Token de Neon incompleto');
    }

    return {
      neonUserId,
      email,
      nombre: this.resolveName(payload.name, email),
    };
  }

  private async findLocalUser(neonUserId: string, email: string) {
    const existingById = await this.userRepo.findById(neonUserId);
    if (existingById) return existingById;

    return this.userRepo.findByEmail(email);
  }

  private getAuthUrl() {
    const authUrl =
      this.configService.get<string>('NEON_AUTH_BASE_URL') ||
      this.configService.get<string>('NEON_AUTH_URL');

    if (!authUrl) {
      throw new BadRequestException('NEON_AUTH_BASE_URL no esta configurado');
    }

    return authUrl.replace(/\/$/, '');
  }

  private resolveName(name: string | undefined, email: string) {
    return name?.trim() || email.split('@')[0] || 'Usuario Aura';
  }

  private async importJose() {
    return (new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>)('jose');
  }
}
