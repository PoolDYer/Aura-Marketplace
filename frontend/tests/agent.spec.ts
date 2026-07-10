import { test, expect } from '@playwright/test';

test.describe('Agente IA', () => {
  test('debe inicializar el agente en el catálogo', async ({ page }) => {
    await page.goto('/catalog');
    
    // Verify the page loaded
    await expect(page.locator('text=Catálogo de Productos')).toBeVisible();
  });
});
