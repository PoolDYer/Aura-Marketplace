import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';
import { MockNotificationProvider } from '../../l05-infrastructure/notifications/mock-notification.provider';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationProvider: MockNotificationProvider,
  ) {}

  async getMyNotifications(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(usuarioId: string, id: string) {
    const notificacion = await this.prisma.notificacion.findUnique({ where: { id } });
    if (!notificacion || notificacion.usuarioId !== usuarioId) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notificacion.update({
      where: { id },
      data: { estado: 'ENVIADA' } // Consideramos 'ENVIADA' como leída o podríamos añadir campo 'leida'
    });
  }

  async sendNotification(usuarioId: string, tipo: 'SEGURIDAD' | 'ORDEN_NUEVA' | 'ORDEN_ESTADO' | 'MARKETING', contenido: string) {
    const preferencias = await this.prisma.preferenciasUsuario.findUnique({
      where: { usuarioId }
    });

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

    const notif = await this.prisma.notificacion.create({
      data: {
        usuarioId,
        tipo,
        contenido,
        canal,
        estado: 'PENDIENTE',
      }
    });

    const success = await this.notificationProvider.sendNotification(usuarioId, canal, tipo, contenido);
    
    return this.prisma.notificacion.update({
      where: { id: notif.id },
      data: {
        estado: success ? 'ENVIADA' : 'FALLIDA',
        enviadaAt: success ? new Date() : null,
      }
    });
  }
}
