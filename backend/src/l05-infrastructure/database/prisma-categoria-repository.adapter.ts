import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ICategoriaRepository } from '../../l04-domain/ports/categoria-repository.interface';

@Injectable()
export class PrismaCategoriaRepository implements ICategoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any | null> {
    return this.prisma.categoria.findUnique({ where: { id } });
  }

  async findActiveRootCategories(): Promise<any[]> {
    return this.prisma.categoria.findMany({
      where: { activa: true, parentId: null },
      include: {
        children: {
          include: { children: true },
        },
      },
    });
  }

  async create(data: any): Promise<any> {
    return this.prisma.categoria.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.categoria.update({ where: { id }, data });
  }
}
