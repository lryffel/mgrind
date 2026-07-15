import { test, expect } from '@playwright/test';
import { disciplines } from '../src/lib/data/disciplines';

const typeLocations = new Map<string, { di: number; ti: number }>();
disciplines.forEach((d, di) => {
  d.exerciseTypeIds.forEach((tid, ti) => {
    if (!typeLocations.has(tid)) {
      typeLocations.set(tid, { di, ti });
    }
  });
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mgrind-progress', '{}');
    localStorage.setItem('mgrind-disabled', '{}');
  });
  await page.goto('/');
});

for (const [typeId, loc] of typeLocations) {
  test(`exercise "${typeId}" renders a card`, async ({ page }) => {
    const card = page.locator('article.discipline-card').nth(loc.di);
    await card.locator('.gear-button').click();
    await expect(card.locator('.type-list')).toBeVisible();

    const typeRow = card.locator('.type-row').nth(loc.ti);
    await typeRow.click();

    const exerciseCard = page.locator('article.exercise-card');
    const dialog = page.locator('dialog[open]');

    if (await exerciseCard.isVisible()) {
      await expect(page.locator('button', { hasText: 'Submit' })).toBeVisible();
    } else {
      await expect(dialog).toBeVisible({ timeout: 3000 });
      await expect(dialog.locator('button', { hasText: 'Enable anyway' })).toBeVisible();
      await dialog.locator('button', { hasText: 'Enable anyway' }).click();
      await expect(dialog).not.toBeVisible();

      await typeRow.click();
      await expect(exerciseCard).toBeVisible({ timeout: 3000 });
      await expect(page.locator('button', { hasText: 'Submit' })).toBeVisible();
    }
  });
}
