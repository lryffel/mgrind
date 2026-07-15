import { type Page, expect } from '@playwright/test';

export async function navigateToType(
  page: Page,
  disciplineIndex: number,
  typeIndex: number,
  options?: { enableAnyway?: boolean },
): Promise<void> {
  const card = page.locator('article.discipline-card').nth(disciplineIndex);
  await card.locator('.gear-button').click();
  await expect(card.locator('.type-list')).toBeVisible();

  const typeRow = card.locator('.type-row').nth(typeIndex);
  await typeRow.click();

  const exerciseCard = page.locator('article.exercise-card');
  if (await exerciseCard.isVisible()) return;

  if (options?.enableAnyway) {
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await dialog.locator('button', { hasText: 'Enable anyway' }).click();
    await expect(dialog).not.toBeVisible();
    await typeRow.click();
  }

  await expect(exerciseCard).toBeVisible({ timeout: 3000 });
}

export async function getExerciseInfo(page: Page): Promise<{
  answer: string;
  pattern: string | null;
  data: Record<string, unknown> | undefined;
  dataSubType: string | undefined;
}> {
  const info = await page.evaluate(() => {
    const raw = (window as unknown as Record<string, unknown>).__e2e_exercise as Record<string, unknown> | undefined;
    if (!raw) return null;
    const data = raw.data as Record<string, unknown> | undefined;
    return {
      answer: String(raw.answer ?? ''),
      pattern: (String(raw.pattern ?? '') || null) as string | null,
      data: data ?? undefined,
      dataSubType: data ? String(data.subType ?? '') || undefined : undefined,
    };
  });
  if (!info) throw new Error('No exercise data');
  return info;
}
