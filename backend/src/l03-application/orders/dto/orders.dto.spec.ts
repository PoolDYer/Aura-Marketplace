import { validate } from 'class-validator';
import { CreateOrderDto, UpdateOrderStatusDto, EstadoOrden } from './orders.dto';

describe('orders.dto', () => {
  describe('CreateOrderDto', () => {
    it('should validate a correct order creation object', async () => {
      const dto = new CreateOrderDto();
      dto.direccionId = 'address-uuid';
      dto.cuponCodigo = 'SAVE20';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should allow optional coupon code but require address ID', async () => {
      const dto = new CreateOrderDto();
      dto.direccionId = 'address-uuid';
      
      // coupon omitted is fine
      let errors = await validate(dto);
      expect(errors.length).toBe(0);

      dto.direccionId = '';
      errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'direccionId')).toBe(true);
    });
  });

  describe('UpdateOrderStatusDto', () => {
    it('should validate a correct status update', async () => {
      const dto = new UpdateOrderStatusDto();
      dto.estado = EstadoOrden.CONFIRMADA;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid status options', async () => {
      const dto = new UpdateOrderStatusDto();
      (dto as any).estado = 'INVALID_STATUS';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === 'estado')).toBe(true);
    });

    it('should check enum EstadoOrden contains all required values', () => {
      expect(EstadoOrden.PENDIENTE).toBe('PENDIENTE');
      expect(EstadoOrden.CONFIRMADA).toBe('CONFIRMADA');
      expect(EstadoOrden.EN_PREPARACION).toBe('EN_PREPARACION');
      expect(EstadoOrden.DESPACHADA).toBe('DESPACHADA');
      expect(EstadoOrden.ENTREGADA).toBe('ENTREGADA');
      expect(EstadoOrden.CANCELADA).toBe('CANCELADA');
      expect(EstadoOrden.ESCALADA).toBe('ESCALADA');
    });
  });
});
