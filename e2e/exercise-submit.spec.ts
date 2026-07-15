import { test, expect } from '@playwright/test';
import { disciplines } from '../src/lib/data/disciplines';

const SEED_COUNTS: Record<string, number> = {
  multiplication: 5,
  division: 5,
  squares: 5,
  signs: 5,
  orderOfOperations: 5,
  percent: 5,
  roundingSigfigs: 5,
  unitConversion: 5,
  primeFactorisation: 5,
  simplifyFraction: 5,
  additionFraction: 5,
  multiplicationFraction: 5,
  compareFractions: 5,
  substitution: 5,
  binomialFormulas: 5,
  collectingTerms: 5,
  expand: 5,
  expandAndCollect: 5,
  necessityOfParentheses: 5,
  linearEquations: 5,
  termTransformationsTrivia: 30,
  pythagoras: 10,
  interiorAngles: 10,
  factoringOut: 10,
  factoringBinomialFormulas: 10,
  factoringOutAndBinomial: 30,
  scientificNotation: 10,
  gcdLcm: 10,
  numbersTrivia: 30,
  factorEquations: 15,
  areaAndPerimeter: 20,
  symbolicFractionOperations: 20,
  fractionTrivia: 30,
  simplifySymbolicFraction: 30,
  factors: 1,
};

function generateSeeds(typeIndex: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => 100_000 + typeIndex * 1000 + i);
}

const typeLocations = new Map<string, { di: number; ti: number; idx: number; seedCount: number }>();
disciplines.forEach((d, di) => {
  d.exerciseTypeIds.forEach((tid, ti) => {
    if (!typeLocations.has(tid)) {
      typeLocations.set(tid, {
        di,
        ti,
        idx: typeLocations.size,
        seedCount: SEED_COUNTS[tid] ?? 5,
      });
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
  const seeds = generateSeeds(loc.idx, loc.seedCount);

  test(`"${typeId}" — correct answer (${loc.seedCount} seed${loc.seedCount > 1 ? 's' : ''})`, async ({ page }) => {
    const card = page.locator('article.discipline-card').nth(loc.di);
    await card.locator('.gear-button').click();
    await expect(card.locator('.type-list')).toBeVisible();

    const typeRow = card.locator('.type-row').nth(loc.ti);
    await typeRow.click();

    const dialog = page.locator('dialog[open]');
    const exerciseCard = page.locator('article.exercise-card');

    if (!(await exerciseCard.isVisible())) {
      await expect(dialog).toBeVisible({ timeout: 3000 });
      await dialog.locator('button', { hasText: 'Enable anyway' }).click();
      await expect(dialog).not.toBeVisible();
      await typeRow.click();
      await expect(exerciseCard).toBeVisible({ timeout: 3000 });
    }

    for (let s = 0; s < seeds.length; s++) {
      if (s > 0) {
        await page.evaluate((seed: number) => {
          Date.now = () => seed;
        }, seeds[s]);
        await page.locator('button', { hasText: 'Next' }).click();
        await expect(page.locator('article.exercise-card')).toBeVisible({
          timeout: 3000,
        });
      }

      const info = await page.evaluate(() => {
        const w = window as unknown as Record<string, unknown>;
        const ex = w.__e2e_exercise as Record<string, unknown> | undefined;
        if (!ex) return null;
        const ans = ex.answer;
        if (ans === undefined || ans === null) return null;
        return {
          answer: String(ans),
          pattern: (String(ex.pattern ?? '') || null) as string | null,
        };
      });
      if (!info) throw new Error('No exercise data');

      if (info.pattern && info.pattern !== 'custom') {
        await fillAnswer(page, info);
        await page.locator('button', { hasText: 'Submit' }).click();
        await expect(page.locator('p.feedback.correct')).toBeVisible({ timeout: 5000 });
      } else {
        const submitted = await fillCustomAnswer(page, typeId);
        if (!submitted) {
          await page.locator('button', { hasText: 'Submit' }).click();
        }
        await expect(page.locator('p.feedback.correct')).toBeVisible({ timeout: 8000 });
      }
    }
  });
}

async function fillAnswer(
  page: import('@playwright/test').Page,
  info: { answer: string; pattern: string; dataButtons?: string[] },
) {
  const card = page.locator('article.exercise-card');

  switch (info.pattern) {
    case 'text-input': {
      await card.locator('input.coeff-input').fill(info.answer);
      break;
    }
    case 'fraction-input': {
      const [num, den] = info.answer.split(',');
      const inputs = card.locator('.fraction-input input.coeff-input');
      await inputs.nth(0).fill(num);
      await inputs.nth(1).fill(den);
      break;
    }
    case 'multi-field': {
      const parts = info.answer.split(',');
      const inputs = card.locator('.coeff-field input.coeff-input');
      for (let i = 0; i < parts.length; i++) {
        await inputs.nth(i).fill(parts[i]);
      }
      break;
    }
    case 'single-choice': {
      const idx = parseInt(info.answer, 10);
      await card.locator('button[role="radio"]').nth(idx).click();
      break;
    }
    case 'multi-choice': {
      const indices = info.answer.split(',').map(Number);
      for (const idx of indices) {
        await card.locator('button[role="checkbox"]').nth(idx).click();
      }
      break;
    }
    case 'batch-choice': {
      const answers = info.answer.split(',');
      const buttons: string[] =
        info.dataButtons ??
        (await page.evaluate(() => {
          const raw = (window as Record<string, unknown>).__e2e_exercise as Record<string, unknown> | undefined;
          const arr = (raw?.data as Record<string, unknown> | undefined)?.buttons as unknown[] | undefined;
          if (!arr) return [];
          const result: string[] = [];
          for (let i = 0; i < arr.length; i++) {
            result.push(String(arr[i]));
          }
          return result;
        }));
      for (let i = 0; i < answers.length; i++) {
        const btnIdx = buttons.indexOf(answers[i]);
        if (btnIdx === -1) throw new Error(`Unknown button "${answers[i]}"`);
        await card.locator('.button-group').nth(i).locator('button').nth(btnIdx).click();
      }
      break;
    }
    case 'prime-factors': {
      const exponents = info.answer.split(',');
      const inputs = card.locator('sup input.coeff-input');
      for (let i = 0; i < exponents.length; i++) {
        await inputs.nth(i).fill(exponents[i]);
      }
      break;
    }
    default:
      throw new Error(`Unknown pattern: ${info.pattern}`);
  }
}

async function fillCustomAnswer(page: import('@playwright/test').Page, typeId: string): Promise<boolean> {
  const info = await page.evaluate(() => {
    const raw = (window as Record<string, unknown>).__e2e_exercise as Record<string, unknown> | undefined;
    if (!raw) return null;
    const data = raw.data as Record<string, unknown> | undefined;
    return {
      answer: String(raw.answer ?? ''),
      pattern: (String(raw.pattern ?? '') || null) as string | null,
      dataSubType: data ? String(data.subType ?? '') || undefined : undefined,
    };
  });
  if (!info) throw new Error('No exercise data');

  const card = page.locator('article.exercise-card');

  switch (typeId) {
    case 'pythagoras': {
      if (info.answer === 'cannot_compute') {
        await card.locator('button.cannot-compute-link').click();
        return true;
      }
      await card.locator('div.svg-overlay input.coeff-input').fill(info.answer);
      break;
    }
    case 'interiorAngles': {
      await card.locator('div.svg-overlay input.coeff-input').fill(info.answer);
      break;
    }
    case 'areaAndPerimeter': {
      if (info.answer === 'cannot_compute') {
        await card.locator('button.cannot-compute-link').click();
        return true;
      }
      const inputs = card.locator('input.coeff-input');
      const parts = info.answer.split('|');
      for (let i = 0; i < parts.length; i++) {
        await inputs.nth(i).fill(parts[i]);
      }
      break;
    }
    case 'scientificNotation': {
      if (info.answer.includes(',')) {
        const [coeff, exp] = info.answer.split(',');
        const inputs = card.locator('input.coeff-input');
        await inputs.nth(0).fill(coeff);
        if ((await inputs.count()) > 1) {
          await inputs.nth(1).fill(exp);
        }
      } else {
        await card.locator('input.coeff-input').first().fill(info.answer);
      }
      break;
    }
    case 'factorEquations': {
      const parts = info.answer.split(',');
      const inputs = card.locator('div.solution-inputs input.coeff-input');
      for (let i = 0; i < parts.length; i++) {
        await inputs.nth(i).fill(parts[i]);
      }
      break;
    }
    case 'factors': {
      const indices = info.answer.split(',').map(Number);
      for (const idx of indices) {
        await card.locator('button.factor-btn[role="checkbox"]').nth(idx).click();
      }
      break;
    }
    case 'factoringOut': {
      if (info.answer === '-1') {
        await card.locator('select.factor-select').selectOption('-1');
      } else {
        const parts = info.answer.split(',');
        const optionIdx = parseInt(parts[0], 10);
        const gcfCoeff = parts[1];
        const innerCoeffs = parts.slice(2);
        await card.locator('select.factor-select').selectOption(String(optionIdx));
        const inputs = card.locator('span.continuation input.coeff-input');
        await inputs.first().waitFor({ state: 'visible', timeout: 3000 });
        await inputs.nth(0).fill(gcfCoeff);
        for (let i = 0; i < innerCoeffs.length; i++) {
          await inputs.nth(i + 1).fill(innerCoeffs[i]);
        }
      }
      break;
    }
    case 'factoringBinomialFormulas': {
      if (info.answer === '0') {
        await card.locator('select.formula-select').selectOption('0');
      } else {
        const parts = info.answer.split(',');
        const formulaIdx = parseInt(parts[0], 10);
        const a = parts[1];
        const b = parts[2];
        await card.locator('select.formula-select').selectOption(String(formulaIdx));
        const inputs = card.locator('span.continuation input.coeff-input');
        await inputs.first().waitFor({ state: 'visible', timeout: 3000 });
        await inputs.nth(0).fill(a);
        if ((await inputs.count()) > 1) {
          await inputs.nth(1).fill(b);
        }
      }
      break;
    }
    case 'factoringOutAndBinomial': {
      if (info.answer === '-1') {
        await card.locator('select.factor-select').selectOption('-1');
        await card.locator('select.formula-select').selectOption('0');
      } else {
        const parts = info.answer.split(',');
        const formulaType = parseInt(parts[0], 10);
        const gcfIdx = parseInt(parts[2], 10);
        const gcfCoeff = parts[1];
        const a = parts[3];
        const b = parts[4];
        await card.locator('select.factor-select').selectOption(String(gcfIdx));
        await card.locator('select.formula-select').selectOption(String(formulaType));
        const gcfInputs = card.locator('span.continuation input.coeff-input');
        await gcfInputs.first().waitFor({ state: 'visible', timeout: 3000 });
        await gcfInputs.nth(0).fill(gcfCoeff);
        const binInputs = card.locator('span.binomial-body input.coeff-input');
        await binInputs.first().waitFor({ state: 'visible', timeout: 3000 });
        await binInputs.nth(0).fill(a);
        if ((await binInputs.count()) > 1) {
          await binInputs.nth(1).fill(b);
        }
      }
      break;
    }
    case 'simplifySymbolicFraction':
    case 'symbolicFractionOperations': {
      if (info.answer === 'cannot_simplify') {
        await card.locator('button.cannot-simplify-link').click();
        return true;
      } else {
        const parts = info.answer.split(';');
        const numPart = parts[0];
        const denPart = parts[1];
        const numCoeffs = numPart.split(',');
        const numInputs = card.locator(
          'span.frac-row:first-of-type span.coeff-field input.coeff-input, span.continuation span.coeff-field input.coeff-input',
        );
        for (let i = 0; i < numCoeffs.length; i++) {
          await numInputs.nth(i).fill(numCoeffs[i]);
        }
        if (denPart) {
          const denCoeffs = denPart.split(',');
          const denInputs = card.locator('span.frac-row:last-of-type span.coeff-field input.coeff-input');
          for (let i = 0; i < denCoeffs.length; i++) {
            await denInputs.nth(i).fill(denCoeffs[i]);
          }
        }
      }
      break;
    }
    case 'gcdLcm': {
      const subType = info.dataSubType;
      if (subType === 'factorization' || subType === undefined) {
        const parts = info.answer.split(';');
        if (parts.length === 2) {
          const [gcdExps, lcmExps] = parts;
          const allInputs = card.locator('.input-row span.prime-term sup input.coeff-input');
          const gcdCount = gcdExps.split(',').length;
          for (let i = 0; i < gcdCount; i++) {
            await allInputs.nth(i).fill(gcdExps.split(',')[i]);
          }
          for (let i = 0; i < lcmExps.split(',').length; i++) {
            await allInputs.nth(gcdCount + i).fill(lcmExps.split(',')[i]);
          }
        }
      } else {
        const [gcdAns, lcmAns] = info.answer.split(',');
        const inputs = card.locator('.input-row input.coeff-input');
        await inputs.nth(0).fill(gcdAns);
        await inputs.nth(1).fill(lcmAns);
      }
      break;
    }
    default:
      throw new Error(`Unknown custom type: ${typeId}`);
  }
  return false;
}
