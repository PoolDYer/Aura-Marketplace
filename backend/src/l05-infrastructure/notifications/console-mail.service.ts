import { Injectable, Logger } from '@nestjs/common';

import { IMailSender } from '../../l04-domain/ports/mail-sender.interface';

@Injectable()
export class ConsoleMailService implements IMailSender {
  private readonly logger = new Logger(ConsoleMailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = this.buildVerificationUrl(token);

    this.logger.log(
      `\n==============================================\nCORREO SIMULADO\nPara: ${email}\nAsunto: Verifica tu cuenta\nEnlace: ${url}\n==============================================\n`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const url = this.buildPasswordResetUrl(token);

    this.logger.log(
      `\n==============================================\nCORREO SIMULADO\nPara: ${email}\nAsunto: Restablecer Contrasena\nEnlace: ${url}\n==============================================\n`,
    );
  }

  private buildVerificationUrl(token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private buildPasswordResetUrl(token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
