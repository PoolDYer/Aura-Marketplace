import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IReviewRepository } from '../../l04-domain/ports/review-repository.interface';
import { IProductRepository } from '../../l04-domain/ports/product-repository.interface';
import { IOrderRepository } from '../../l04-domain/ports/order-repository.interface';

interface CreateReviewDto {
  publicacionId: string;
  calificacion: number;
  comentario?: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @Inject('IReviewRepository') private readonly reviewRepo: IReviewRepository,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
  ) {}

  async getReviews(publicacionId: string) {
    return this.reviewRepo.findManyByProduct(publicacionId);
  }

  async addReview(compradorId: string, dto: CreateReviewDto) {
    // Verificar que la publicación existe
    const pub = await this.productRepo.findProductById(dto.publicacionId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    // Verificar si el comprador realmente compró el producto (RN: compra verificada)
    // Buscamos una orden no cancelada que contenga el producto
    const ordenValida = await this.orderRepo.findFirstOrderContainingProduct(compradorId, dto.publicacionId);

    if (!ordenValida) {
      throw new ForbiddenException('Solo puedes reseñar productos que has comprado.');
    }

    // Opcional: Verificar si ya dejó reseña para esta orden
    const existingReview = await this.reviewRepo.findFirstReview(ordenValida.id, dto.publicacionId);

    if (existingReview) {
      throw new ForbiddenException('Ya has dejado una reseña para esta compra.');
    }

    return this.reviewRepo.create({
      ordenId: ordenValida.id,
      compradorId,
      publicacionId: dto.publicacionId,
      calificacion: dto.calificacion,
      comentario: dto.comentario,
    });
  }
}
