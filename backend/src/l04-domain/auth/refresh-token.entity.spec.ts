import { RefreshTokenEntity } from './refresh-token.entity';

describe('RefreshTokenEntity', () => {
  it('should verify isValido logic', () => {
    const token = new RefreshTokenEntity({
      revocado: false,
      expiresAt: new Date(Date.now() + 60000), // 1 min future
    });

    expect(token.isValido()).toBe(true);

    token.expiresAt = new Date(Date.now() - 60000); // 1 min past (expired)
    expect(token.isValido()).toBe(false);

    token.expiresAt = new Date(Date.now() + 60000); // 1 min future
    token.revocado = true; // revoked
    expect(token.isValido()).toBe(false);
  });

  it('should revoke token successfully', () => {
    const token = new RefreshTokenEntity({
      revocado: false,
    });

    token.revocar();
    expect(token.revocado).toBe(true);
  });
});
