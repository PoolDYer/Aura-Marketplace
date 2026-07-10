import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    // Only audit mutations and specific sensitive queries
    const shouldAudit = method !== 'GET' || url.includes('/admin/');

    return next.handle().pipe(
      tap({
        next: () => {
          if (shouldAudit) {
            this.auditService.logEvent({
              usuarioId: user?.userId, // Assuming user is populated by JWT auth
              accion: method,
              modulo: url.split('/')[2] || 'general', // e.g. /api/users -> users
              resultado: 'EXITO',
              ipCliente: ip,
            });
          }
        },
        error: (err) => {
          if (shouldAudit) {
            this.auditService.logEvent({
              usuarioId: user?.userId,
              accion: method,
              modulo: url.split('/')[2] || 'general',
              resultado: 'FALLO',
              ipCliente: ip,
            });
          }
        },
      }),
    );
  }
}
