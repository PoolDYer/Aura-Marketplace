import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DummyMailService {
  private readonly logger = new Logger(DummyMailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    this.logger.log(`\n==============================================\n📧 CORREO SIMULADO (Sprint 2)\nPara: ${email}\nAsunto: Verifica tu cuenta\nEnlace: ${url}\n==============================================\n`);
  }
}
