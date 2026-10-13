import { test, expect } from '@playwright/test';

test('DIAGNOSTIC', async ({ page }) => {
  page.on('console', msg => {
    console.log('[BROWSER ' + msg.type() + ']', msg.text());
  });

  page.on('pageerror', err => {
    console.log('[BROWSER ERROR]', err.message);
  });

  page.on('requestfailed', req => {
    console.log('[REQ FAILED]', req.url(), req.failure() && req.failure().errorText);
  });

  await page.goto('/');
  await page.waitForTimeout(5000);

  const roastText = await page.locator('#roastOrigin').textContent();
  const menuCount = await page.locator('.menu-item').count();
  const preloaderExists = await page.locator('#preloader').count();

  console.log('=== ETAT FINAL ===');
  console.log('roastOrigin:', roastText);
  console.log('menu-item count:', menuCount);
  console.log('preloader count:', preloaderExists);
});

test('la page accueil se charge', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('café');
  await expect(page.locator('h1')).toContainText('temps');
});

test('les sections principales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#philosophie')).toBeVisible();
  await expect(page.locator('#carte')).toBeVisible();
  await expect(page.locator('#reservation')).toBeVisible();
  await expect(page.locator('body > footer')).toBeVisible();
});