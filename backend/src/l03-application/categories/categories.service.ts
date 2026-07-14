import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICategoriaRepository } from '../../l04-domain/ports/categoria-repository.interface';
import { ICacheProvider } from '../../l04-domain/ports/cache-provider.interface';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  private readonly cacheKey = 'categories:active-tree';
  private readonly cacheTtlMs = 60_000;

  constructor(
    @Inject('ICategoriaRepository') private readonly categoryRepo: ICategoriaRepository,
    @Inject('ICacheProvider') private readonly cache: ICacheProvider,
  ) {}

  async findAll() {
    return this.cache.getOrSet(this.cacheKey, this.cacheTtlMs, () =>
      this.categoryRepo.findActiveRootCategories(),
    );
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) throw new NotFoundException('Categoría padre no encontrada');
    }
    const category = await this.categoryRepo.create(dto);
    this.cache.delete(this.cacheKey);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.categoryRepo.findById(id);
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    
    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) throw new NotFoundException('Categoría padre no encontrada');
    }

    const category = await this.categoryRepo.update(id, dto);
    this.cache.delete(this.cacheKey);
    return category;
  }
}
