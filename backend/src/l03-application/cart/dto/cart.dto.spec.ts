import { validate } from 'class-validator';
import { AddItemDto, UpdateItemDto } from './cart.dto';

describe('cart.dto', () => {
  describe('AddItemDto', () => {
    it('should validate a correct add item object', async () => {
      const dto = new AddItemDto();
      dto.publicacionId = 'product-uuid';
      dto.cantidad = 5;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject missing publicacionId', async () => {
      const dto = new AddItemDto();
      dto.publicacionId = '';
      dto.cantidad = 5;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'publicacionId')).toBe(true);
    });

    it('should reject non-integer or quantity less than 1', async () => {
      const dto1 = new AddItemDto();
      dto1.publicacionId = 'product-uuid';
      dto1.cantidad = 0; // Less than 1

      let errors = await validate(dto1);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'cantidad')).toBe(true);

      const dto2 = new AddItemDto();
      dto2.publicacionId = 'product-uuid';
      dto2.cantidad = 2.5; // Decimal

      errors = await validate(dto2);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'cantidad')).toBe(true);
    });
  });

  describe('UpdateItemDto', () => {
    it('should validate a correct update quantity', async () => {
      const dto = new UpdateItemDto();
      dto.cantidad = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid quantities', async () => {
      const dto = new UpdateItemDto();
      dto.cantidad = -1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'cantidad')).toBe(true);
    });
  });
});
