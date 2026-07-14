import { RefreshTokenEntity } from './refresh-token.entity';
import { UsuarioEntity } from './usuario.entity';

describe('UsuarioEntity', () => {
  it('detects active locks and clears failed login state', () => {
    const user = new UsuarioEntity({
      intentosFallidos: 2,
      bloqueadoHasta: new Date(Date.now() + 60_000),
    });

    expect(user.isBloqueado()).toBe(true);
    user.resetearIntentosFallidos();
    expect(user.intentosFallidos).toBe(0);
    expect(user.bloqueadoHasta).toBeNull();
    expect(user.isBloqueado()).toBe(false);
  });

  it('locks the user after the third failed attempt', () => {
    const user = new UsuarioEntity({ intentosFallidos: 2, bloqueadoHasta: null });

    user.registrarIntentoFallido();

    expect(user.intentosFallidos).toBe(3);
    expect(user.bloqueadoHasta).toBeInstanceOf(Date);
    expect(user.isBloqueado()).toBe(true);
  });
});

describe('RefreshTokenEntity', () => {
  it('validates non-revoked unexpired tokens', () => {
    const token = new RefreshTokenEntity({
      revocado: false,
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(token.isValido()).toBe(true);
  });

  it('rejects revoked and expired tokens', () => {
    const revoked = new RefreshTokenEntity({
      revocado: true,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const expired = new RefreshTokenEntity({
      revocado: false,
      expiresAt: new Date(Date.now() - 60_000),
    });

    expect(revoked.isValido()).toBe(false);
    expect(expired.isValido()).toBe(false);
    expired.revocar();
    expect(expired.revocado).toBe(true);
  });
});
