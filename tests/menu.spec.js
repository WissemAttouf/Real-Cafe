import { test, expect } from '@playwright/test';

test('la carte affiche les items', async ({ page }) => {
  await page.goto('/');
  await page.locator('#carte').scrollIntoViewIfNeeded();

  // Au moins 10 items (le test attend 14)
  const items = page.locator('.menu-item');
  await expect(items).toHaveCount(14, { timeout: 8000 });

  // Les catégories
  await expect(page.locator('.menu-col h3').first()).toContainText('Cafés');
});

test('le quick-view s\'ouvre au clic', async ({ page }) => {
  await page.goto('/');
  await page.locator('#carte').scrollIntoViewIfNeeded();

  // Attend que les items soient chargés
  await page.waitForSelector('button.menu-item', { timeout: 8000 });

  // Clique sur le premier menu-item (Espresso)
  await page.locator('button.menu-item').first().click();

  // Le panneau doit s'ouvrir
  const panel = page.locator('#menuPanel');
  await expect(panel).toHaveClass(/open/);

  // Le nom s'affiche
  await expect(page.locator('#panelName')).toContainText('Espresso');

  // Ferme avec Échap
  await page.keyboard.press('Escape');
  await expect(panel).not.toHaveClass(/open/);
});