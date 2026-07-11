import type { VarMap } from '../math/varmap';
import { varMapText, varMapMultiply, varMapUnicode } from '../math/varmap';

export interface Term {
  coeff: number;
  vars: VarMap;
}

export function multiplyTerms(a: Term, b: Term): Term {
  return { coeff: a.coeff * b.coeff, vars: varMapMultiply(a.vars, b.vars) };
}

export function expandProduct(factors: Term[][]): Term[] {
  let result = factors[0];
  for (let i = 1; i < factors.length; i++) {
    const next: Term[] = [];
    for (const a of result) {
      for (const b of factors[i]) {
        next.push(multiplyTerms(a, b));
      }
    }
    result = next;
  }
  return result;
}

export function collectTerms(terms: Term[]): Term[] {
  const map = new Map<string, { vars: VarMap; coeff: number }>();
  for (const t of terms) {
    const key = varMapText(t.vars);
    const existing = map.get(key);
    if (existing) {
      existing.coeff += t.coeff;
    } else {
      map.set(key, { vars: t.vars, coeff: t.coeff });
    }
  }

  return [...map.values()]
    .filter((t) => t.coeff !== 0)
    .sort((a, b) => {
      const degA = Object.values(a.vars).reduce((s, v) => s + v, 0);
      const degB = Object.values(b.vars).reduce((s, v) => s + v, 0);
      if (degB !== degA) return degB - degA;
      return varMapUnicode(a.vars).localeCompare(varMapUnicode(b.vars));
    });
}
