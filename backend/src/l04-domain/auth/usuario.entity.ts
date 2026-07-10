import { RolUsuario, EstadoUsuario } from '@prisma/client';

export class UsuarioEntity {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  intentosFallidos: number;
  bloqueadoHasta: Date | null;

  constructor(partial: Partial<UsuarioEntity>) {
    Object.assign(this, partial);
  }

  isBloqueado(): boolean {
    if (this.bloqueadoHasta && this.bloqueadoHasta > new Date()) {
      return true;
    }
    return false;
  }

  registrarIntentoFallido(): void {
    this.intentosFallidos += 1;
    if (this.intentosFallidos >= 3) {
      // Bloqueo por 15 minutos (RN-08)
      this.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
    }
  }

  resetearIntentosFallidos(): void {
    this.intentosFallidos = 0;
    this.bloqueadoHasta = null;
  }
}
