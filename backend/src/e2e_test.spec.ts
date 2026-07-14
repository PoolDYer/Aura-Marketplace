const mockE2eOrderFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    orden: { findUnique: mockE2eOrderFindUnique },
    $disconnect: jest.fn(),
  })),
}));

import { runTest } from './e2e_test';

const jsonResponse = (body: any, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn().mockResolvedValue(body),
  text: jest.fn().mockResolvedValue('error text'),
});

describe('e2e_test', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('runs the happy purchase flow with injected fetch and Prisma', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'token', user: { nombre: 'Ada', email: 'ada@test.dev' } }))
      .mockResolvedValueOnce(jsonResponse([{ id: 'prod-1', nombre: 'Silla', precio: 50 }]))
      .mockResolvedValueOnce(jsonResponse({}, false))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({ items: [{ id: 'item-1' }] }))
      .mockResolvedValueOnce(jsonResponse([{ id: 'addr-1', calle: 'Calle 1' }]))
      .mockResolvedValueOnce(jsonResponse({ id: 'order-1', total: 50, estado: 'PENDIENTE' }));
    const prisma = {
      orden: {
        findUnique: jest.fn().mockResolvedValue({
          numeroConfirmacion: 'ORD-1',
          total: 50,
          comprador: { nombre: 'Ada', email: 'ada@test.dev' },
          lineas: [{ nombreProducto: 'Silla', cantidad: 1, precioUnitario: 50 }],
        }),
      },
      $disconnect: jest.fn(),
    };

    await expect(runTest(prisma as any, fetchImpl as any, 'https://api.test')).resolves.toBeUndefined();

    expect(fetchImpl).toHaveBeenCalledWith('https://api.test/auth/login', expect.any(Object));
    expect(prisma.orden.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-1' } }),
    );
    expect(logSpy).toHaveBeenCalledWith('Aviso: error o carrito ya estaba vacio');
  });

  it('fails fast when login is rejected', async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(jsonResponse({}, false, 401));

    await expect(runTest({ orden: { findUnique: jest.fn() } } as any, fetchImpl as any)).rejects.toThrow(
      'Error en login: 401 - error text',
    );
  });

  it('rejects missing products, addresses and database confirmation', async () => {
    const baseLogin = jsonResponse({ accessToken: 'token', user: { nombre: 'Ada', email: 'ada@test.dev' } });
    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest.fn().mockResolvedValueOnce(baseLogin).mockResolvedValueOnce(jsonResponse([])) as any,
      ),
    ).rejects.toThrow('No se encontro ningun producto activo en el catalogo');

    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest
          .fn()
          .mockResolvedValueOnce(baseLogin)
          .mockResolvedValueOnce(jsonResponse([{ id: 'p1', nombre: 'Polo', precio: 10 }]))
          .mockResolvedValueOnce(jsonResponse({}))
          .mockResolvedValueOnce(jsonResponse({}))
          .mockResolvedValueOnce(jsonResponse({ items: [] }))
          .mockResolvedValueOnce(jsonResponse([])) as any,
      ),
    ).rejects.toThrow('El usuario de prueba no tiene una direccion registrada');

    await expect(
      runTest(
        { orden: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
        jest
          .fn()
          .mockResolvedValueOnce(baseLogin)
          .mockResolvedValueOnce(jsonResponse([{ id: 'p1', nombre: 'Polo', precio: 10 }]))
          .mockResolvedValueOnce(jsonResponse({}))
          .mockResolvedValueOnce(jsonResponse({}))
          .mockResolvedValueOnce(jsonResponse({ items: [] }))
          .mockResolvedValueOnce(jsonResponse([{ id: 'a1', calle: 'Calle' }]))
          .mockResolvedValueOnce(jsonResponse({ id: 'o1', total: 10, estado: 'PENDIENTE' })) as any,
      ),
    ).rejects.toThrow('La orden fue creada pero no se encontro en la base de datos');
  });

  it('surfaces API failures from each remote step', async () => {
    const login = jsonResponse({ accessToken: 'token', user: { nombre: 'Ada', email: 'ada@test.dev' } });
    const product = jsonResponse([{ id: 'p1', nombre: 'Polo', precio: 10 }]);
    const ok = jsonResponse({});
    const cart = jsonResponse({ items: [] });
    const address = jsonResponse([{ id: 'a1', calle: 'Calle' }]);

    await expect(runTest({ orden: { findUnique: jest.fn() } } as any, jest.fn().mockResolvedValueOnce(login).mockResolvedValueOnce(jsonResponse({}, false)) as any)).rejects.toThrow('Error al obtener productos');
    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest.fn().mockResolvedValueOnce(login).mockResolvedValueOnce(product).mockResolvedValueOnce(ok).mockResolvedValueOnce(jsonResponse({}, false, 400)) as any,
      ),
    ).rejects.toThrow('Error al agregar al carrito: 400 - error text');
    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest
          .fn()
          .mockResolvedValueOnce(login)
          .mockResolvedValueOnce(product)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(jsonResponse({}, false)) as any,
      ),
    ).rejects.toThrow('Error al obtener carrito');
    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest
          .fn()
          .mockResolvedValueOnce(login)
          .mockResolvedValueOnce(product)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(cart)
          .mockResolvedValueOnce(jsonResponse({}, false)) as any,
      ),
    ).rejects.toThrow('Error al obtener direcciones');
    await expect(
      runTest(
        { orden: { findUnique: jest.fn() } } as any,
        jest
          .fn()
          .mockResolvedValueOnce(login)
          .mockResolvedValueOnce(product)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(ok)
          .mockResolvedValueOnce(cart)
          .mockResolvedValueOnce(address)
          .mockResolvedValueOnce(jsonResponse({}, false, 409)) as any,
      ),
    ).rejects.toThrow('Error al crear la orden: 409 - error text');
  });

  it('uses default PrismaClient, fetch and API URL when no dependencies are injected', async () => {
    const originalFetch = global.fetch;
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'token', user: { nombre: 'Ada', email: 'ada@test.dev' } }))
      .mockResolvedValueOnce(jsonResponse([{ id: 'prod-1', nombre: 'Silla', precio: 50 }]))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({ items: [] }))
      .mockResolvedValueOnce(jsonResponse([{ id: 'addr-1', calle: 'Calle 1' }]))
      .mockResolvedValueOnce(jsonResponse({ id: 'order-1', total: 50, estado: 'PENDIENTE' }));
    global.fetch = fetchImpl as any;
    mockE2eOrderFindUnique.mockResolvedValueOnce({
      numeroConfirmacion: 'ORD-1',
      total: 50,
      comprador: { nombre: 'Ada', email: 'ada@test.dev' },
      lineas: [],
    });

    await expect(runTest()).resolves.toBeUndefined();

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:3000/auth/login', expect.any(Object));
    global.fetch = originalFetch;
  });
});
