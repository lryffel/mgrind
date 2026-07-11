export function cmd(s: string): string {
  return s.startsWith('\\') ? s + '{}' : s;
}

/** Render a fraction for a prompt; skips \dfrac when den === 1. */
export function promptFraction(num: number, den: number): string {
  if (den === 1) return String(num);
  return `\\dfrac{${num}}{${den}}`;
}

export function coeffLatex(num: number, den: number, varPart: string): string {
  if (num === 0) return '0';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  let coeffStr: string;
  if (den === 1) {
    coeffStr = absNum === 1 && varPart ? '' : String(absNum);
  } else {
    coeffStr = `\\frac{${absNum}}{${den}}`;
  }

  return `${sign}${coeffStr}${varPart}`;
}
