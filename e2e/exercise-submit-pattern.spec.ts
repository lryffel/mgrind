import { test, expect } from '@playwright/test';
import { disciplines } from '../src/lib/data/disciplines';
import type { Exercise } from '../src/lib/types';
import { generateMultiplication } from '../src/lib/exercises/multiplication';
import { generateDivision } from '../src/lib/exercises/division';
import { generateSquares } from '../src/lib/exercises/squares';
import { generateSigns } from '../src/lib/exercises/signs';
import { generateOrderOfOperations } from '../src/lib/exercises/orderOfOperations';
import { generatePercentExercise } from '../src/lib/exercises/percent';
import { generateRoundingSigfigsExercise } from '../src/lib/exercises/roundingSigfigs';
import { generateUnitConversion } from '../src/lib/exercises/unitConversion';
import { generatePrimeFactorisation } from '../src/lib/exercises/primeFactorisation';
import { generateSimplifyFraction } from '../src/lib/exercises/simplifyFraction';
import { generateAdditionFraction } from '../src/lib/exercises/additionFraction';
import { generateMultiplicationFraction } from '../src/lib/exercises/multiplicationFraction';
import { generateCompareFractions } from '../src/lib/exercises/compareFractions';
import { generateNumbersTriviaExercise } from '../src/lib/exercises/numbersTrivia';
import { generateFractionTriviaExercise } from '../src/lib/exercises/fractionTrivia';
import { generateSubstitutionExercise } from '../src/lib/exercises/substitution';
import { generateBinomialFormulas } from '../src/lib/exercises/binomialFormulas';
import { generateCollectingTerms } from '../src/lib/exercises/collectingTerms';
import { generateExpand } from '../src/lib/exercises/expand';
import { generateExpandAndCollect } from '../src/lib/exercises/expandAndCollect';
import { generateNecessityOfParenthesesExercise } from '../src/lib/exercises/necessityOfParentheses';
import { generateLinearEquationsExercise } from '../src/lib/exercises/linearEquations';
import { generateTermTransformationsTrivia } from '../src/lib/exercises/termTransformationsTrivia';

const FIXED_SEED = 1111111111111;

const generators: Record<string, (seed: number, complexity: number) => Exercise> = {
  multiplication: generateMultiplication,
  division: generateDivision,
  squares: generateSquares,
  signs: generateSigns,
  orderOfOperations: generateOrderOfOperations,
  percent: generatePercentExercise,
  roundingSigfigs: generateRoundingSigfigsExercise,
  unitConversion: generateUnitConversion,
  primeFactorisation: generatePrimeFactorisation,
  simplifyFraction: generateSimplifyFraction,
  additionFraction: generateAdditionFraction,
  multiplicationFraction: generateMultiplicationFraction,
  compareFractions: generateCompareFractions,
  numbersTrivia: generateNumbersTriviaExercise,
  fractionTrivia: generateFractionTriviaExercise,
  substitution: generateSubstitutionExercise,
  binomialFormulas: generateBinomialFormulas,
  collectingTerms: generateCollectingTerms,
  expand: generateExpand,
  expandAndCollect: generateExpandAndCollect,
  necessityOfParentheses: generateNecessityOfParenthesesExercise,
  linearEquations: generateLinearEquationsExercise,
  termTransformationsTrivia: generateTermTransformationsTrivia,
};

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
    Date.now = () => 1111111111111;
  });
  await page.goto('/');
});

for (const [typeId, loc] of typeLocations) {
  const gen = generators[typeId];
  if (!gen) continue;

  const expected = gen(FIXED_SEED, 0);

  if (!expected.pattern || expected.pattern === 'custom') continue;

  test(`"${typeId}" — submit correct answer and verify feedback`, async ({ page }) => {
    const card = page.locator('article.discipline-card').nth(loc.di);
    await card.locator('.gear-button').click();
    await expect(card.locator('.type-list')).toBeVisible();

    const typeRow = card.locator('.type-row').nth(loc.ti);
    await typeRow.click();

    const exerciseCard = page.locator('article.exercise-card');
    const dialog = page.locator('dialog[open]');

    if (!(await exerciseCard.isVisible())) {
      await expect(dialog).toBeVisible({ timeout: 3000 });
      await expect(dialog.locator('button', { hasText: 'Enable anyway' })).toBeVisible();
      await dialog.locator('button', { hasText: 'Enable anyway' }).click();
      await expect(dialog).not.toBeVisible();
      await typeRow.click();
      await expect(exerciseCard).toBeVisible({ timeout: 3000 });
    }

    const dataButtons: string[] | undefined =
      expected.pattern === 'batch-choice' ? (expected.data as { buttons?: string[] })?.buttons : undefined;

    await fillAnswer(page, expected.pattern, expected.answer, dataButtons);
    await page.locator('button', { hasText: 'Submit' }).click();
    await expect(page.locator('p.feedback.correct')).toBeVisible({ timeout: 3000 });

    await page.locator('button', { hasText: 'Next' }).click();
    await expect(page.locator('article.exercise-card')).toBeVisible({ timeout: 3000 });
  });
}

async function fillAnswer(
  page: import('@playwright/test').Page,
  pattern: string,
  answer: string,
  dataButtons?: string[],
) {
  const card = page.locator('article.exercise-card');

  switch (pattern) {
    case 'text-input': {
      await card.locator('input').fill(answer);
      break;
    }
    case 'fraction-input': {
      const [num, den] = answer.split(',');
      const inputs = card.locator('.fraction-input input');
      await inputs.nth(0).fill(num);
      await inputs.nth(1).fill(den);
      break;
    }
    case 'multi-field': {
      const parts = answer.split(',');
      const inputs = card.locator('.coeff-field input');
      for (let i = 0; i < parts.length; i++) {
        await inputs.nth(i).fill(parts[i]);
      }
      break;
    }
    case 'single-choice': {
      const idx = parseInt(answer, 10);
      await card.locator('button[role="radio"]').nth(idx).click();
      break;
    }
    case 'multi-choice': {
      const indices = answer.split(',').map(Number);
      for (const idx of indices) {
        await card.locator('button[role="checkbox"]').nth(idx).click();
      }
      break;
    }
    case 'batch-choice': {
      const answers = answer.split(',');
      const buttons = dataButtons ?? [];
      for (let i = 0; i < answers.length; i++) {
        const btnIdx = buttons.indexOf(answers[i]);
        if (btnIdx === -1) throw new Error(`Unknown button value "${answers[i]}" in row ${i}`);
        await card.locator('.button-group').nth(i).locator('button').nth(btnIdx).click();
      }
      break;
    }
    case 'prime-factors': {
      const exponents = answer.split(',');
      const inputs = card.locator('sup input');
      for (let i = 0; i < exponents.length; i++) {
        await inputs.nth(i).fill(exponents[i]);
      }
      break;
    }
    default:
      throw new Error(`Unknown pattern: ${pattern}`);
  }
}
