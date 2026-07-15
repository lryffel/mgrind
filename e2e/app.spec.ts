import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('menu loads and shows the app title and disciplines', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('mgrind');

    const cards = page.locator('article.discipline-card');
    await expect(cards).not.toHaveCount(0);
  });

  test('clicking a discipline navigates to exercise screen and back works', async ({ page }) => {
    await page.goto('/');

    await page.locator('article.discipline-card').first().click();

    await expect(page.locator('button', { hasText: 'Back' })).toBeVisible();

    await page.locator('button', { hasText: 'Back' }).click();

    await expect(page.locator('h1')).toHaveText('mgrind');
  });
});
