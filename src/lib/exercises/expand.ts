import type { Exercise } from '../types';
import type { DictKey } from '../i18n.svelte';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { randInt, pick } from '../math/rng';
import { formatExpandedTerm, varMapLatex, varMapText } from '../math/varmap';
import { expandProduct, collectTerms, type Term } from './termAlgebra';

export interface ExpandData {
  fields: { variablePart: string }[];
  promptKey: DictKey;
}

const VAR_SETS = [['x'], ['x', 'y'], ['a'], ['a', 'b'], ['m'], ['m', 'n']];

function formatFactor(terms: Term[]): string {
  const parts: string[] = [];
  for (let i = 0; i < terms.length; i++) {
    parts.push(formatExpandedTerm(terms[i].coeff, terms[i].vars, i === 0));
  }
  return parts.join('');
}

function formatProductPrompt(factors: Term[][]): string {
  return factors.map((f) => (f.length === 1 ? formatFactor(f) : `(${formatFactor(f)})`)).join('');
}

function buildResult(terms: Term[], prompt: string): Exercise {
  const fields: { variablePart: string }[] = terms.map((t) => ({
    variablePart: varMapLatex(t.vars),
  }));
  const answer = terms.map((t) => String(t.coeff)).join(',');
  return { prompt, answer, pattern: 'multi-field', data: { fields, promptKey: 'exercise.expand.prompt' } };
}

function ensureTwoDistinct(terms: Term[], v: string): void {
  if (varMapText(terms[0].vars) === varMapText(terms[1].vars)) {
    const curD = Object.values(terms[0].vars)[0] || 0;
    terms[1].vars = { [v]: curD + 1 };
  }
}

function genMonoBinomial(rng: () => number, maxDegree: number, useTwoVars: boolean): Exercise {
  const candidates = useTwoVars && rng() > 0.4 ? VAR_SETS.filter((v) => v.length >= 2) : VAR_SETS;
  const varSet = pick(rng, candidates);
  const v = pick(rng, varSet);

  const monoD = randInt(rng, 1, Math.min(2, maxDegree));
  const monoC = randInt(rng, 1, 9);
  const mono: Term = { coeff: monoC, vars: { [v]: monoD } };

  const binomD1 = randInt(rng, 0, Math.min(1, maxDegree));
  const binomD2 = randInt(rng, 0, Math.min(1, maxDegree));
  const binomC1 = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
  const binomC2 = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);

  const binom: Term[] = [
    { coeff: binomC1, vars: { [v]: binomD1 } },
    { coeff: binomC2, vars: { [v]: binomD2 } },
  ];
  ensureTwoDistinct(binom, v);
  if (rng() > 0.5) [binom[0], binom[1]] = [binom[1], binom[0]];

  const factors = [[mono], binom];
  const prompt = formatProductPrompt(factors);
  const expanded = expandProduct(factors);
  const collected = collectTerms(expanded);

  if (collected.length < 2) {
    binom[0].vars = { [v]: 0 };
    binom[1].vars = { [v]: 1 };
    const retryPrompt = formatProductPrompt([[mono], binom]);
    const retryExpanded = expandProduct([[mono], binom]);
    return buildResult(collectTerms(retryExpanded), retryPrompt);
  }

  return buildResult(collected, prompt);
}

function genMonoTrinomial(rng: () => number, maxDegree: number, useTwoVars: boolean): Exercise {
  const candidates = useTwoVars && rng() > 0.3 ? VAR_SETS.filter((v) => v.length >= 2) : VAR_SETS;
  const varSet = pick(rng, candidates);
  const v = pick(rng, varSet);

  const monoD = randInt(rng, 1, Math.min(2, maxDegree));
  const monoC = randInt(rng, 1, 5);
  const mono: Term = { coeff: monoC, vars: { [v]: monoD } };

  const usedDegrees = new Set<number>();
  const tri: Term[] = [];
  for (let i = 0; i < 3; i++) {
    let d = randInt(rng, 0, Math.min(2, maxDegree));
    let attempts = 0;
    while (usedDegrees.has(d) && attempts < 20) {
      d = randInt(rng, 0, Math.min(2, maxDegree));
      attempts++;
    }
    usedDegrees.add(d);
    const coeff = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
    tri.push({ coeff, vars: { [v]: d } });
  }

  const factors = [[mono], tri];
  const prompt = formatProductPrompt(factors);
  const expanded = expandProduct(factors);
  const collected = collectTerms(expanded);

  if (collected.length < 2) {
    tri[0].vars = { [v]: 0 };
    tri[1].vars = { [v]: 1 };
    tri[2].vars = { [v]: 2 };
    const retryPrompt = formatProductPrompt([[mono], tri]);
    const retryExpanded = expandProduct([[mono], tri]);
    return buildResult(collectTerms(retryExpanded), retryPrompt);
  }

  return buildResult(collected, prompt);
}

function genBinomBinomial(rng: () => number, maxDegree: number): Exercise {
  const twoVarSet = pick(
    rng,
    VAR_SETS.filter((v) => v.length >= 2),
  );
  const v1 = twoVarSet[0];
  const v2 = twoVarSet[1];

  function buildTwoTerms(vars: string[]): Term[] {
    const used = new Set<string>();
    const result: Term[] = [];
    for (let i = 0; i < 2; i++) {
      const v = pick(rng, vars);
      let d = randInt(rng, 0, Math.min(1, maxDegree));
      let key = varMapText({ [v]: d });
      let attempts = 0;
      while (used.has(key) && attempts < 30) {
        d = randInt(rng, 0, Math.min(1, maxDegree));
        key = varMapText({ [v]: d });
        attempts++;
      }
      used.add(key);
      const coeff = randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1);
      result.push({ coeff, vars: { [v]: d } });
    }
    return result;
  }

  const useSameVar = rng() > 0.5;
  const binomA = buildTwoTerms(useSameVar ? [v1] : [v1, v2]);
  const binomB = buildTwoTerms(useSameVar ? [v1] : [v1, v2]);

  const factors = [binomA, binomB];
  const prompt = formatProductPrompt(factors);
  const expanded = expandProduct(factors);
  const collected = collectTerms(expanded);

  if (collected.length < 2) {
    binomA[0] = { coeff: 1, vars: { [v1]: 1 } };
    binomA[1] = { coeff: 1, vars: { [v1]: 0 } };
    binomB[0] = { coeff: 1, vars: { [v1]: 1 } };
    binomB[1] = { coeff: 1, vars: { [v1]: 0 } };
    const retryPrompt = formatProductPrompt([binomA, binomB]);
    const retryExpanded = expandProduct([binomA, binomB]);
    return buildResult(collectTerms(retryExpanded), retryPrompt);
  }

  return buildResult(collected, prompt);
}

function genBinomTrinomial(rng: () => number, maxDegree: number): Exercise {
  const twoVarSet = pick(
    rng,
    VAR_SETS.filter((v) => v.length >= 2),
  );
  const v1 = twoVarSet[0];
  const v2 = twoVarSet[1];
  const v3 = v1 === 'x' ? 'z' : v1 === 'a' ? 'c' : 'z';

  const binom: Term[] = [
    { coeff: randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1), vars: { [v1]: Math.min(1, maxDegree) } },
    { coeff: randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1), vars: { [v2]: Math.min(1, maxDegree) } },
  ];

  const tri: Term[] = [
    { coeff: randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1), vars: { [v1]: Math.min(1, maxDegree) } },
    { coeff: randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1), vars: { [v2]: Math.min(1, maxDegree) } },
    { coeff: randInt(rng, 1, 5) * (rng() > 0.4 ? 1 : -1), vars: { [v3]: 1 } },
  ];

  const factors = [binom, tri];
  const prompt = formatProductPrompt(factors);
  const expanded = expandProduct(factors);
  const collected = collectTerms(expanded);

  if (collected.length < 2) {
    binom[0] = { coeff: 1, vars: { [v1]: 1 } };
    binom[1] = { coeff: 1, vars: { [v2]: 1 } };
    tri[0] = { coeff: 1, vars: { [v1]: 1 } };
    tri[1] = { coeff: 1, vars: { [v2]: 1 } };
    tri[2] = { coeff: 1, vars: { [v3]: 1 } };
    const retryPrompt = formatProductPrompt([binom, tri]);
    const retryExpanded = expandProduct([binom, tri]);
    return buildResult(collectTerms(retryExpanded), retryPrompt);
  }

  return buildResult(collected, prompt);
}

export function generateExpand(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  const maxDegree = clamped <= 2 ? 1 : clamped <= 5 ? 2 : clamped <= 8 ? 3 : 4;

  if (clamped <= 4) {
    return genMonoBinomial(rng, maxDegree, false);
  }

  const shapeRoll = rng();
  if (shapeRoll < 0.3) {
    return genMonoBinomial(rng, maxDegree, true);
  } else if (shapeRoll < 0.55) {
    return genMonoTrinomial(rng, maxDegree, true);
  } else if (shapeRoll < 0.8) {
    return genBinomBinomial(rng, maxDegree);
  } else {
    return genBinomTrinomial(rng, maxDegree);
  }
}

export { validateMultiField as validateExpand } from '../validation';
