import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('clicking a locked type shows the prerequisites modal', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const lockedRow = card.locator('.type-row').filter({ hasText: '🔒' }).first();
  if ((await lockedRow.count()) === 0) {
    test.skip();
    return;
  }
  await lockedRow.click();
  await expect(page.locator('dialog[open]')).toBeVisible();
});

test('enable anyway unlocks the type', async ({ page }) => {
  const card = page.locator('article.discipline-card').first();
  await card.locator('.gear-button').click();

  const lockedRows = card.locator('.type-row');
  const count = await lockedRows.count();
  let lockedIndex = -1;
  for (let i = 0; i < count; i++) {
    const text = await lockedRows.nth(i).innerText();
    if (text.includes('🔒')) {
      lockedIndex = i;
      break;
    }
  }
  if (lockedIndex === -1) {
    test.skip();
    return;
  }

  await lockedRows.nth(lockedIndex).click();
  await page.locator('dialog[open] button.danger', { hasText: 'Enable anyway' }).click();
  await expect(page.locator('dialog[open]')).not.toBeVisible();

  await lockedRows.nth(lockedIndex).click();

  await expect(page.locator('article.exercise-card')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('button', { hasText: 'Submit' })).toBeVisible();
});
