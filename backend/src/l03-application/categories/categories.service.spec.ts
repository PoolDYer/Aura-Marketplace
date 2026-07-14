import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService Colocated Edge Cases', () => {
  const createService = () => {
    const categoryRepo = {
      findById: jest.fn(),
      findActiveRootCategories: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const cache = {
      getOrSet: jest.fn((key, ttl, loader) => loader()),
      delete: jest.fn(),
    };
    return {
      service: new CategoriesService(categoryRepo as any, cache as any),
      categoryRepo,
      cache,
    };
  };

  it('findAll should get category list using active-tree cache key and 60s TTL', async () => {
    const { service, categoryRepo, cache } = createService();
    categoryRepo.findActiveRootCategories.mockResolvedValue([{ id: 'cat-1' }]);

    const result = await service.findAll();
    expect(result).toEqual([{ id: 'cat-1' }]);
    expect(cache.getOrSet).toHaveBeenCalledWith('categories:active-tree', 60_000, expect.any(Function));
  });

  it('create should support creating root category without parentId', async () => {
    const { service, categoryRepo, cache } = createService();
    categoryRepo.create.mockResolvedValue({ id: 'cat-root', parentId: null });

    const result = await service.create({ nombre: 'Root Category' });
    expect(result).toEqual({ id: 'cat-root', parentId: null });
    expect(categoryRepo.create).toHaveBeenCalledWith({
      nombre: 'Root Category',
    });
    expect(cache.delete).toHaveBeenCalledWith('categories:active-tree');
  });
});
