import { BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';

describe('CartService Colocated Edge Cases', () => {
  const createService = () => {
    const cartRepo = {
      findUnique: jest.fn(),
      create: jest.fn(),
      findItemInCart: jest.fn(),
      updateItem: jest.fn(),
      createItem: jest.fn(),
      findItemById: jest.fn(),
      deleteItem: jest.fn(),
      deleteManyItems: jest.fn(),
    };
    const productRepo = {
      findProductById: jest.fn(),
    };
    return {
      service: new CartService(cartRepo as any, productRepo as any),
      cartRepo,
      productRepo,
    };
  };

  it('adding duplicate item should increment quantity', async () => {
    const { service, cartRepo, productRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [{ publicacionId: 'prod-1', cantidad: 3 }] });
    productRepo.findProductById.mockResolvedValue({
      id: 'prod-1',
      estado: 'ACTIVA',
      inventario: { cantidad: 10, cantidadReservada: 0 },
    });
    cartRepo.findItemInCart.mockResolvedValue({ id: 'item-1', cantidad: 3, publicacionId: 'prod-1' });
    cartRepo.updateItem.mockResolvedValue({ id: 'item-1', cantidad: 5 });

    const result = await service.addItem('user-1', 'prod-1', 2);
    expect(result).toEqual({ id: 'item-1', cantidad: 5 });
    expect(cartRepo.updateItem).toHaveBeenCalledWith('item-1', 5);
  });

  it('should allow adding item exactly up to available stock limit', async () => {
    const { service, cartRepo, productRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });
    productRepo.findProductById.mockResolvedValue({
      id: 'prod-1',
      estado: 'ACTIVA',
      inventario: { cantidad: 5, cantidadReservada: 2 }, // 3 available
    });
    cartRepo.findItemInCart.mockResolvedValue(null);
    cartRepo.createItem.mockResolvedValue({ id: 'item-1', cantidad: 3 });

    const result = await service.addItem('user-1', 'prod-1', 3);
    expect(result).toEqual({ id: 'item-1', cantidad: 3 });
  });

  it('should reject addition when total cart items exceed 50', async () => {
    const { service, cartRepo, productRepo } = createService();
    cartRepo.findUnique.mockResolvedValue({
      id: 'cart-1',
      items: [
        { publicacionId: 'prod-1', cantidad: 48 },
      ],
    });
    productRepo.findProductById.mockResolvedValue({
      id: 'prod-2',
      estado: 'ACTIVA',
      inventario: { cantidad: 10, cantidadReservada: 0 },
    });
    cartRepo.findItemInCart.mockResolvedValue(null);

    await expect(service.addItem('user-1', 'prod-2', 3)).rejects.toThrow(BadRequestException);
  });
});
