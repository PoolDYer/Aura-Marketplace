import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(compradorId: string) {
    return this.prisma.favorito.findMany({
      where: { compradorId },
      include: {
        publicacion: {
          include: {
            imagenes: true,
            inventario: true,
          }
        }
      }
    });
  }

  async addFavorite(compradorId: string, publicacionId: string) {
    // Verificamos si la publicación existe
    const pub = await this.prisma.publicacion.findUnique({ where: { id: publicacionId } });
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    return this.prisma.favorito.create({
      data: {
        compradorId,
        publicacionId,
      }
    });
  }

  async removeFavorite(compradorId: string, publicacionId: string) {
    return this.prisma.favorito.delete({
      where: {
        compradorId_publicacionId: {
          compradorId,
          publicacionId,
        }
      }
    });
  }
}
