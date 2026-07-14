import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IFavoriteRepository } from '../../l04-domain/ports/favorite-repository.interface';

@Injectable()
export class PrismaFavoriteRepository implements IFavoriteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(compradorId: string): Promise<any[]> {
    return this.prisma.favorito.findMany({
      where: { compradorId },
      include: {
        publicacion: {
          include: {
            imagenes: true,
            inventario: true,
          },
        },
      },
    });
  }

  async create(compradorId: string, publicacionId: string): Promise<any> {
    return this.prisma.favorito.create({
      data: {
        compradorId,
        publicacionId,
      },
    });
  }

  async delete(compradorId: string, publicacionId: string): Promise<any> {
    return this.prisma.favorito.delete({
      where: {
        compradorId_publicacionId: {
          compradorId,
          publicacionId,
        },
      },
    });
  }
}
