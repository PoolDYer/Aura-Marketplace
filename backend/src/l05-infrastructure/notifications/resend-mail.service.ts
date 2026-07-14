import { BadGatewayException, Injectable, Logger } from '@nestjs/common';

import { IMailSender } from '../../l04-domain/ports/mail-sender.interface';

@Injectable()
export class ResendMailService implements IMailSender {
  private readonly logger = new Logger(ResendMailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no configurado');
    }

    const url = this.buildVerificationUrl(token);
    await this.sendEmail({
      apiKey,
      email,
      subject: 'Verifica tu cuenta en Aura',
      html: this.buildVerificationTemplate(url),
      text: `Verifica tu cuenta en Aura abriendo este enlace: ${url}`,
      errorContext: 'verification',
      errorMessage: 'No se pudo enviar el correo de verificacion',
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no configurado');
    }

    const url = this.buildPasswordResetUrl(token);
    await this.sendEmail({
      apiKey,
      email,
      subject: 'Restablecer Contrasena',
      html: this.buildPasswordResetTemplate(url),
      text: `Restablecer Contrasena en Aura abriendo este enlace: ${url}`,
      errorContext: 'password reset',
      errorMessage: 'No se pudo enviar el correo para restablecer contrasena',
    });
  }

  private buildVerificationUrl(token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private buildPasswordResetUrl(token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private async sendEmail(params: {
    apiKey: string;
    email: string;
    subject: string;
    html: string;
    text: string;
    errorContext: string;
    errorMessage: string;
  }) {
    const from = process.env.EMAIL_FROM || 'Aura <no-reply@auraperu.shop>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.email],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Resend rejected ${params.errorContext} email: ${response.status} ${body}`);
      throw new BadGatewayException(params.errorMessage);
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

  private buildPasswordResetTemplate(url: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#211527">
        <h1 style="color:#845400;margin:0 0 16px">Restablecer Contrasena</h1>
        <p style="font-size:16px;line-height:1.5">Recibimos una solicitud para crear una nueva contrasena en Aura.</p>
        <a href="${url}" style="display:inline-block;margin:18px 0;padding:12px 18px;border-radius:999px;background:#845400;color:#ffffff;text-decoration:none;font-weight:700">Ingresar Aqui</a>
        <p style="font-size:13px;line-height:1.5;color:#524535">Este enlace vence en 20 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
    `;
  }
}
