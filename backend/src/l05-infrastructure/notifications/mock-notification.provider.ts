import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MockNotificationProvider {
  private readonly logger = new Logger(MockNotificationProvider.name);

  async sendNotification(usuarioId: string, canal: string, tipo: string, contenido: string): Promise<boolean> {
    this.logger.log(`Enviando notificación [${tipo}] por canal [${canal}] al usuario ${usuarioId}: ${contenido}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Éxito
  }
}
