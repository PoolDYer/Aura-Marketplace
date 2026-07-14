import { Injectable, Logger, Inject } from '@nestjs/common';
import { IAuditRepository } from '../../l04-domain/ports/audit-repository.interface';

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

  constructor(
    @Inject('IAuditRepository') private readonly auditRepo: IAuditRepository,
  ) {}

  async logEvent(dto: CreateAuditDto) {
    try {
      await this.auditRepo.create({
        usuarioId: dto.usuarioId,
        accion: dto.accion,
        modulo: dto.modulo,
        resultado: dto.resultado,
        ipCliente: dto.ipCliente,
      });
    } catch (error) {
      // We don't want audit failures to break the main application flow
      this.logger.error(`Error registrando evento de auditoría: ${error.message}`, error.stack);
    }
  }
}
