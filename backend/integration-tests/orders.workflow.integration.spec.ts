import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

import { PrismaService } from '../src/l05-infrastructure/database/prisma.service';
import { OrdersService } from '../src/l03-application/orders/orders.service';
import { PrismaOrderRepository } from '../src/l05-infrastructure/database/prisma-order-repository.adapter';
import { PrismaCartRepository } from '../src/l05-infrastructure/database/prisma-cart-repository.adapter';
import { PrismaUserRepository } from '../src/l05-infrastructure/database/prisma-user-repository.adapter';

describe('Orders Workflow Integration Test', () => {
  jest.setTimeout(25000);
  let prisma: PrismaService;
  let ordersService: OrdersService;
  let cartRepo: PrismaCartRepository;

  const testEmailBuyer = 'order-buyer-integration@aura.com';
  const testEmailSeller = 'order-seller-integration@aura.com';
  const testProductId = 'order-prod-integration-id';

  let buyerId: string;
  let sellerId: string;
  let addressId: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PrismaService,
        OrdersService,
        { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
        { provide: 'ICartRepository', useClass: PrismaCartRepository },
        { provide: 'IUserRepository', useClass: PrismaUserRepository },
      ],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    ordersService = moduleRef.get(OrdersService);
    cartRepo = moduleRef.get('ICartRepository');

    await prisma.$connect();
    await cleanup();

    // 1. Create Buyer and Seller
    const buyer = await prisma.usuario.create({
      data: {
        nombre: 'Order Buyer Integration',
        email: testEmailBuyer,
        passwordHash: 'hash',
        rol: 'COMPRADOR',
        estado: 'ACTIVO',
      },
    });
    buyerId = buyer.id;

    const seller = await prisma.usuario.create({
      data: {
        nombre: 'Order Seller Integration',
        email: testEmailSeller,
        passwordHash: 'hash',
        rol: 'VENDEDOR',
        estado: 'ACTIVO',
      },
    });
    sellerId = seller.id;

    // 2. Create Address for Buyer
    const address = await prisma.direccion.create({
      data: {
        usuarioId: buyerId,
        calle: 'Test Street 456',
        ciudad: 'Santiago',
        estado: 'RM',
        codigoPostal: '7500000',
        pais: 'CL',
        activa: true,
      },
    });
    addressId = address.id;

    // 3. Create Category and Publication with Inventory
    const category = await prisma.categoria.upsert({
      where: { id: 'order-test-cat' },
      update: {},
      create: {
        id: 'order-test-cat',
        nombre: 'Order Category',
        descripcion: 'Testing',
        activa: true,
      },
    });
    categoryId = category.id;

    await prisma.publicacion.create({
      data: {
        id: testProductId,
        nombre: 'Order Test Lamp',
        descripcion: 'Beautiful desk lamp',
        precio: 30.0,
        estado: 'ACTIVA',
        vendedorId: sellerId,
        categoriaId: categoryId,
        inventario: {
          create: {
            cantidad: 10,
            cantidadReservada: 2, // 8 available
          },
        },
      },
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function cleanup() {
    // Delete in order: lineas, pagos, ordenes, items, carrito, inventario, publicacion, direccion, usuario
    await prisma.lineaOrden.deleteMany({
      where: { orden: { comprador: { email: testEmailBuyer } } },
    });
    await prisma.pago.deleteMany({
      where: { orden: { comprador: { email: testEmailBuyer } } },
    });
    await prisma.orden.deleteMany({
      where: { comprador: { email: testEmailBuyer } },
    });
    await prisma.itemCarrito.deleteMany({
      where: { carrito: { comprador: { email: testEmailBuyer } } },
    });
    await prisma.carrito.deleteMany({
      where: { comprador: { email: testEmailBuyer } },
    });
    await prisma.inventario.deleteMany({
      where: { publicacionId: testProductId },
    });
    await prisma.publicacion.deleteMany({
      where: { id: testProductId },
    });
    await prisma.direccion.deleteMany({
      where: { usuarioId: buyerId },
    });
    await prisma.usuario.deleteMany({
      where: { email: { in: [testEmailBuyer, testEmailSeller] } },
    });
  }

  it('should execute a complete successful checkout workflow', async () => {
    // 1. Create a Cart for Buyer
    const cart = await prisma.carrito.create({
      data: { compradorId: buyerId },
    });

    // 2. Add item to cart
    await prisma.itemCarrito.create({
      data: {
        carritoId: cart.id,
        publicacionId: testProductId,
        cantidad: 3,
      },
    });

    // Verify initial stock values
    const initialInv = await prisma.inventario.findUnique({
      where: { publicacionId: testProductId },
    });
    expect(initialInv?.cantidadReservada).toBe(2);

    // 3. Perform createOrder (Checkout)
    const order = await ordersService.createOrder(buyerId, addressId);

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.total.toString()).toBe('90'); // 30.0 * 3
    expect(order.estado).toBe('PENDIENTE');

    // 4. Verify that stock was decremented (cantidadReservada incremented by 3)
    const postInv = await prisma.inventario.findUnique({
      where: { publicacionId: testProductId },
    });
    expect(postInv?.cantidadReservada).toBe(5); // 2 + 3

    // 5. Verify that cart was cleared
    const dbCart = await prisma.carrito.findUnique({
      where: { compradorId: buyerId },
      include: { items: true },
    });
    expect(dbCart?.items).toHaveLength(0);
  });

  it('should fail and roll back transaction if cart item quantity exceeds available stock', async () => {
    // 1. Verify stock state (cantidadReservada is now 5, quantity is 10 -> 5 available)
    const currentInv = await prisma.inventario.findUnique({
      where: { publicacionId: testProductId },
    });
    expect(currentInv?.cantidadReservada).toBe(5);

    // 2. Setup Cart again with a quantity exceeding available stock (e.g. 6 items)
    const dbCart = await prisma.carrito.findUnique({
      where: { compradorId: buyerId },
    });
    const cartId = dbCart!.id;

    await prisma.itemCarrito.create({
      data: {
        carritoId: cartId,
        publicacionId: testProductId,
        cantidad: 6, // 6 > 5 (available)
      },
    });

    // 3. Try to checkout, expecting BadRequestException
    await expect(ordersService.createOrder(buyerId, addressId)).rejects.toThrow(BadRequestException);

    // 4. Verify ACID Rollback: stock has not changed, and cart was NOT cleared
    const rolledBackInv = await prisma.inventario.findUnique({
      where: { publicacionId: testProductId },
    });
    expect(rolledBackInv?.cantidadReservada).toBe(5); // Remains 5

    const postCart = await prisma.carrito.findUnique({
      where: { compradorId: buyerId },
      include: { items: true },
    });
    expect(postCart?.items).toHaveLength(1); // Cart still has the item!
  });
});
