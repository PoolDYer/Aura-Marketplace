import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env', quiet: true });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';
import { api } from './support/api';

const prisma = new PrismaClient();

test.describe('Administrador y Seguridad RBAC E2E', () => {
  const uniq = Math.random().toString(36).substring(2, 8);
  const timestamp = `${Date.now()}-${uniq}`;
  const testBuyer = {
    nombre: 'E2E Normal Buyer',
    email: `e2e.normal.buyer.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'COMPRADOR',
  };
  const testAdmin = {
    nombre: 'E2E Admin User',
    email: `e2e.admin.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'COMPRADOR', // Seeded as buyer, elevated programmatically
  };

  test.beforeAll(async () => {
    // Seed users via backend API and activate them
    try {
      await api.post('/auth/register', {
        nombre: testBuyer.nombre,
        email: testBuyer.email,
        password: testBuyer.password,
        rol: testBuyer.rol,
      });
      await prisma.usuario.update({
        where: { email: testBuyer.email },
        data: { estado: 'ACTIVO' },
      });

      await api.post('/auth/register', {
        nombre: testAdmin.nombre,
        email: testAdmin.email,
        password: testAdmin.password,
        rol: testAdmin.rol,
      });
      await prisma.usuario.update({
        where: { email: testAdmin.email },
        data: {
          rol: 'ADMINISTRADOR',
          estado: 'ACTIVO',
        },
      });
    } catch (err: any) {
      console.error('Error seeding users:', err.message, err.response?.data);
      throw err;
    }
  });

  test.afterAll(async () => {
    // Cleanup created users
    await prisma.usuario.deleteMany({
      where: {
        email: { in: [testBuyer.email, testAdmin.email] },
      },
    });
    await prisma.$disconnect();
  });

  test('debe bloquear el acceso de COMPRADOR a la zona /admin', async ({ page }) => {
    // 1. Iniciar sesión como comprador
    await page.goto('/login');
    await page.fill('input[name="email"]', testBuyer.email);
    await page.fill('input[name="password"]', testBuyer.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Intentar acceder a /admin/orders directamente
    await page.goto('/admin/orders');
    await page.waitForTimeout(1500);

    // 3. Verificar que fue bloqueado y redirigido (el layout de administración no se debe mostrar)
    expect(page.url()).not.toContain('/admin');
  });

  test('debe permitir acceso total a ADMINISTRADOR y cargar panel de reportes', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto('/login');
    await page.fill('input[name="email"]', testAdmin.email);
    await page.fill('input[name="password"]', testAdmin.password);
    await page.click('button[type="submit"]');

    // 2. Verificar redirección automática a panel de administración
    await expect(page).toHaveURL(/\/admin\/orders/, { timeout: 15000 });

    // 3. Navegar a Reportes y verificar que cargue
    const reportsLink = page.locator('a[href="/admin/reports"], a:has-text("Reportes")');
    if (await reportsLink.isVisible()) {
      await reportsLink.click();
    } else {
      await page.goto('/admin/reports');
    }
    await expect(page).toHaveURL(/\/admin\/reports/, { timeout: 15000 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
