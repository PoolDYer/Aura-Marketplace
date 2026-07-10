export class RefreshTokenEntity {
  id: string;
  token: string;
  usuarioId: string;
  expiresAt: Date;
  revocado: boolean;

  constructor(partial: Partial<RefreshTokenEntity>) {
    Object.assign(this, partial);
  }

  isValido(): boolean {
    if (this.revocado) return false;
    if (this.expiresAt < new Date()) return false;
    return true;
  }

  revocar(): void {
    this.revocado = true;
  }
}
