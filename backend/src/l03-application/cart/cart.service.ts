import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private cartInclude = {
    items: {
      include: {
        publicacion: {
          include: {
            inventario: true,
            imagenes: { take: 1 }
          }
        }
      }
    }
  } as const;

  async getCart(userId: string) {
    let cart = await this.prisma.carrito.findUnique({
      where: { compradorId: userId },
      include: this.cartInclude
    });

    if (!cart) {
      cart = await this.prisma.carrito.create({
        data: { compradorId: userId },
        include: this.cartInclude
      });
    }

    return cart;
  }

  async addItem(userId: string, publicacionId: string, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    // Get or create cart
    const cart = await this.getCart(userId);

    // Validate product and stock
    const product = await this.prisma.publicacion.findUnique({
      where: { id: publicacionId },
      include: { inventario: true }
    });

    if (!product) throw new NotFoundException('Publicación no encontrada');
    if (product.estado !== 'ACTIVA') throw new BadRequestException('La publicación no está activa');
    
    const availableStock = product.inventario ? (product.inventario.cantidad - product.inventario.cantidadReservada) : 0;
    
    // RD-08: Check max cart items limit
    const currentTotalItems = cart.items.reduce((sum, item) => sum + item.cantidad, 0);
    if (currentTotalItems + cantidad > 50) {
      throw new BadRequestException('El carrito no puede tener más de 50 ítems en total (RD-08)');
    }
    
    // Check if item already in cart
    const existingItem = await this.prisma.itemCarrito.findUnique({
      where: {
        carritoId_publicacionId: {
          carritoId: cart.id,
          publicacionId: publicacionId
        }
      }
    });

    const newQuantity = existingItem ? existingItem.cantidad + cantidad : cantidad;

    if (newQuantity > availableStock) {
      throw new BadRequestException(`Stock insuficiente. Stock disponible: ${availableStock}`);
    }

    if (existingItem) {
      return this.prisma.itemCarrito.update({
        where: { id: existingItem.id },
        data: { cantidad: newQuantity }
      });
    } else {
      return this.prisma.itemCarrito.create({
        data: {
          carritoId: cart.id,
          publicacionId,
          cantidad
        }
      });
    }
  }

  async updateItemQuantity(userId: string, itemId: string, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    const cart = await this.getCart(userId);
    
    const item = await this.prisma.itemCarrito.findFirst({
      where: { id: itemId, carritoId: cart.id },
      include: { publicacion: { include: { inventario: true } } }
    });

    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    const availableStock = item.publicacion.inventario ? (item.publicacion.inventario.cantidad - item.publicacion.inventario.cantidadReservada) : 0;

    // RD-08: Check max cart items limit
    const currentTotalItems = cart.items.reduce((sum, i) => sum + i.cantidad, 0);
    const addedQuantity = cantidad - item.cantidad;
    if (currentTotalItems + addedQuantity > 50) {
      throw new BadRequestException('El carrito no puede tener más de 50 ítems en total (RD-08)');
    }

    if (cantidad > availableStock) {
      throw new BadRequestException(`Stock insuficiente. Stock disponible: ${availableStock}`);
    }

    return this.prisma.itemCarrito.update({
      where: { id: itemId },
      data: { cantidad }
    });
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    
    const item = await this.prisma.itemCarrito.findFirst({
      where: { id: itemId, carritoId: cart.id }
    });

    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    await this.prisma.itemCarrito.delete({
      where: { id: itemId }
    });

    return { success: true };
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    
    await this.prisma.itemCarrito.deleteMany({
      where: { carritoId: cart.id }
    });

    return { success: true };
  }
}
