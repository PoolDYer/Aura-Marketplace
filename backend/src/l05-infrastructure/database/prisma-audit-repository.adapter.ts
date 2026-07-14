import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IAuditRepository } from '../../l04-domain/ports/audit-repository.interface';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    usuarioId?: string;
    accion: string;
    modulo: string;
    resultado: 'EXITO' | 'FALLO';
    ipCliente?: string;
  }): Promise<void> {
    await this.prisma.auditoria.create({
      data: {
        usuarioId: data.usuarioId,
        accion: data.accion,
        modulo: data.modulo,
        resultado: data.resultado as any,
        ipCliente: data.ipCliente,
      },
    });
  }
}
