import { validate } from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

describe('CreateAddressDto', () => {
  it('should validate a correct address creation object', async () => {
    const dto = new CreateAddressDto();
    dto.calle = 'Av. Siempreviva 742';
    dto.ciudad = 'Springfield';
    dto.estado = 'Oregon';
    dto.codigoPostal = '97477';
    dto.pais = 'USA';
    dto.referencia = 'Frente al bar de Moe';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should require all major address fields and reject empty strings', async () => {
    const fields = ['calle', 'ciudad', 'estado', 'codigoPostal', 'pais'];
    
    for (const field of fields) {
      const dto = new CreateAddressDto();
      dto.calle = 'Av. Siempreviva 742';
      dto.ciudad = 'Springfield';
      dto.estado = 'Oregon';
      dto.codigoPostal = '97477';
      dto.pais = 'USA';
      
      // Clear one field
      (dto as any)[field] = '';
      
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(err => err.property === field)).toBe(true);
    }
  });

  it('should allow optional reference field', async () => {
    const dto = new CreateAddressDto();
    dto.calle = 'Av. Siempreviva 742';
    dto.ciudad = 'Springfield';
    dto.estado = 'Oregon';
    dto.codigoPostal = '97477';
    dto.pais = 'USA';
    // reference omitted is fine
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
