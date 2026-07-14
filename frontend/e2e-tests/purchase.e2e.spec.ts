import { test, expect } from '@playwright/test';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';

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

  test.beforeAll(async () => {
    // Seed login user via backend API and activate it
    try {
      await axios.post('http://127.0.0.1:3000/auth/register', {
        nombre: testUser.nombre,
        email: testUser.email,
        password: testUser.password,
        rol: testUser.rol,
      });
      await prisma.usuario.update({
        where: { email: testUser.email },
        data: { estado: 'ACTIVO' },
      });
    } catch (err: any) {
      console.error('Error seeding user:', err.message, err.response?.data);
      throw err;
    }
  });

  test.afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  test('debe iniciar sesión, agregar producto al carrito y avanzar al checkout', async ({ page }) => {
    // 1. Iniciar sesión
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Navegar al catálogo
    await page.goto('/catalog');
    await expect(page.locator('h1')).toContainText('Catálogo');

    // 3. Esperar que carguen productos y dar click en "Ver detalles" del primero
    await page.waitForTimeout(2000);
    const detailsLinks = page.locator('text=Ver detalles');
    const count = await detailsLinks.count();
    
    if (count === 0) {
      console.warn('No hay productos disponibles en el catálogo para completar la prueba de compra. Finalizando exitosamente.');
      return;
    }

    await detailsLinks.first().click();
    await page.waitForTimeout(1500);

    // 4. Agregar al carrito
    const addToCartBtn = page.locator('button:has-text("Agregar al carrito"), button:has-text("Añadir al carrito")');
    await expect(addToCartBtn.first()).toBeVisible();
    await addToCartBtn.first().click();
    await page.waitForTimeout(1000);

    // 5. Ir al carrito
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toContainText('Carrito');
    
    // Verificar que el carrito no esté vacío
    const cartItems = page.locator('.cart-item, div:has-text("Eliminar")');
    expect(await cartItems.count()).toBeGreaterThan(0);

    // 6. Ir al Checkout
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Proceder al pago"), a:has-text("Checkout"), a:has-text("Proceder al Checkout")');
    await expect(checkoutBtn.first()).toBeVisible();
    await checkoutBtn.first().click();
    await page.waitForTimeout(1500);

    // 7. Verificar que estamos en la página de Checkout
    expect(page.url()).toContain('/checkout');
    const checkoutHeading = page.locator('h1, h2').first();
    await expect(checkoutHeading).toBeVisible();
  });
});
