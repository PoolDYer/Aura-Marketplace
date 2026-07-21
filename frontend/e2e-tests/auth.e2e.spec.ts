import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env', quiet: true });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';
import { api } from './support/api';

const prisma = new PrismaClient();

test.describe('Autenticación y Registro E2E', () => {
  const uniq = Math.random().toString(36).substring(2, 8);
  const timestamp = `${Date.now()}-${uniq}`;
  const regUser = {
    nombre: 'E2E Reg User',
    email: `e2e.reg.${uniq}.${timestamp}@aura.com`,
    password: 'Password1!',
  };
  const loginUser = {
    nombre: 'E2E Login User',
    email: `e2e.login.${uniq}.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'COMPRADOR',
  };

  test.beforeAll(async () => {
    try {
      await api.post('/auth/register', {
        nombre: loginUser.nombre,
        email: loginUser.email,
        password: loginUser.password,
        rol: loginUser.rol,
      });
      await prisma.usuario.update({
        where: { email: loginUser.email },
        data: { estado: 'ACTIVO' },
      });
    } catch (err: any) {
      console.error('Error seeding login user:', err.message, err.response?.data);
      throw err;
    }
  });

  test.afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { in: [regUser.email, loginUser.email] } },
    });
    await prisma.$disconnect();
  });

  test('debe registrar un nuevo usuario comprador y mostrar mensaje de verificación', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Crear Cuenta');

    await page.fill('input[name="nombre"]', regUser.nombre);
    await page.fill('input[name="email"]', regUser.email);
    await page.fill('input[name="password"]', regUser.password);
    await page.fill('input[name="confirmPassword"]', regUser.password);
    await page.click('button[type="submit"]');

    // Debe mostrar la alerta de registro exitoso solicitando verificación de correo
    const successAlert = page.locator('text=Registro exitoso. Verifique su correo');
    await expect(successAlert).toBeVisible({ timeout: 15000 });
  });

  test('debe iniciar sesión con un usuario activo y cerrar sesión', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', loginUser.email);
    await page.fill('input[name="password"]', loginUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000); // Wait longer for network requests to finish

    // Print error if login failed
    const errorLocator = page.locator('.error-message, [role="alert"], .text-red-500, .alert-danger, p:has-text("credenciales"), p:has-text("correo")');
    const count = await errorLocator.count();
    for (let i = 0; i < count; i++) {
      console.log('FRONTEND ERROR MESSAGE SHOWN:', await errorLocator.nth(i).innerText());
    }

    // Verificar login exitoso
    expect(page.url()).not.toContain('/login');

    // Ir al perfil y cerrar sesión
    await page.goto('/profile');
    await page.waitForTimeout(1500);
    
    const logoutBtn = page.locator('button:has-text("Cerrar"), button:has-text("Salir"), button:has-text("Log out"), button:has-text("Cerrar Sesion"), button:has-text("Cerrar Sesión"), button[aria-label*="Cerrar"], button[aria-label*="cerrar"], button[title*="Cerrar"], button[title*="cerrar"]');
    await expect(logoutBtn.first()).toBeVisible();
    await logoutBtn.first().click();
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/login');
  });
});
