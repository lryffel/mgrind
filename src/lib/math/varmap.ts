export type VarMap = Record<string, number>;

export interface FactorOption {
  text: string;
  latex: string;
  innerVarParts: string[];
}

const SUPERSCRIPTS: Record<string, string> = {
  '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
  '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
  '8': '\u2078', '9': '\u2079',
};

export function varMapMultiply(a: VarMap, b: VarMap): VarMap {
  const result = { ...a };
  for (const [k, v] of Object.entries(b)) {
    result[k] = (result[k] || 0) + v;
  }
  return result;
}

export function varMapDivide(a: VarMap, b: VarMap): VarMap | null {
  const result: VarMap = {};
  for (const [k, v] of Object.entries(a)) {
    const d = b[k] || 0;
    if (v < d) return null;
    if (v > d) result[k] = v - d;
  }
  for (const [k, v] of Object.entries(b)) {
    if (v !== 0 && !(k in a)) return null;
  }
  return result;
}

export function varMapIsEmpty(v: VarMap): boolean {
  return Object.keys(v).length === 0 || Object.values(v).every((e) => e === 0);
}

export function varMapLatex(v: VarMap): string {
  const sorted: VarMap = {};
  for (const k of Object.keys(v).sort()) {
    if (v[k] !== 0) sorted[k] = v[k];
  }
  if (Object.keys(sorted).length === 0) return '';
  return Object.entries(sorted)
    .map(([k, e]) => `${k}${e === 1 ? '' : `^{${e}}`}`)
    .join('');
}

export function varMapText(v: VarMap): string {
  const sorted: VarMap = {};
  for (const k of Object.keys(v).sort()) {
    if (v[k] !== 0) sorted[k] = v[k];
  }
  if (Object.keys(sorted).length === 0) return '';
  return Object.entries(sorted)
    .map(([k, e]) => `${k}${e === 1 ? '' : `^${e}`}`)
    .join('');
}

export function varMapUnicode(v: VarMap): string {
  const sorted: VarMap = {};
  for (const k of Object.keys(v).sort()) {
    if (v[k] !== 0) sorted[k] = v[k];
  }
  if (Object.keys(sorted).length === 0) return '';
  return Object.entries(sorted)
    .map(([k, e]) => `${k}${e === 1 ? '' : String(e).split('').map((d) => SUPERSCRIPTS[d]).join('')}`)
    .join('');
}

export function varMapDivisors(v: VarMap): VarMap[] {
  const entries = Object.entries(v);
  const results: VarMap[] = [];

  function recurse(idx: number, current: VarMap) {
    if (idx === entries.length) {
      if (!varMapIsEmpty(current)) {
        results.push({ ...current });
      }
      return;
    }
    const [name, exp] = entries[idx];
    for (let d = 0; d <= exp; d++) {
      if (d > 0) current[name] = d;
      recurse(idx + 1, current);
      if (d > 0) delete current[name];
    }
  }

  recurse(0, {});
  return results;
}

export function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

export function gcdArray(arr: number[]): number {
  return arr.reduce(gcd, 0);
}

export function buildFactorOptions(termVarParts: VarMap[]): FactorOption[] {
  const allDivisors = new Map<string, VarMap>();
  for (const tvp of termVarParts) {
    for (const d of varMapDivisors(tvp)) {
      const text = varMapText(d);
      if (!allDivisors.has(text)) {
        allDivisors.set(text, d);
      }
    }
  }

  const divisors = [...allDivisors.values()].sort((a, b) => varMapUnicode(a).localeCompare(varMapUnicode(b)));

  return divisors.map((d) => {
    const innerVarParts = termVarParts.map((tvp) => {
      const remaining = varMapDivide(tvp, d);
      return remaining ? varMapLatex(remaining) : varMapLatex(tvp);
    });

    return {
      text: varMapUnicode(d),
      latex: varMapLatex(d),
      innerVarParts,
    };
  });
}

export function formatExpandedTerm(coeff: number, vars: VarMap, isFirst: boolean): string {
  const absCoeff = Math.abs(coeff);
  const varLatex = varMapLatex(vars);
  const isEmpty = !varLatex;

  let coeffStr: string;
  if (absCoeff === 1 && !isEmpty) {
    coeffStr = '';
  } else {
    coeffStr = String(absCoeff);
  }

  const sign = coeff < 0 ? '-' : isFirst ? '' : '+';
  return `${sign}${coeffStr}${varLatex}`;
}
