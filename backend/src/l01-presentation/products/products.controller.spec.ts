import { BadRequestException } from '@nestjs/common';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  const createController = () => {
    const productsService = {
      getProducts: jest.fn(),
      createProduct: jest.fn(),
      getVendorProducts: jest.fn(),
      getVendorProductById: jest.fn(),
      updateVendorProduct: jest.fn(),
      updateVendorProductStatus: jest.fn(),
      deleteVendorProduct: jest.fn(),
      getProductById: jest.fn(),
    };
    const cloudinaryService = {
      uploadProductImage: jest.fn(),
    };
    const controller = new ProductsController(productsService as any, cloudinaryService as any);
    return { controller, productsService, cloudinaryService };
  };

  it('getAll should call productsService.getProducts', async () => {
    const { controller, productsService } = createController();
    productsService.getProducts.mockResolvedValue(['p1']);

    const result = await controller.getAll();
    expect(result).toEqual(['p1']);
    expect(productsService.getProducts).toHaveBeenCalled();
  });

  it('uploadVendorProductImage should throw BadRequestException if file has no buffer', async () => {
    const { controller } = createController();
    await expect(
      controller.uploadVendorProductImage({ user: { sub: 'v-1' } }, null, {})
    ).rejects.toThrow(BadRequestException);
  });
});
