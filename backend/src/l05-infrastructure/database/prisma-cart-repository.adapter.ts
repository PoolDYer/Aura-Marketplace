import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ICartRepository } from '../../l04-domain/ports/cart-repository.interface';
import { BLOCKED_PRODUCT_IMAGE_URLS } from '../../l04-domain/products/image-url-policy';

@Injectable()
export class PrismaCartRepository implements ICartRepository {
  private cartInclude = {
    items: {
      include: {
        publicacion: {
          include: {
            inventario: true,
            imagenes: {
              where: { activa: true, url: { notIn: BLOCKED_PRODUCT_IMAGE_URLS } },
              orderBy: { orden: 'asc' },
              take: 1,
            },
          },
        },
      },
    },
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async findUnique(compradorId: string): Promise<any | null> {
    return this.prisma.carrito.findUnique({
      where: { compradorId },
      include: this.cartInclude,
    });
  }

  async create(compradorId: string): Promise<any> {
    return this.prisma.carrito.create({
      data: { compradorId },
      include: this.cartInclude,
    });
  }

  async findItemInCart(carritoId: string, publicacionId: string): Promise<any | null> {
    return this.prisma.itemCarrito.findUnique({
      where: {
        carritoId_publicacionId: {
          carritoId,
          publicacionId,
        },
      },
    });
  }

  async updateItem(id: string, cantidad: number): Promise<any> {
    return this.prisma.itemCarrito.update({
      where: { id },
      data: { cantidad },
    });
  }

  async createItem(carritoId: string, publicacionId: string, cantidad: number): Promise<any> {
    return this.prisma.itemCarrito.create({
      data: {
        carritoId,
        publicacionId,
        cantidad,
      },
    });
  }

  async findItemById(id: string, carritoId: string): Promise<any | null> {
    return this.prisma.itemCarrito.findFirst({
      where: { id, carritoId },
      include: { publicacion: { include: { inventario: true } } },
    });
  }

  async deleteItem(id: string): Promise<any> {
    return this.prisma.itemCarrito.delete({
      where: { id },
    });
  }

  async deleteManyItems(carritoId: string): Promise<any> {
    return this.prisma.itemCarrito.deleteMany({
      where: { carritoId },
    });
  }
}
