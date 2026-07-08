import katex from 'katex';

export function renderMath(expr: string): string {
  return katex.renderToString(expr, { throwOnError: false, displayMode: false });
}
