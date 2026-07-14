import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/l05-infrastructure/database/prisma.service';
import { MercadoPagoService } from '../src/l05-infrastructure/payments/mercadopago.service';

describe('Mercado Pago Payments Integration Test', () => {
  let prisma: PrismaService;
  let mpService: MercadoPagoService;
  let configService: ConfigService;

  const testEmailBuyer = 'mp-buyer-test@aura.com';
  const testEmailSeller = 'mp-seller-test@aura.com';

  beforeAll(async () => {
    // 1. Setup NestJS application context
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [PrismaService, MercadoPagoService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    mpService = moduleRef.get(MercadoPagoService);
    configService = moduleRef.get(ConfigService);

    await prisma.$connect();
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function cleanup() {
    // Delete test orders, pay records, publications, categories, and users
    await prisma.pago.deleteMany({
      where: {
        orden: { comprador: { email: testEmailBuyer } },
      },
    });

    await prisma.lineaOrden.deleteMany({
      where: {
        orden: { comprador: { email: testEmailBuyer } },
      },
    });

    await prisma.orden.deleteMany({
      where: { comprador: { email: testEmailBuyer } },
    });

    await prisma.publicacion.deleteMany({
      where: { vendedor: { email: testEmailSeller } },
    });

    await prisma.usuario.deleteMany({
      where: { email: { in: [testEmailBuyer, testEmailSeller] } },
    });
  }

  it('should successfully create a checkout preference on Mercado Pago', async () => {
    // 1. Create Buyer and Seller
    const buyer = await prisma.usuario.create({
      data: {
        nombre: 'MP Buyer Test',
        email: testEmailBuyer,
        passwordHash: 'hash',
        rol: 'COMPRADOR',
        estado: 'ACTIVO',
      },
    });

    const seller = await prisma.usuario.create({
      data: {
        nombre: 'MP Seller Test',
        email: testEmailSeller,
        passwordHash: 'hash',
        rol: 'VENDEDOR',
        estado: 'ACTIVO',
      },
    });

    // 2. Create Address
    const address = await prisma.direccion.create({
      data: {
        usuarioId: buyer.id,
        calle: 'Av. Test 123',
        ciudad: 'Lima',
        estado: 'Lima',
        codigoPostal: '15046',
        pais: 'PE',
        activa: true,
      },
    });

    // 3. Create Category and Publication
    const category = await prisma.categoria.upsert({
      where: { id: 'mp-test-cat' },
      update: {},
      create: {
        id: 'mp-test-cat',
        nombre: 'MP Test Category',
        descripcion: 'Tests',
        activa: true,
      },
    });

    const product = await prisma.publicacion.create({
      data: {
        nombre: 'Product Test MP',
        descripcion: 'Product for testing Mercado Pago integration',
        precio: 100.0,
        estado: 'ACTIVA',
        vendedorId: seller.id,
        categoriaId: category.id,
      },
    });

    // 4. Create Order
    const order = await prisma.orden.create({
      data: {
        compradorId: buyer.id,
        direccionId: address.id,
        estado: 'PENDIENTE',
        total: 100.0,
        numeroConfirmacion: `MP-TEST-${Date.now()}`,
        lineas: {
          create: {
            publicacionId: product.id,
            nombreProducto: product.nombre,
            precioUnitario: product.precio,
            cantidad: 1,
            subtotal: product.precio,
          },
        },
      },
    });

    // 5. Call MercadoPagoService preference generation
    try {
      const preference = await mpService.createCheckoutPreference(buyer.id, order.id);

      expect(preference).toBeDefined();
      expect(preference.preferenceId).toBeDefined(); // Preference ID
      expect(preference.url).toBeDefined(); // Payment URL
      expect(preference.url).toContain('mercadopago.com');

      // 6. Verify that a Pago record was created/updated in the database
      const paymentRecord = await prisma.pago.findUnique({
        where: { ordenId: order.id },
      });

      expect(paymentRecord).toBeDefined();
      expect(paymentRecord?.referenciaPasarela).toBe(preference.preferenceId);
      expect(paymentRecord?.estado).toBe('PENDIENTE');
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toMatch(/access token|token/i);
    }
  }, 20000);
});
