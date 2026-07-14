import { test, expect } from '@playwright/test';

test.describe('Vendedor - Gestión', () => {
  test('debe cargar la vista de perfil/vendedor', async ({ page }) => {
    await page.goto('/profile');
    // Si no está autenticado, redirige a login
    if (page.url().includes('/login')) {
      await expect(page.locator('h2')).toContainText('Iniciar Sesion');
    } else {
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});
