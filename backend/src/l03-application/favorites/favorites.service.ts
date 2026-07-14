import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IFavoriteRepository } from '../../l04-domain/ports/favorite-repository.interface';
import { IProductRepository } from '../../l04-domain/ports/product-repository.interface';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject('IFavoriteRepository') private readonly favoriteRepo: IFavoriteRepository,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
  ) {}

  async getFavorites(compradorId: string) {
    return this.favoriteRepo.findManyByUser(compradorId);
  }

  async addFavorite(compradorId: string, publicacionId: string) {
    // Verificamos si la publicación existe
    const pub = await this.productRepo.findProductById(publicacionId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    return this.favoriteRepo.create(compradorId, publicacionId);
  }

  async removeFavorite(compradorId: string, publicacionId: string) {
    return this.favoriteRepo.delete(compradorId, publicacionId);
  }
}
