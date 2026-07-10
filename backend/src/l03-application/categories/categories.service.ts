import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { SimpleCacheService } from '../../l05-infrastructure/cache/simple-cache.service';

@Injectable()
export class CategoriesService {
  private readonly cacheKey = 'categories:active-tree';
  private readonly cacheTtlMs = 60_000;

  constructor(
    private prisma: PrismaService,
    private cache: SimpleCacheService,
  ) {}

  async findAll() {
    return this.cache.getOrSet(this.cacheKey, this.cacheTtlMs, () =>
      this.prisma.categoria.findMany({
        where: { activa: true, parentId: null },
        include: {
          children: {
            include: { children: true },
          },
        },
      }),
    );
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.categoria.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Categoría padre no encontrada');
    }
    const category = await this.prisma.categoria.create({ data: dto });
    this.cache.delete(this.cacheKey);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.categoria.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    
    if (dto.parentId) {
      const parent = await this.prisma.categoria.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Categoría padre no encontrada');
    }

    const category = await this.prisma.categoria.update({ where: { id }, data: dto });
    this.cache.delete(this.cacheKey);
    return category;
  }
}
