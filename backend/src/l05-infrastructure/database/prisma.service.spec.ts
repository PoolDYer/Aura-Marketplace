jest.mock('@prisma/client', () => {
  class PrismaClient {
    $connect = jest.fn();
    $disconnect = jest.fn();
    constructor(public readonly options?: any) {}
  }

  return { PrismaClient };
});

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects and disconnects through Prisma lifecycle hooks', async () => {
    const service = new PrismaService();
    const logSpy = jest.spyOn((service as any).logger, 'log').mockImplementation();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(service.$connect).toHaveBeenCalled();
    expect(service.$disconnect).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully connected to database'));
    expect(logSpy).toHaveBeenCalledWith('Database connection closed');
    logSpy.mockRestore();
  });

  it('logs and rethrows connection failures', async () => {
    const service = new PrismaService();
    const error = new Error('db down');
    (service.$connect as jest.Mock).mockRejectedValue(error);
    const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

    await expect(service.onModuleInit()).rejects.toThrow('db down');

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to connect to database'), error);
    errorSpy.mockRestore();
  });
});
