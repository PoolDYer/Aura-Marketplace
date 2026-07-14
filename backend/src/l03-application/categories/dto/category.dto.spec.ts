import { validate } from 'class-validator';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

describe('category.dto', () => {
  describe('CreateCategoryDto', () => {
    it('should validate a correct category creation object', async () => {
      const dto = new CreateCategoryDto();
      dto.nombre = 'Electronics';
      dto.descripcion = 'Gadgets and devices';
      dto.parentId = 'parent-uuid';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should require nombre but other fields are optional', async () => {
      const dto = new CreateCategoryDto();
      dto.nombre = 'Books';
      let errors = await validate(dto);
      expect(errors.length).toBe(0);

      // missing nombre (undefined is invalid as @IsString expects a string)
      const dtoInvalid = new CreateCategoryDto();
      errors = await validate(dtoInvalid);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'nombre')).toBe(true);
    });
  });

  describe('UpdateCategoryDto', () => {
    it('should validate an empty or correct update object', async () => {
      const dto = new UpdateCategoryDto();
      let errors = await validate(dto);
      expect(errors.length).toBe(0);

      dto.nombre = 'New Name';
      dto.activa = false;
      errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject non-boolean activa', async () => {
      const dto = new UpdateCategoryDto();
      dto.activa = 'not-a-boolean' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'activa')).toBe(true);
    });
  });
});
