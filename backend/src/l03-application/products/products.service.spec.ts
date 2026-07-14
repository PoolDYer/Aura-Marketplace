import { BadRequestException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EstadoPublicacion } from '../../l04-domain/products/product.enums';
import { CreateProductDto, ProductsService } from './products.service';

describe('ProductsService', () => {
  const createService = () => {
    const productRepo = {
      create: jest.fn(),
      findManyByVendor: jest.fn(),
      findOneByVendorAndId: jest.fn(),
      update: jest.fn(),
      upsertInventario: jest.fn(),
      deleteManyImagenes: jest.fn(),
      createManyImagenes: jest.fn(),
      findActiveProducts: jest.fn(),
      findActiveProductById: jest.fn(),
      updateStatus: jest.fn(),
    };
    const categoryRepo = {
      findById: jest.fn(),
      findActiveRootCategories: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const cache = {
      getOrSet: jest.fn((key, ttl, loader) => loader()),
      delete: jest.fn(),
      deleteByPrefix: jest.fn(),
    };
    return {
      service: new ProductsService(productRepo as any, categoryRepo as any, cache as any),
      productRepo,
      categoryRepo,
      cache,
    };
  };

  const productDto = {
    nombre: 'Polo',
    descripcion: 'Algodon',
    precio: 79,
    categoriaId: 'cat-1',
    stock: 5,
    imagenUrl: ' https://img.test/a.png ',
    imageUrls: ['https://img.test/b.png', 'https://img.test/a.png', ''],
  };

  it('transforms numeric DTO fields', () => {
    const dto = plainToInstance(CreateProductDto, { precio: '12.5', stock: '3' });

    expect(dto.precio).toBe(12.5);
    expect(dto.stock).toBe(3);
  });

  it('creates products with inventory, normalized images and default draft status', async () => {
    const { service, productRepo, categoryRepo, cache } = createService();
    categoryRepo.findById.mockResolvedValue({ id: 'cat-1' });
    productRepo.create.mockResolvedValue({ id: 'prod-1' });

    await expect(service.createProduct('vendor-1', productDto as any)).resolves.toEqual({ id: 'prod-1' });

    expect(productRepo.create).toHaveBeenCalledWith(
      'vendor-1',
      productDto,
      ['https://img.test/b.png', 'https://img.test/a.png'],
    );
    expect(cache.delete).toHaveBeenCalledWith('products:vendor:vendor-1');
  });

  it('rejects invalid price and missing category on create', async () => {
    const { service, productRepo, categoryRepo } = createService();

    await expect(service.createProduct('vendor-1', { ...productDto, precio: 0 } as any)).rejects.toBeInstanceOf(BadRequestException);
    categoryRepo.findById.mockResolvedValue(null);
    await expect(service.createProduct('vendor-1', productDto as any)).rejects.toBeInstanceOf(NotFoundException);

    categoryRepo.findById.mockResolvedValue({ id: 'cat-1' });
    productRepo.create.mockResolvedValue({ id: 'prod-no-images' });
    await expect(service.createProduct('vendor-1', { ...productDto, stock: -2, imagenUrl: '', imageUrls: [] } as any)).resolves.toEqual({
      id: 'prod-no-images',
    });
    await expect(service.createProduct('vendor-1', { ...productDto, stock: undefined } as any)).resolves.toEqual({
      id: 'prod-no-images',
    });
  });

  it('reads public and vendor product lists through cache', async () => {
    const { service, productRepo, cache } = createService();
    productRepo.findActiveProducts.mockResolvedValue([{ id: 'prod-1' }]);
    productRepo.findManyByVendor.mockResolvedValue([{ id: 'prod-1' }]);

    await expect(service.getProducts()).resolves.toEqual([{ id: 'prod-1' }]);
    await expect(service.getVendorProducts('vendor-1')).resolves.toEqual([{ id: 'prod-1' }]);

    expect(cache.getOrSet).toHaveBeenCalledWith('products:active', 60_000, expect.any(Function));
    expect(cache.getOrSet).toHaveBeenCalledWith('products:vendor:vendor-1', 30_000, expect.any(Function));
  });

  it('returns active product detail or throws when missing', async () => {
    const { service, productRepo } = createService();
    productRepo.findActiveProductById.mockResolvedValueOnce({ id: 'prod-1' }).mockResolvedValueOnce(null);

    await expect(service.getProductById('prod-1')).resolves.toEqual({ id: 'prod-1' });
    await expect(service.getProductById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns vendor product detail or throws when missing', async () => {
    const { service, productRepo } = createService();
    productRepo.findOneByVendorAndId.mockResolvedValueOnce({ id: 'prod-1' }).mockResolvedValueOnce(null);

    await expect(service.getVendorProductById('vendor-1', 'prod-1')).resolves.toEqual({ id: 'prod-1' });
    await expect(service.getVendorProductById('vendor-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates vendor product fields, stock and image collection', async () => {
    const { service, productRepo, cache } = createService();
    productRepo.findOneByVendorAndId
      .mockResolvedValueOnce({ id: 'prod-1', inventario: { cantidadReservada: 2 } })
      .mockResolvedValueOnce({ id: 'prod-1', imagenes: [] });
    productRepo.update.mockResolvedValue({ id: 'prod-1' });

    await expect(
      service.updateVendorProduct('vendor-1', 'prod-1', {
        precio: 100,
        stock: 7,
        imageUrls: ['one.png', 'two.png'],
      } as any),
    ).resolves.toEqual({ id: 'prod-1', imagenes: [] });

    expect(productRepo.upsertInventario).toHaveBeenCalledWith('prod-1', 7, 2);
    expect(productRepo.deleteManyImagenes).toHaveBeenCalledWith('prod-1');
    expect(productRepo.createManyImagenes).toHaveBeenCalledWith([
      { publicacionId: 'prod-1', url: 'one.png', orden: 0, activa: true },
      { publicacionId: 'prod-1', url: 'two.png', orden: 1, activa: true },
    ]);
    expect(cache.delete).toHaveBeenCalledWith('products:detail:prod-1');
  });

  it('updates products without stock/images and clears global vendor caches', async () => {
    const { service, productRepo, cache } = createService();
    productRepo.findOneByVendorAndId
      .mockResolvedValueOnce({ id: 'prod-1', inventario: null })
      .mockResolvedValueOnce({ id: 'prod-1' });
    productRepo.update.mockResolvedValue({ id: 'prod-1' });

    await expect(service.updateVendorProduct('vendor-1', 'prod-1', { nombre: 'Nuevo' })).resolves.toEqual({ id: 'prod-1' });
    (service as any).clearProductCaches();
    expect(cache.deleteByPrefix).toHaveBeenCalledWith('products:vendor:');
    expect((service as any).normalizeImageUrls({ imageUrls: 'not-array', imagenUrl: ' solo.png ' })).toEqual(['solo.png']);
  });

  it('updates stock when the product has no inventory record', async () => {
    const { service, productRepo } = createService();
    productRepo.findOneByVendorAndId
      .mockResolvedValueOnce({ id: 'prod-1', inventario: null })
      .mockResolvedValueOnce({ id: 'prod-1' });
    productRepo.update.mockResolvedValue({ id: 'prod-1' });

    await expect(service.updateVendorProduct('vendor-1', 'prod-1', { stock: 4 })).resolves.toEqual({ id: 'prod-1' });
    expect(productRepo.upsertInventario).toHaveBeenCalledWith('prod-1', 4, 0);
  });

  it('rejects unauthorized or invalid vendor updates', async () => {
    const { service, productRepo } = createService();
    productRepo.findOneByVendorAndId.mockResolvedValueOnce(null);
    await expect(service.updateVendorProduct('vendor-1', 'prod-1', {})).rejects.toBeInstanceOf(NotFoundException);

    productRepo.findOneByVendorAndId.mockResolvedValueOnce({ id: 'prod-1', inventario: null });
    await expect(service.updateVendorProduct('vendor-1', 'prod-1', { precio: -1 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates status and soft deletes vendor products after permission checks', async () => {
    const { service, productRepo } = createService();
    productRepo.findOneByVendorAndId
      .mockResolvedValueOnce({ id: 'prod-1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'prod-2' })
      .mockResolvedValueOnce(null);
    productRepo.updateStatus
      .mockResolvedValueOnce({ id: 'prod-1', estado: EstadoPublicacion.ACTIVA })
      .mockResolvedValueOnce({ id: 'prod-2', estado: EstadoPublicacion.ELIMINADA });

    await expect(service.updateVendorProductStatus('vendor-1', 'prod-1', EstadoPublicacion.ACTIVA)).resolves.toMatchObject({
      estado: EstadoPublicacion.ACTIVA,
    });
    await expect(service.updateVendorProductStatus('vendor-1', 'missing', EstadoPublicacion.ACTIVA)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deleteVendorProduct('vendor-1', 'prod-2')).resolves.toMatchObject({ estado: EstadoPublicacion.ELIMINADA });
    await expect(service.deleteVendorProduct('vendor-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
