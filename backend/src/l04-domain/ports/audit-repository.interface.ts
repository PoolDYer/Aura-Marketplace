export interface IAuditRepository {
  create(data: {
    usuarioId?: string;
    accion: string;
    modulo: string;
    resultado: 'EXITO' | 'FALLO';
    ipCliente?: string;
  }): Promise<void>;
}
