import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('reset progress clears all progress bars to zero', async ({ page }) => {
  await page.locator('summary[aria-label="Settings"]').click();
  await page.locator('a', { hasText: 'Reset progress' }).click();
  await page.locator('dialog button.danger', { hasText: 'Reset' }).click();
  await expect(page.locator('dialog[open]')).not.toBeVisible();

  const bars = page.locator('progress[role="progressbar"]');
  const count = await bars.count();
  for (let i = 0; i < count; i++) {
    await expect(bars.nth(i)).toHaveAttribute('aria-valuenow', '0');
  }
});

test('cancel reset closes the dialog without clearing progress', async ({ page }) => {
  await page.locator('summary[aria-label="Settings"]').click();
  await page.locator('a', { hasText: 'Reset progress' }).click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.locator('dialog button.outline', { hasText: 'Cancel' }).click();
  await expect(page.locator('dialog[open]')).not.toBeVisible();
});
