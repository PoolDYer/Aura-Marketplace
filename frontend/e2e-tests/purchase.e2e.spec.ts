import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env', quiet: true });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';
import { api } from './support/api';

const prisma = new PrismaClient();

test.describe('Flujo de Compra E2E', () => {
  const uniq = Math.random().toString(36).substring(2, 8);
  const timestamp = `${Date.now()}-${uniq}`;
  const testUser = {
    nombre: 'E2E Buyer Purchase',
    email: `e2e.buyer.purchase.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'COMPRADOR',
  };
  const sellerEmail = `e2e.seed.seller.${timestamp}@aura.com`;
  const sellerPassword = 'Password1!';
  const productName = `E2E Mesa Aura ${timestamp}`;
  let sellerId = '';
  let categoryId = '';
  let productId = '';
  let sellerAccessToken = '';

  test.beforeAll(async () => {
    try {
      await api.post('/auth/register', {
        nombre: testUser.nombre,
        email: testUser.email,
        password: testUser.password,
        rol: testUser.rol,
      });
      await prisma.usuario.update({
        where: { email: testUser.email },
        data: { estado: 'ACTIVO' },
      });

      await api.post('/auth/register', {
        nombre: 'E2E Seed Seller',
        email: sellerEmail,
        password: sellerPassword,
        rol: 'VENDEDOR',
      });
      const seller = await prisma.usuario.update({
        where: { email: sellerEmail },
        data: { estado: 'ACTIVO' },
      });
      sellerId = seller.id;

      const category = await prisma.categoria.create({
        data: {
          nombre: `E2E Categoria ${timestamp}`,
          descripcion: 'Categoria temporal para pruebas end to end',
          activa: true,
        },
      });
      categoryId = category.id;

      const sellerSession = await api.post('/auth/login', {
        email: sellerEmail,
        password: sellerPassword,
      });
      sellerAccessToken = sellerSession.data.accessToken;

      const productResponse = await api.post(
        '/products',
        {
          nombre: productName,
          descripcion: 'Producto temporal para validar compra end to end.',
          precio: 129.9,
          estado: 'ACTIVA',
          categoriaId: category.id,
          stock: 12,
        },
        {
          headers: {
            Authorization: `Bearer ${sellerAccessToken}`,
          },
        },
      );
      productId = productResponse.data.id;
    } catch (err: any) {
      console.error('Error seeding purchase flow:', err.message, err.response?.data);
      throw err;
    }
  });

  test.afterAll(async () => {
    if (productId) {
      if (sellerAccessToken) {
        await api
          .delete(`/products/${productId}`, {
            headers: { Authorization: `Bearer ${sellerAccessToken}` },
          })
          .catch(() => undefined);
      }
      await prisma.itemCarrito.deleteMany({ where: { publicacionId: productId } });
      await prisma.inventario.deleteMany({ where: { publicacionId: productId } });
      await prisma.imagenPublicacion.deleteMany({ where: { publicacionId: productId } });
      await prisma.publicacion.deleteMany({ where: { id: productId } });
    }
    if (categoryId) {
      await prisma.categoria.deleteMany({ where: { id: categoryId } });
    }
    if (sellerId) {
      await prisma.usuario.deleteMany({ where: { id: sellerId } });
    }
    await prisma.usuario.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  test('debe iniciar sesion, agregar producto al carrito y avanzar al checkout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15000 });

    await page.goto('/catalog');
    await expect(page.locator('h1')).toContainText(/Cat.logo/);

    const productCard = page.locator('article', { hasText: productName });
    await expect(productCard).toBeVisible();
    await productCard.locator('a').first().click();

    const addToCartBtn = page.locator('button:has-text("Agregar al carrito"), button:has-text("Anadir al carrito")');
    await expect(addToCartBtn.first()).toBeVisible();
    await addToCartBtn.first().click();
    await page.waitForTimeout(1000);

    await page.goto('/cart');
    await expect(page.locator('body')).toContainText(productName);

    const cartItems = page.locator('article', { hasText: productName });
    expect(await cartItems.count()).toBeGreaterThan(0);

    const checkoutBtn = page.locator(
      'a:has-text("Realizar Pedido"), button:has-text("Checkout"), button:has-text("Proceder al pago"), a:has-text("Checkout"), a:has-text("Proceder al Checkout")',
    );
    await expect(checkoutBtn.first()).toBeVisible();
    await checkoutBtn.first().click();
    await page.waitForTimeout(1500);

    expect(page.url()).toContain('/checkout');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
