import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  const timestamp = Date.now();
  const user = {
    nombre: 'Test User',
    email: `test${timestamp}@test.com`,
    password: 'Password1!'
  };

  test('debe permitir registro de un nuevo usuario', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="nombre"]', user.nombre);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="confirmPassword"]', user.password);
    
    await page.click('button[type="submit"]');
    
    // Wait for success indication
    await page.waitForTimeout(1000);
  });

  test('debe fallar inicio de sesión con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'WrongPass1!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
  });
});
