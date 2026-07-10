import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test('debe permitir navegar al checkout', async ({ page }) => {
    await page.goto('/checkout');
    // Dependiendo del estado del carrito, puede redirigir o mostrar vacío
    await page.waitForTimeout(1000);
    
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});
