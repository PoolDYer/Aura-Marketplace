import { UsuarioEntity } from './usuario.entity';
import { EstadoUsuario, RolUsuario } from './usuario.entity';

describe('UsuarioEntity', () => {
  it('should verify isBloqueado returns true only when blocked in the future', () => {
    const user = new UsuarioEntity({
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });

    expect(user.isBloqueado()).toBe(false);

    user.bloqueadoHasta = new Date(Date.now() + 60000); // 1 minute in the future
    expect(user.isBloqueado()).toBe(true);

    user.bloqueadoHasta = new Date(Date.now() - 60000); // 1 minute in the past
    expect(user.isBloqueado()).toBe(false);
  });

  it('should lock user for 15 minutes after 3 failed attempts', () => {
    const user = new UsuarioEntity({
      intentosFallidos: 0,
      bloqueadoHasta: null,
    });

    user.registrarIntentoFallido();
    expect(user.intentosFallidos).toBe(1);
    expect(user.isBloqueado()).toBe(false);

    user.registrarIntentoFallido();
    expect(user.intentosFallidos).toBe(2);
    expect(user.isBloqueado()).toBe(false);

    user.registrarIntentoFallido();
    expect(user.intentosFallidos).toBe(3);
    expect(user.isBloqueado()).toBe(true);
    expect(user.bloqueadoHasta!.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
  });

  it('should clear failed attempts and lock state on reset', () => {
    const user = new UsuarioEntity({
      intentosFallidos: 3,
      bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000),
    });

    user.resetearIntentosFallidos();
    expect(user.intentosFallidos).toBe(0);
    expect(user.bloqueadoHasta).toBeNull();
    expect(user.isBloqueado()).toBe(false);
  });
});
