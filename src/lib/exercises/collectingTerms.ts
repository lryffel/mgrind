import type { Exercise } from '../types';
import { mulberry32 } from '../prng';
import { clampComplexity } from '../math/number';
import { reduceFrac, parseFrac } from '../math/fraction';
import { randInt, pick, pickDistinct, shuffle } from '../math/rng';

interface Monomial {
  latex: string;
  degree: number;
  key: string;
  altLatex?: string;
}

const CONSTANT: Monomial = { latex: '', degree: 0, key: '_' };

function makeVarSet(v1: string, v2: string, v3: string): Monomial[] {
  const cmd = (s: string) => (s.startsWith('\\') ? s + '{}' : s);
  const a = cmd(v1),
    b = cmd(v2),
    c = cmd(v3);
  return [
    { latex: v1, degree: 1, key: 'k0' },
    { latex: v2, degree: 1, key: 'k1' },
    { latex: v3, degree: 1, key: 'k2' },
    { latex: `${a}^{2}`, degree: 2, key: 'k00' },
    { latex: `${b}^{2}`, degree: 2, key: 'k11' },
    { latex: `${c}^{2}`, degree: 2, key: 'k22' },
    { latex: `${a}${b}`, degree: 2, key: 'k01', altLatex: `${b}${a}` },
    { latex: `${a}${c}`, degree: 2, key: 'k02', altLatex: `${c}${a}` },
    { latex: `${b}${c}`, degree: 2, key: 'k12', altLatex: `${c}${b}` },
    { latex: `${a}^{3}`, degree: 3, key: 'k000' },
    { latex: `${b}^{3}`, degree: 3, key: 'k111' },
    { latex: `${c}^{3}`, degree: 3, key: 'k222' },
    { latex: `${a}^{2}${b}`, degree: 3, key: 'k001', altLatex: `${b}${a}^{2}` },
    { latex: `${a}^{2}${c}`, degree: 3, key: 'k002', altLatex: `${c}${a}^{2}` },
    { latex: `${a}${b}^{2}`, degree: 3, key: 'k011', altLatex: `${b}^{2}${a}` },
    { latex: `${a}${c}^{2}`, degree: 3, key: 'k022', altLatex: `${c}^{2}${a}` },
    { latex: `${b}^{2}${c}`, degree: 3, key: 'k112', altLatex: `${c}${b}^{2}` },
    { latex: `${b}${c}^{2}`, degree: 3, key: 'k122', altLatex: `${c}^{2}${b}` },
    { latex: `${a}${b}${c}`, degree: 3, key: 'k012', altLatex: `${b}${a}${c}` },
  ];
}

const VAR_SETS: Monomial[][] = [
  makeVarSet('a', 'b', 'c'),
  makeVarSet('\\ell', 'm', 'n'),
  makeVarSet('x', 'y', 'z'),
  makeVarSet('i', 'j', 'k'),
  makeVarSet('r', 's', 't'),
  makeVarSet('u', 'v', 'w'),
];

function formatPromptTerm(absNum: number, varLatex: string): string {
  if (absNum === 1 && varLatex) return '';
  return String(absNum);
}

function formatTermBlock(num: number, den: number, varLatex: string, isFirst: boolean): string {
  if (num === 0) return '';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : isFirst ? '' : '+';
  const coeffDisplay = formatPromptTerm(absNum, varLatex);

  const prefix = isFirst ? (sign === '-' ? '-' : '') : ` ${sign} `;
  return `${prefix}${coeffDisplay}${varLatex}`;
}

function formatAnswerCoeff(num: number): string {
  return String(num);
}

export function formatCollectingAnswer(coeffStrs: string[], variableParts: string[]): string {
  const displayTerms: string[] = [];

  for (let i = 0; i < coeffStrs.length; i++) {
    const c = coeffStrs[i];
    if (!c || c === '0') continue;

    const parsed = parseFrac(c);
    if (parsed === null) continue;
    const [num, den] = parsed;
    if (num === 0) continue;

    const absNum = Math.abs(num);
    const varPart = variableParts[i] ?? '';

    let coeffDisplay: string;
    if (den === 1) {
      coeffDisplay = absNum === 1 && varPart ? '' : String(absNum);
    } else {
      coeffDisplay = `\\frac{${absNum}}{${den}}`;
    }

    const termBody = coeffDisplay + varPart;
    const sign = num < 0 ? (displayTerms.length === 0 ? '-' : ' - ') : displayTerms.length === 0 ? '' : ' + ';

    displayTerms.push(sign + termBody);
  }

  return displayTerms.join('') || '0';
}

export function generateCollectingTerms(seed: number, complexity: number): Exercise {
  const rng = mulberry32(seed);
  const clamped = clampComplexity(complexity, 10);

  const maxDegree = clamped <= 2 ? 1 : clamped <= 5 ? 2 : 3;
  const numTypes = clamped <= 1 ? 2 : randInt(rng, 2, 4);
  const maxTermsPerType = clamped <= 4 ? 2 : clamped <= 7 ? 2 : 3;

  const varSet = pick(rng, VAR_SETS);
  const monomials = [CONSTANT, ...varSet.filter((m) => m.degree <= maxDegree)];
  const selected = pickDistinct(rng, monomials, numTypes);

  for (let attempt = 0; attempt < 20; attempt++) {
    const result = tryGenerate(rng, selected, maxTermsPerType, seed, attempt, monomials);
    if (result) return result;
  }

  const fallback = tryGenerate(rng, selected.slice(0, 2), 2, seed, 0, monomials);
  if (fallback) return fallback;
  const fallbackVar = varSet[0].latex;
  return {
    prompt: `${fallbackVar} + 2${fallbackVar}`,
    answer: '3',
    data: { fields: [{ variablePart: fallbackVar }], promptKey: 'exercise.collectingTerms.prompt' },
  };
}

function tryGenerate(
  rng: () => number,
  selected: Monomial[],
  maxTermsPerType: number,
  seed: number,
  attempt: number,
  monomials: Monomial[],
): Exercise | null {
  const localRng = mulberry32(seed + attempt * 13);

  const termGroups: { num: number; den: number; displayLatex: string; monomial: Monomial }[][] = [];

  for (let tIdx = 0; tIdx < selected.length; tIdx++) {
    const monomial = selected[tIdx];
    const terms: { num: number; den: number; displayLatex: string; monomial: Monomial }[] = [];
    const minTerms = tIdx === 0 ? 2 : 1;
    const numTerms = randInt(localRng, minTerms, maxTermsPerType);

    for (let i = 0; i < numTerms; i++) {
      let num = randInt(localRng, 1, 9);
      if (localRng() > 0.4) num = -num;
      const den = 1;
      terms.push({ num, den, displayLatex: '', monomial });
    }

    if (monomial.altLatex && numTerms >= 2) {
      const altCount = randInt(localRng, 1, numTerms - 1);
      const indices = [...Array(numTerms).keys()];
      shuffle(localRng, indices);
      for (let i = 0; i < numTerms; i++) {
        terms[indices[i]].displayLatex = i < altCount ? monomial.altLatex : monomial.latex;
      }
    } else {
      for (const term of terms) {
        term.displayLatex = monomial.altLatex && localRng() > 0.5 ? monomial.altLatex : monomial.latex;
      }
    }

    termGroups.push(terms);
  }

  const allTerms = shuffle(localRng, termGroups.flat());

  const totals = new Map<string, [number, number]>();
  for (const group of termGroups) {
    for (const term of group) {
      const existing = totals.get(term.monomial.latex) ?? [0, 1];
      const newNum = existing[0] * term.den + term.num * existing[1];
      const newDen = existing[1] * term.den;
      totals.set(term.monomial.latex, reduceFrac(newNum, newDen));
    }
  }

  const nonZero = [...totals.entries()]
    .filter(([, [n]]) => n !== 0)
    .sort((a, b) => {
      const mA = monomials.find((m) => m.latex === a[0])!;
      const mB = monomials.find((m) => m.latex === b[0])!;
      if (mA.degree !== mB.degree) return mB.degree - mA.degree;
      return mA.key.localeCompare(mB.key);
    });

  if (nonZero.length < 2) return null;

  const promptParts: string[] = [];
  for (let i = 0; i < allTerms.length; i++) {
    const t = allTerms[i];
    const part = formatTermBlock(t.num, t.den, t.displayLatex, i === 0);
    if (part) promptParts.push(part);
  }
  const prompt = promptParts.join('');

  const answerParts: string[] = [];
  const fields: { variablePart: string }[] = [];

  for (const [monomialLatex, [num]] of nonZero) {
    answerParts.push(formatAnswerCoeff(num));
    fields.push({ variablePart: monomialLatex });
  }

  return {
    prompt,
    answer: answerParts.join(','),
    data: { fields, promptKey: 'exercise.collectingTerms.prompt' },
  };
}

export { validateMultiField as validateCollectingTerms } from '../validation';
