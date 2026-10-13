import { test, expect } from '@playwright/test';

test('le formulaire de réservation valide les champs', async ({ page }) => {
  await page.goto('/');
  await page.locator('#reservation').scrollIntoViewIfNeeded();

  // Attend que le formulaire soit prêt
  await page.waitForSelector('button[type="submit"]', { timeout: 8000 });

  // Soumet vide → erreurs
  await page.locator('button[type="submit"]').click();

  await expect(page.locator('[data-err="name"]')).toContainText('nom');
  await expect(page.locator('[data-err="phone"]')).toContainText('telephone');
  await expect(page.locator('[data-err="date"]')).toContainText('date');
});

test('le champ Heure devient un select quand on choisit une date', async ({ page }) => {
  await page.goto('/');
  await page.locator('#reservation').scrollIntoViewIfNeeded();

  // Attend que le champ time soit prêt (soit input soit select)
  await page.waitForSelector('#f-time', { timeout: 8000 });

  // Le champ time est un select, désactivé au départ
  const timeSelect = page.locator('#f-time');
  await expect(timeSelect).toBeDisabled();

  // Choisit une date (dans 3 jours)
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const dateStr = d.toISOString().slice(0, 10);
  await page.fill('#f-date', dateStr);

  // Le select se charge et s'active
  await expect(timeSelect).toBeEnabled({ timeout: 8000 });
  const options = await timeSelect.locator('option').count();
  expect(options).toBeGreaterThan(5);
});

test('le formulaire complet envoie et affiche la confirmation', async ({ page }) => {
  await page.goto('/');
  await page.locator('#reservation').scrollIntoViewIfNeeded();

  // Attend que le formulaire soit prêt
  await page.waitForSelector('button[type="submit"]', { timeout: 8000 });

  // Remplit
  await page.fill('#f-name', 'Test Playwright');
  await page.fill('#f-phone', '+21612345678');

  // Choisit une date
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const dateStr = d.toISOString().slice(0, 10);
  await page.fill('#f-date', dateStr);

  // Attend que le select soit chargé
  await expect(page.locator('#f-time')).toBeEnabled({ timeout: 8000 });

  // Sélectionne le premier créneau disponible
  const options = page.locator('#f-time option:not([disabled])');
  const firstAvailable = await options.nth(1).getAttribute('value');
  await page.selectOption('#f-time', firstAvailable);

  // Soumet
  await page.locator('button[type="submit"]').click();

  // Confirmation visible
  await expect(page.locator('#confirmBox')).toHaveClass(/show/, { timeout: 12000 });
  await expect(page.locator('#confirmText')).toContainText('Test Playwright');
});