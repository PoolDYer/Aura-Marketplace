import { AuditService } from './audit.service';

describe('AuditService Colocated Edge Cases', () => {
  const createService = () => {
    const auditRepo = {
      create: jest.fn(),
    };
    return { service: new AuditService(auditRepo as any), auditRepo };
  };

  it('logEvent should persist all properties and run successfully', async () => {
    const { service, auditRepo } = createService();
    auditRepo.create.mockResolvedValue(undefined);

    await expect(service.logEvent({
      usuarioId: 'user-1',
      accion: 'LOGIN',
      modulo: 'AUTH',
      resultado: 'EXITO',
      ipCliente: '127.0.0.1',
    })).resolves.not.toThrow();

    expect(auditRepo.create).toHaveBeenCalledWith({
      usuarioId: 'user-1',
      accion: 'LOGIN',
      modulo: 'AUTH',
      resultado: 'EXITO',
      ipCliente: '127.0.0.1',
    });
  });

  it('logEvent should silently swallow DB failures and not crash the main thread', async () => {
    const { service, auditRepo } = createService();
    auditRepo.create.mockRejectedValue(new Error('Prisma connection lost'));

    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});

    await expect(service.logEvent({
      accion: 'READ',
      modulo: 'PRODUCTS',
      resultado: 'FALLO',
    })).resolves.not.toThrow();

    errorSpy.mockRestore();
  });

  it('logEvent should accept undefined usuarioId', async () => {
    const { service, auditRepo } = createService();
    auditRepo.create.mockResolvedValue(undefined);

    await expect(service.logEvent({
      accion: 'REGISTER',
      modulo: 'AUTH',
      resultado: 'EXITO',
    })).resolves.not.toThrow();

    expect(auditRepo.create).toHaveBeenCalledWith({
      usuarioId: undefined,
      accion: 'REGISTER',
      modulo: 'AUTH',
      resultado: 'EXITO',
      ipCliente: undefined,
    });
  });
});
