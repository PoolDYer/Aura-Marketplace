import { Argon2HasherService } from './argon2-hasher.service';

describe('Argon2HasherService', () => {
  let hasher: Argon2HasherService;

  beforeEach(() => {
    hasher = new Argon2HasherService();
  });

  it('should hash a password and verify it successfully', async () => {
    const password = 'SuperSecretPassword123';
    const hash = await hasher.hash(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);

    const isMatch = await hasher.verify(hash, password);
    expect(isMatch).toBe(true);

    const isWrongMatch = await hasher.verify(hash, 'WrongPassword');
    expect(isWrongMatch).toBe(false);
  });
});
