import { validate } from 'class-validator';
import { UpdateAddressDto } from './update-address.dto';

describe('UpdateAddressDto', () => {
  it('should validate an empty update address object', async () => {
    const dto = new UpdateAddressDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate partial address fields', async () => {
    const dto = new UpdateAddressDto();
    dto.calle = 'Av. Siempreviva 742';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject empty strings if fields are specified', async () => {
    const dto = new UpdateAddressDto();
    dto.calle = ''; // specified but empty

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.property === 'calle')).toBe(true);
  });
});
