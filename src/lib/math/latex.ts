export function cmd(s: string): string {
  return s.startsWith('\\') ? s + '{}' : s;
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
