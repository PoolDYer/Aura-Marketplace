import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../l05-infrastructure/database/prisma.service';

interface CreateAuditDto {
  usuarioId?: string;
  accion: string;
  modulo: string;
  resultado: 'EXITO' | 'FALLO';
  ipCliente?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(dto: CreateAuditDto) {
    try {
      await this.prisma.auditoria.create({
        data: {
          usuarioId: dto.usuarioId,
          accion: dto.accion,
          modulo: dto.modulo,
          resultado: dto.resultado,
          ipCliente: dto.ipCliente,
        },
      });
    } catch (error) {
      // We don't want audit failures to break the main application flow
      this.logger.error(`Error registrando evento de auditoría: ${error.message}`, error.stack);
    }
  }
}
