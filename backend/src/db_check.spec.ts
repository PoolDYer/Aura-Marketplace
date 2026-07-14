const mockDbCheckFindMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    publicacion: { findMany: mockDbCheckFindMany },
    $disconnect: jest.fn(),
  })),
}));

import { formatProductSummary, main } from './db_check';

describe('db_check', () => {
  it('formats product summaries with reserved stock clamped to zero', () => {
    expect(
      formatProductSummary({
        id: 'p1',
        nombre: 'Mesa',
        estado: 'ACTIVA',
        categoria: { nombre: 'Hogar' },
        inventario: { cantidad: 2, cantidadReservada: 5 },
        imagenes: [{ id: 'i1' }],
      }),
    ).toBe('- Mesa | p1 | ACTIVA | Hogar | stock 0 | imagenes 1');

    expect(
      formatProductSummary({
        id: 'p2',
        nombre: 'Lampara',
        estado: 'ACTIVA',
        categoria: { nombre: 'Deco' },
        inventario: null,
        imagenes: [],
      }),
    ).toBe('- Lampara | p2 | ACTIVA | Deco | stock 0 | imagenes 0');
  });

  it('queries active products and logs each summary', async () => {
    const prisma = {
      publicacion: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'p1',
            nombre: 'Mesa',
            estado: 'ACTIVA',
            categoria: { nombre: 'Hogar' },
            inventario: { cantidad: 5, cantidadReservada: 1 },
            imagenes: [],
          },
        ]),
      },
      $disconnect: jest.fn(),
    };
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await main(prisma as any);

    expect(prisma.publicacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { estado: 'ACTIVA' }, orderBy: { createdAt: 'desc' } }),
    );
    expect(logSpy).toHaveBeenCalledWith('Productos activos en base de datos: 1');
    expect(logSpy).toHaveBeenCalledWith('- Mesa | p1 | ACTIVA | Hogar | stock 4 | imagenes 0');
    logSpy.mockRestore();
  });

  it('uses PrismaClient by default when no client is injected', async () => {
    mockDbCheckFindMany.mockResolvedValueOnce([]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await main();

    expect(mockDbCheckFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { estado: 'ACTIVA' } }));
    logSpy.mockRestore();
  });
});
