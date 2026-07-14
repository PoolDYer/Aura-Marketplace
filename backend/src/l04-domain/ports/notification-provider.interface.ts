export interface INotificationProvider {
  sendNotification(usuarioId: string, canal: string, tipo: string, contenido: string): Promise<boolean>;
}
