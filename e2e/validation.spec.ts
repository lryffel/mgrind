import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mgrind-progress', '{}');
    localStorage.setItem('mgrind-disabled', '{}');
  });
  await page.goto('/');
});

test('entering a comma in a numeric input shows validation error and disables submit', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const firstTypeRow = card.locator('.type-row').first();
  await firstTypeRow.click();

  await expect(page.locator('article.exercise-card')).toBeVisible({ timeout: 3000 });

  const input = page.locator('article.exercise-card input').first();
  await input.fill('3,14');

  await expect(page.locator('[role="alert"]')).toHaveText(/period|Punkt/);
  await expect(page.locator('button', { hasText: 'Submit' })).toBeDisabled();
});

test('removing the comma clears the validation error and re-enables submit', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const firstTypeRow = card.locator('.type-row').first();
  await firstTypeRow.click();

  await expect(page.locator('article.exercise-card')).toBeVisible({ timeout: 3000 });

  const input = page.locator('article.exercise-card input').first();
  await input.fill('3,14');
  await expect(page.locator('[role="alert"]')).toBeVisible();

  await input.fill('3.14');
  await expect(page.locator('[role="alert"]')).not.toBeVisible();
  await expect(page.locator('button', { hasText: 'Submit' })).not.toBeDisabled();
});
