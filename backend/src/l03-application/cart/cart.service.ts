import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ICartRepository } from '../../l04-domain/ports/cart-repository.interface';
import { IProductRepository } from '../../l04-domain/ports/product-repository.interface';

@Injectable()
export class CartService {
  constructor(
    @Inject('ICartRepository') private readonly cartRepo: ICartRepository,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartRepo.findUnique(userId);

    if (!cart) {
      cart = await this.cartRepo.create(userId);
    }

    return cart;
  }

  async addItem(userId: string, publicacionId: string, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    // Get or create cart
    const cart = await this.getCart(userId);

    // Validate product and stock
    const product = await this.productRepo.findProductById(publicacionId);

    if (!product) throw new NotFoundException('Publicación no encontrada');
    if (product.estado !== 'ACTIVA') throw new BadRequestException('La publicación no está activa');
    
    const availableStock = product.inventario ? (product.inventario.cantidad - product.inventario.cantidadReservada) : 0;
    
    // RD-08: Check max cart items limit
    const currentTotalItems = cart.items.reduce((sum, item) => sum + item.cantidad, 0);
    if (currentTotalItems + cantidad > 50) {
      throw new BadRequestException('El carrito no puede tener más de 50 ítems en total (RD-08)');
    }
    
    // Check if item already in cart
    const existingItem = await this.cartRepo.findItemInCart(cart.id, publicacionId);

    const newQuantity = existingItem ? existingItem.cantidad + cantidad : cantidad;

    if (newQuantity > availableStock) {
      throw new BadRequestException(`Stock insuficiente. Stock disponible: ${availableStock}`);
    }

    if (existingItem) {
      return this.cartRepo.updateItem(existingItem.id, newQuantity);
    } else {
      return this.cartRepo.createItem(cart.id, publicacionId, cantidad);
    }
  }

  async updateItemQuantity(userId: string, itemId: string, cantidad: number) {
    if (cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a 0');

    const cart = await this.getCart(userId);
    
    const item = await this.cartRepo.findItemById(itemId, cart.id);

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

    return this.cartRepo.updateItem(itemId, cantidad);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    
    const item = await this.cartRepo.findItemById(itemId, cart.id);

    if (!item) throw new NotFoundException('Ítem no encontrado en el carrito');

    await this.cartRepo.deleteItem(itemId);

    return { success: true };
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    
    await this.cartRepo.deleteManyItems(cart.id);

    return { success: true };
  }
}
