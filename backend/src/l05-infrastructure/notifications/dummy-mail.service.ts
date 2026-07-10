import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DummyMailService {
  private readonly logger = new Logger(DummyMailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'Aura <no-reply@auraperu.shop>';

    if (!apiKey) {
      this.logger.log(`\n==============================================\nCORREO SIMULADO\nPara: ${email}\nAsunto: Verifica tu cuenta\nEnlace: ${url}\n==============================================\n`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Verifica tu cuenta en Aura',
        html: this.buildVerificationTemplate(url),
        text: `Verifica tu cuenta en Aura abriendo este enlace: ${url}`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend rejected verification email: ${response.status} ${body}`);
      throw new Error('No se pudo enviar el correo de verificacion');
    }
  }

  private buildVerificationTemplate(url: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#211527">
        <h1 style="color:#845400;margin:0 0 16px">Verifica tu cuenta en Aura</h1>
        <p style="font-size:16px;line-height:1.5">Gracias por registrarte. Para activar tu cuenta, confirma tu correo electronico.</p>
        <a href="${url}" style="display:inline-block;margin:18px 0;padding:12px 18px;border-radius:999px;background:#845400;color:#ffffff;text-decoration:none;font-weight:700">Verificar correo</a>
        <p style="font-size:13px;line-height:1.5;color:#524535">Este enlace vence en 1 hora. Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
      </div>
    `;
  }
}
