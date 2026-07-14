import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IReviewRepository } from '../../l04-domain/ports/review-repository.interface';

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByProduct(publicacionId: string): Promise<any[]> {
    return this.prisma.resena.findMany({
      where: { publicacionId },
      include: {
        comprador: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: { creadoAt: 'desc' },
    });
  }

  async create(data: {
    ordenId: string;
    compradorId: string;
    publicacionId: string;
    calificacion: number;
    comentario?: string;
  }): Promise<any> {
    return this.prisma.resena.create({
      data,
    });
  }

  async findFirstReview(ordenId: string, publicacionId: string): Promise<any | null> {
    return this.prisma.resena.findFirst({
      where: {
        ordenId,
        publicacionId,
      },
    });
  }
}
