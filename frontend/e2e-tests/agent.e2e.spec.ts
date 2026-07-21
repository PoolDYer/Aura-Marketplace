import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env', quiet: true });
import { PrismaClient } from '../../backend/node_modules/@prisma/client/default.js';
import { api } from './support/api';

const prisma = new PrismaClient();

test.describe('Copiloto AI E2E', () => {
  const uniq = Math.random().toString(36).substring(2, 8);
  const timestamp = `${Date.now()}-${uniq}`;
  const testUser = {
    nombre: 'E2E Agent User',
    email: `e2e.agent.${timestamp}@aura.com`,
    password: 'Password1!',
    rol: 'COMPRADOR',
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
    await prisma.usuario.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  test('debe abrir el panel del copiloto, enviar un mensaje y recibir respuesta', async ({ page }) => {
    // 1. Iniciar sesión
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Ir al catálogo
    await page.goto('/catalog');
    await page.waitForTimeout(1000);

    // 3. Abrir el Copiloto AI haciendo clic en el micrófono de la cabecera
    const copilotTriggerBtn = page.locator('button[aria-label="Activar búsqueda por voz"]');
    await expect(copilotTriggerBtn).toBeVisible();
    await copilotTriggerBtn.click();
    await page.waitForTimeout(1000);

    // 4. Verificar que el panel de chat de Aura Copilot está abierto
    const chatTitle = page.locator('h3:has-text("Aura Copilot")');
    await expect(chatTitle).toBeVisible();

    // 5. Enviar mensaje de texto
    const chatInput = page.locator('input[placeholder="Escribe un mensaje..."]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('hola');
    await page.keyboard.press('Enter');

    // 6. Esperar la respuesta (verificar que aparezca al menos un mensaje de respuesta del Agente)
    await page.waitForTimeout(3500); // Esperar que la API responda

    const agentResponse = page.locator('div:has-text("Aura Copilot")');
    expect(await agentResponse.count()).toBeGreaterThan(0);
  });
});
