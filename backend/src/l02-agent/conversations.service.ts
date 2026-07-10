import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../l05-infrastructure/database/prisma.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(private prisma: PrismaService) {}

  async getOrCreateActiveSession(userId: string) {
    // Search for a recent session (e.g., created or updated in the last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    let session = await this.prisma.sesion.findFirst({
      where: {
        usuarioId: userId,
        updatedAt: { gte: thirtyMinutesAgo }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!session) {
      this.logger.log(`Creating new session for user ${userId}`);
      session = await this.prisma.sesion.create({
        data: { usuarioId: userId }
      });
    }

    // Get or create conversation for the session
    let conversation = await this.prisma.conversacion.findFirst({
      where: { sesionId: session.id },
      orderBy: { updatedAt: 'desc' }
    });

    if (!conversation) {
      conversation = await this.prisma.conversacion.create({
        data: { sesionId: session.id }
      });
    }

    return { session, conversation };
  }

  async saveMessage(conversationId: string, role: 'USER' | 'AGENT' | 'SYSTEM', content: string) {
    return this.prisma.mensaje.create({
      data: {
        conversacionId: conversationId,
        rol: role,
        contenido: content
      }
    });
  }

  async saveIntentionAndEntities(mensajeId: string, intentionData: any) {
    if (!intentionData) return null;

    return this.prisma.intencion.create({
      data: {
        mensajeId,
        nombre: intentionData.intent || 'unknown',
        confianza: intentionData.confidence || 0,
        entidades: {
          create: (intentionData.entities || []).map((e: any) => ({
            tipo: e.type,
            valor: e.value
          }))
        }
      }
    });
  }

  async getConversationHistory(userId: string) {
    return this.prisma.conversacion.findMany({
      where: { sesion: { usuarioId: userId } },
      include: {
        mensajes: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });
  }
}
