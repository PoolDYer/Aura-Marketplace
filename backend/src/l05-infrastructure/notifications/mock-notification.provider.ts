import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from '../../l04-domain/ports/notification-provider.interface';

@Injectable()
export class MockNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(MockNotificationProvider.name);

  async sendNotification(usuarioId: string, canal: string, tipo: string, contenido: string): Promise<boolean> {
    this.logger.log(`Enviando notificación [${tipo}] por canal [${canal}] al usuario ${usuarioId}: ${contenido}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Éxito
  }
}
