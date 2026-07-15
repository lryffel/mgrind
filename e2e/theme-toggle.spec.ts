import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('toggles from light to dark and back', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('button[aria-label="Toggle theme"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('button[aria-label="Toggle theme"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('persists after navigating to exercise and back', async ({ page }) => {
  await page.locator('button[aria-label="Toggle theme"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('article.discipline-card').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('button', { hasText: 'Back' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
