import { test, expect } from '@playwright/test';
import { disciplines } from '../src/lib/data/disciplines';
import { navigateToType } from './helpers';

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
    await navigateToType(page, loc.di, loc.ti, { enableAnyway: true });
    await expect(page.locator('button', { hasText: 'Submit' })).toBeVisible();
  });
}
