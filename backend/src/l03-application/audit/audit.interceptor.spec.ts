import { of, throwError } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { createHttpContext } from '../../test-utils/mock-context';

describe('AuditInterceptor', () => {
  const createInterceptor = () => {
    const auditService = { logEvent: jest.fn().mockResolvedValue(undefined) };
    const interceptor = new AuditInterceptor(auditService as any);
    return { interceptor, auditService };
  };

  it('should audit mutations (POST/PUT/DELETE) on success', (done) => {
    const { interceptor, auditService } = createInterceptor();
    const req = { method: 'POST', url: '/api/products', user: { userId: 'user-123' }, ip: '127.0.0.1' };
    const context = createHttpContext(req);
    const next = { handle: () => of('result') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(auditService.logEvent).toHaveBeenCalledWith({
          usuarioId: 'user-123',
          accion: 'POST',
          modulo: 'products',
          resultado: 'EXITO',
          ipCliente: '127.0.0.1',
        });
        done();
      },
    });
  });

  it('should audit mutations on failure', (done) => {
    const { interceptor, auditService } = createInterceptor();
    const req = { method: 'DELETE', url: '/api/users/1', user: { userId: 'user-123' }, ip: '127.0.0.1' };
    const context = createHttpContext(req);
    const next = { handle: () => throwError(() => new Error('DB Error')) };

    interceptor.intercept(context, next).subscribe({
      error: () => {
        expect(auditService.logEvent).toHaveBeenCalledWith({
          usuarioId: 'user-123',
          accion: 'DELETE',
          modulo: 'users',
          resultado: 'FALLO',
          ipCliente: '127.0.0.1',
        });
        done();
      },
    });
  });

  it('should audit GET requests to /admin/ routes', (done) => {
    const { interceptor, auditService } = createInterceptor();
    const req = { method: 'GET', url: '/api/admin/reports', user: { userId: 'admin-1' }, ip: '127.0.0.1' };
    const context = createHttpContext(req);
    const next = { handle: () => of('report-data') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(auditService.logEvent).toHaveBeenCalledWith({
          usuarioId: 'admin-1',
          accion: 'GET',
          modulo: 'admin',
          resultado: 'EXITO',
          ipCliente: '127.0.0.1',
        });
        done();
      },
    });
  });

  it('should not audit normal GET requests', (done) => {
    const { interceptor, auditService } = createInterceptor();
    const req = { method: 'GET', url: '/api/products', user: null, ip: '127.0.0.1' };
    const context = createHttpContext(req);
    const next = { handle: () => of('products-list') };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(auditService.logEvent).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
