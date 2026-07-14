import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IRefreshTokenRepository } from '../../l04-domain/ports/refresh-token-repository.interface';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<any | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { usuario: true },
    });
  }

  async create(token: string, userId: string, expiresAt: Date): Promise<any> {
    return this.prisma.refreshToken.create({
      data: {
        token,
        usuarioId: userId,
        expiresAt,
      },
    });
  }

  async revokeManyByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revocado: true },
    });
  }
}
