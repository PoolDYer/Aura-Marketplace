import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env', quiet: true });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';
import { api } from './support/api';

const prisma = new PrismaClient();

test.describe('Vendedor E2E', () => {
  const uniq = Math.random().toString(36).substring(2, 8);
  const timestamp = `${Date.now()}-${uniq}`;
  const testUser = {
    nombre: 'E2E Seller',
    email: `e2e.seller.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'VENDEDOR',
  };

  test.beforeAll(async () => {
    // Seed login user via backend API and activate it
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
    } catch (err: any) {
      console.error('Error seeding user:', err.message, err.response?.data);
      throw err;
    }
  });

  test.afterAll(async () => {
    const seller = await prisma.usuario.findUnique({
      where: { email: testUser.email },
    });
    if (seller) {
      await prisma.inventario.deleteMany({
        where: { publicacion: { vendedorId: seller.id } },
      });
      await prisma.publicacion.deleteMany({
        where: { vendedorId: seller.id },
      });
      await prisma.usuario.delete({
        where: { id: seller.id },
      });
    }
    await prisma.$disconnect();
  });

  test('debe iniciar sesión como vendedor y crear una nueva publicación de producto', async ({ page }) => {
    // 1. Iniciar sesión
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/vendor\/catalog/, { timeout: 15000 });

    // 2. Verificar que está redirigido al catálogo del vendedor
    expect(page.url()).toContain('/vendor/catalog');

    // 3. Hacer clic en "Agregar Producto"
    const addProductBtn = page.locator('a:has-text("Agregar Producto"), a:has-text("Crear publicación")');
    await expect(addProductBtn.first()).toBeVisible();
    await addProductBtn.first().click();
    await page.waitForTimeout(1000);

    // 4. Rellenar el formulario de creación de producto
    const productNameInput = page.locator('input[placeholder="Ej: Sillón Lounge Serenidad"]');
    await expect(productNameInput).toBeVisible();
    await productNameInput.fill(`E2E Lamp ${timestamp}`);

    const productPriceInput = page.locator('input[placeholder="0.00"]');
    await productPriceInput.fill('49.99');

    const productStockInput = page.locator('input[placeholder="0"]');
    await productStockInput.fill('20');

    const productDescInput = page.locator('textarea[placeholder="Describe los materiales, ergonomía y la sensación de calma que aporta..."]');
    await productDescInput.fill('Modern desk lamp with high quality finish.');

    // 5. Seleccionar la primera categoría disponible en el select
    const categorySelect = page.locator('select[required]');
    await categorySelect.selectOption({ index: 1 }); // Seleccionar la primera categoría real

    // 6. Enviar formulario
    const saveBtn = page.locator('button[type="submit"]');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await page.waitForTimeout(2000);

    // 7. Validar redirección y confirmación en el catálogo del vendedor
    expect(page.url()).toContain('/vendor/catalog');
    const tableRow = page.locator(`tr:has-text("E2E Lamp ${timestamp}")`);
    await expect(tableRow.first()).toBeVisible();
  });
});
