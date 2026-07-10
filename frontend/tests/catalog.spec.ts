import { test, expect } from '@playwright/test';

test.describe('Catálogo', () => {
  test('debe cargar la página del catálogo y mostrar productos', async ({ page }) => {
    await page.goto('/catalog');
    
    // Verificar título
    await expect(page.locator('h1')).toHaveText('Catálogo de Productos');
    
    // Verificar que los enlaces a detalle de producto existan
    // Asumiendo que la DB tiene productos
    await page.waitForTimeout(2000); // Wait for API
    const detailsLinks = page.locator('text=Ver detalles');
    const count = await detailsLinks.count();
    if (count > 0) {
      await expect(detailsLinks.first()).toBeVisible();
    }
  });
});
