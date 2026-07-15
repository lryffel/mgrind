import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('switching language updates the toggle button text', async ({ page }) => {
  const toggle = page.getByRole('button', { name: 'DE', exact: true });
  await toggle.click();
  await expect(page.getByRole('button', { name: 'EN', exact: true })).toBeVisible();
});

test('switching language changes UI text on exercise screen', async ({ page }) => {
  await page.getByRole('button', { name: 'DE', exact: true }).click();
  await expect(page.getByRole('button', { name: 'EN', exact: true })).toBeVisible();

  await page.locator('article.discipline-card').first().click();
  await expect(page.locator('button', { hasText: 'Bestätigen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zurück' })).toBeVisible();
});

test('switching back to English restores original UI text', async ({ page }) => {
  await page.getByRole('button', { name: 'DE', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.locator('article.discipline-card').first().click();
  await expect(page.locator('button', { hasText: 'Submit' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'Back' })).toBeVisible();
});
