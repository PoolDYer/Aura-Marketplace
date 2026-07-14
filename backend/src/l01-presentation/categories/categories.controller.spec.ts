import { CategoriesController } from './categories.controller';

describe('CategoriesController', () => {
  const createController = () => {
    const categoriesService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    const controller = new CategoriesController(categoriesService as any);
    return { controller, categoriesService };
  };

  it('findAll should call categoriesService.findAll', () => {
    const { controller, categoriesService } = createController();
    categoriesService.findAll.mockReturnValue([{ id: 'cat-1' }]);

    const result = controller.findAll();
    expect(result).toEqual([{ id: 'cat-1' }]);
    expect(categoriesService.findAll).toHaveBeenCalled();
  });

  it('create should call categoriesService.create', () => {
    const { controller, categoriesService } = createController();
    categoriesService.create.mockReturnValue({ id: 'cat-1' });

    const result = controller.create({ nombre: 'Electronics' });
    expect(result).toEqual({ id: 'cat-1' });
    expect(categoriesService.create).toHaveBeenCalledWith({ nombre: 'Electronics' });
  });
});
