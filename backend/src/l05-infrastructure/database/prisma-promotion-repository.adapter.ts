import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IPromotionRepository } from '../../l04-domain/ports/promotion-repository.interface';

@Injectable()
export class PrismaPromotionRepository implements IPromotionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCuponByCodigo(codigo: string): Promise<any | null> {
    return this.prisma.cupon.findUnique({
      where: { codigo },
    });
  }

  async findActivePromotionsForProducts(publicacionIds: string[], now: Date): Promise<any[]> {
    return this.prisma.promocion.findMany({
      where: {
        publicacionId: { in: publicacionIds },
        activa: true,
        inicio: { lte: now },
        fin: { gte: now },
      },
    });
  }
}
