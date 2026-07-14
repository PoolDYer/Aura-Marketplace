import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IProductRepository } from '../../l04-domain/ports/product-repository.interface';
import { EstadoPublicacion } from '../../l04-domain/products/product.enums';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(vendedorId: string, data: any, imageUrls: string[]): Promise<any> {
    return this.prisma.publicacion.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        vendedorId,
        categoriaId: data.categoriaId,
        estado: data.estado ?? EstadoPublicacion.BORRADOR,
        inventario: {
          create: {
            cantidad: Math.max(0, Number(data.stock ?? 0)),
            cantidadReservada: 0,
          },
        },
        imagenes: imageUrls.length
          ? {
              create: imageUrls.map((url, index) => ({
                url,
                orden: index,
                activa: true,
              })),
            }
          : undefined,
      },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  async findManyByVendor(vendedorId: string): Promise<any[]> {
    return this.prisma.publicacion.findMany({
      where: {
        vendedorId,
        estado: { not: EstadoPublicacion.ELIMINADA },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  async findOneByVendorAndId(vendedorId: string, id: string): Promise<any | null> {
    return this.prisma.publicacion.findFirst({
      where: { id, vendedorId, estado: { not: EstadoPublicacion.ELIMINADA } },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.publicacion.update({
      where: { id },
      data,
    });
  }

  async upsertInventario(publicacionId: string, availableStock: number, reservedStock: number): Promise<any> {
    return this.prisma.inventario.upsert({
      where: { publicacionId },
      create: {
        publicacionId,
        cantidad: availableStock,
        cantidadReservada: 0,
      },
      update: {
        cantidad: reservedStock + availableStock,
      },
    });
  }

  async deleteManyImagenes(publicacionId: string): Promise<any> {
    return this.prisma.imagenPublicacion.deleteMany({
      where: { publicacionId },
    });
  }

  async createManyImagenes(data: any[]): Promise<any> {
    return this.prisma.imagenPublicacion.createMany({
      data,
    });
  }

  async findActiveProducts(): Promise<any[]> {
    return this.prisma.publicacion.findMany({
      where: { estado: EstadoPublicacion.ACTIVA },
      include: {
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
        promociones: {
          where: { activa: true },
        },
      },
    });
  }

  async findActiveProductById(id: string): Promise<any | null> {
    return this.prisma.publicacion.findFirst({
      where: { id, estado: EstadoPublicacion.ACTIVA },
      include: {
        vendedor: {
          select: { id: true, nombre: true },
        },
        categoria: true,
        inventario: true,
        imagenes: {
          where: { activa: true },
          orderBy: { orden: 'asc' },
        },
        promociones: {
          where: { activa: true },
        },
      },
    });
  }

  async findProductById(id: string): Promise<any | null> {
    return this.prisma.publicacion.findUnique({
      where: { id },
      include: { inventario: true },
    });
  }

  async updateStatus(id: string, estado: EstadoPublicacion): Promise<any> {
    return this.prisma.publicacion.update({
      where: { id },
      data: { estado },
    });
  }
}
