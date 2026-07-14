export interface INotificationRepository {
  findManyByUser(usuarioId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  updateStatus(id: string, estado: string): Promise<any>;
  create(data: {
    usuarioId: string;
    tipo: string;
    contenido: string;
    canal: string;
    estado: string;
  }): Promise<any>;
  update(id: string, data: {
    estado: string;
    enviadaAt?: Date | null;
  }): Promise<any>;
}
