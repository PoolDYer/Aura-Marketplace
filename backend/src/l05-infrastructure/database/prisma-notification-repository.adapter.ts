import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { INotificationRepository } from '../../l04-domain/ports/notification-repository.interface';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(usuarioId: string): Promise<any[]> {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.notificacion.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, estado: string): Promise<any> {
    return this.prisma.notificacion.update({
      where: { id },
      data: { estado: estado as any },
    });
  }

  async create(data: {
    usuarioId: string;
    tipo: string;
    contenido: string;
    canal: string;
    estado: string;
  }): Promise<any> {
    return this.prisma.notificacion.create({
      data: {
        usuarioId: data.usuarioId,
        tipo: data.tipo as any,
        contenido: data.contenido,
        canal: data.canal,
        estado: data.estado as any,
      },
    });
  }

  async update(id: string, data: {
    estado: string;
    enviadaAt?: Date | null;
  }): Promise<any> {
    return this.prisma.notificacion.update({
      where: { id },
      data: {
        estado: data.estado as any,
        enviadaAt: data.enviadaAt,
      },
    });
  }
}
