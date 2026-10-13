import { test, expect } from '@playwright/test';

test('le bouton FR·ع bascule en arabe', async ({ page }) => {
  await page.goto('/');

  // Au départ, en français
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  // Clic sur le bouton de langue
  await page.locator('#langToggle').click();

  // Le site passe en arabe
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar', { timeout: 5000 });
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

  // Le titre a changé (nouveau monogramme Real Cafe)
  await expect(page.locator('h1')).toContainText('ريال كافي');

  // Re-clic → retour en français
  await page.locator('#langToggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr', { timeout: 5000 });
});