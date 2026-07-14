import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IConversationRepository } from '../../l04-domain/ports/conversation-repository.interface';

@Injectable()
export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveSession(userId: string, thirtyMinutesAgo: Date): Promise<any | null> {
    return this.prisma.sesion.findFirst({
      where: {
        usuarioId: userId,
        updatedAt: { gte: thirtyMinutesAgo },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createSession(userId: string): Promise<any> {
    return this.prisma.sesion.create({
      data: { usuarioId: userId },
    });
  }

  async findConversationBySession(sessionId: string): Promise<any | null> {
    return this.prisma.conversacion.findFirst({
      where: { sesionId: sessionId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createConversation(sessionId: string): Promise<any> {
    return this.prisma.conversacion.create({
      data: { sesionId: sessionId },
    });
  }

  async saveMessage(conversationId: string, role: string, content: string): Promise<any> {
    return this.prisma.mensaje.create({
      data: {
        conversacionId: conversationId,
        rol: role as any, // 'USER' | 'AGENT' | 'SYSTEM'
        contenido: content,
      },
    });
  }

  async saveIntentionAndEntities(
    messageId: string,
    name: string,
    confidence: number,
    entities: Array<{ type: string; value: string }>,
  ): Promise<any> {
    return this.prisma.intencion.create({
      data: {
        mensajeId: messageId,
        nombre: name,
        confianza: confidence,
        entidades: {
          create: entities.map((e) => ({
            tipo: e.type,
            valor: e.value,
          })),
        },
      },
    });
  }

  async findHistoryByUser(userId: string, take: number): Promise<any[]> {
    return this.prisma.conversacion.findMany({
      where: { sesion: { usuarioId: userId } },
      include: {
        mensajes: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take,
    });
  }

  async findMessagesByConversation(conversationId: string, take: number): Promise<any[]> {
    return this.prisma.mensaje.findMany({
      where: { conversacionId: conversationId },
      orderBy: { createdAt: 'asc' },
      take,
    });
  }
}
