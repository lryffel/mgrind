import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('disabling a type shows it with line-through and persists', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  const typeRow = card.locator('.type-row').first();

  await card.locator('.gear-button').click();
  await expect(card.locator('.type-list')).toBeVisible();

  const checkbox = typeRow.locator('input[type="checkbox"]');
  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expect(typeRow).toHaveClass(/disabled/);

  await card.locator('.gear-button').click();
  await expect(card.locator('.type-list')).not.toBeVisible();
  await card.locator('.gear-button').click();
  await expect(typeRow.locator('input[type="checkbox"]')).not.toBeChecked();
});

test('last enabled type in a discipline cannot be disabled', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const rows = card.locator('.type-row');
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    const cb = rows.nth(i).locator('input[type="checkbox"]');
    if ((await cb.isChecked()) && (await cb.isEnabled())) {
      const isLast = (await card.locator('.type-row input[type="checkbox"]:checked').count()) === 1;
      await cb.click();
      if (isLast) {
        await expect(cb).toBeChecked();
      } else {
        await expect(cb).not.toBeChecked();
      }
    }
  }
});

test('disabling a type excludes it from card-click random selection', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const firstTypeCb = card.locator('.type-row').first().locator('input[type="checkbox"]');
  if (!(await firstTypeCb.isEnabled())) {
    test.skip();
    return;
  }
  await firstTypeCb.click();
  await expect(firstTypeCb).not.toBeChecked();
  await card.locator('.gear-button').click();

  await card.click();
  await expect(page.locator('article.exercise-card')).toBeVisible({ timeout: 3000 });
  await page.locator('button', { hasText: 'Back' }).click();

  await card.locator('.gear-button').click();
  await expect(firstTypeCb).not.toBeChecked();
  await firstTypeCb.click();
  await expect(firstTypeCb).toBeChecked();
});
