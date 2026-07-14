import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../l04-domain/ports/notification-repository.interface';
import { INotificationProvider } from '../../l04-domain/ports/notification-provider.interface';
import { IUserRepository } from '../../l04-domain/ports/user-repository.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('INotificationRepository') private readonly notificationRepo: INotificationRepository,
    @Inject('INotificationProvider') private readonly notificationProvider: INotificationProvider,
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async getMyNotifications(usuarioId: string) {
    return this.notificationRepo.findManyByUser(usuarioId);
  }

  async markAsRead(usuarioId: string, id: string) {
    const notificacion = await this.notificationRepo.findById(id);
    if (!notificacion || notificacion.usuarioId !== usuarioId) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.notificationRepo.updateStatus(id, 'ENVIADA'); // Consideramos 'ENVIADA' como leída
  }

  async sendNotification(usuarioId: string, tipo: 'SEGURIDAD' | 'ORDEN_NUEVA' | 'ORDEN_ESTADO' | 'MARKETING', contenido: string) {
    const preferencias = await this.userRepo.findPreferencesByUserId(usuarioId);

    let send = false;
    let canal = 'EMAIL'; // Default canal
    if (tipo === 'SEGURIDAD') {
      send = true; // RN-12: always true
    } else if (preferencias) {
      if (tipo === 'ORDEN_NUEVA' && preferencias.notifNuevaOrden) send = true;
      if (tipo === 'ORDEN_ESTADO' && preferencias.notifEstadoOrden) send = true;
      if (tipo === 'MARKETING' && preferencias.notifMarketing) send = true;
    }

    if (!send) return null;

    const notif = await this.notificationRepo.create({
      usuarioId,
      tipo,
      contenido,
      canal,
      estado: 'PENDIENTE',
    });

    const success = await this.notificationProvider.sendNotification(usuarioId, canal, tipo, contenido);
    
    return this.notificationRepo.update(notif.id, {
      estado: success ? 'ENVIADA' : 'FALLIDA',
      enviadaAt: success ? new Date() : null,
    });
  }
}
