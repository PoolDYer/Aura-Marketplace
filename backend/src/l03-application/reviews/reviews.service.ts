import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';

interface CreateReviewDto {
  publicacionId: string;
  calificacion: number;
  comentario?: string;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getReviews(publicacionId: string) {
    return this.prisma.resena.findMany({
      where: { publicacionId },
      include: {
        comprador: {
          select: {
            nombre: true,
          }
        }
      },
      orderBy: { creadoAt: 'desc' },
    });
  }

  async addReview(compradorId: string, dto: CreateReviewDto) {
    // Verificar que la publicación existe
    const pub = await this.prisma.publicacion.findUnique({ where: { id: dto.publicacionId } });
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    // Verificar si el comprador realmente compró el producto (RN: compra verificada)
    // Buscamos una orden no cancelada que contenga el producto
    const ordenValida = await this.prisma.orden.findFirst({
      where: {
        compradorId,
        estado: { not: 'CANCELADA' },
        lineas: {
          some: {
            publicacionId: dto.publicacionId,
          }
        }
      }
    });

    if (!ordenValida) {
      throw new ForbiddenException('Solo puedes reseñar productos que has comprado.');
    }

    // Opcional: Verificar si ya dejó reseña para esta orden
    const existingReview = await this.prisma.resena.findFirst({
      where: {
        ordenId: ordenValida.id,
        publicacionId: dto.publicacionId,
      }
    });

    if (existingReview) {
      throw new ForbiddenException('Ya has dejado una reseña para esta compra.');
    }

    return this.prisma.resena.create({
      data: {
        ordenId: ordenValida.id,
        compradorId,
        publicacionId: dto.publicacionId,
        calificacion: dto.calificacion,
        comentario: dto.comentario,
      }
    });
  }
}
