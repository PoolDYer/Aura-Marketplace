import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITokenRevocadoRepository } from '../../l04-domain/ports/token-revocado-repository.interface';

@Injectable()
export class PrismaTokenRevocadoRepository implements ITokenRevocadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string): Promise<any | null> {
    return this.prisma.tokenRevocado.findUnique({
      where: { token },
    });
  }

  async create(token: string, expiresAt: Date): Promise<any> {
    return this.prisma.tokenRevocado.create({
      data: {
        token,
        expiraEn: expiresAt,
      },
    });
  }
}
