import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITokenRevocadoRepository } from '../../../l04-domain/ports/token-revocado-repository.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('ITokenRevocadoRepository') private readonly tokenRevocadoRepo: ITokenRevocadoRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const revoked = await this.tokenRevocadoRepo.findByToken(token);
      if (revoked) {
        throw new UnauthorizedException('Token revocado');
      }
    }
    return { id: payload.sub, sub: payload.sub, email: payload.email, rol: payload.rol };
  }
}
