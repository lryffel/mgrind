import { _ } from './i18n.svelte';
import { coeffLatex } from './math/latex';

export interface FractionInput {
  num: string;
  den: string;
  validationError: string | null;
  userLatex: string;
  getSubmitValue: (separator?: string) => string;
}

export function useFractionInput(): FractionInput {
  let _num = $state('');
  let _den = $state('');

  let _validationError = $derived(_num.includes(',') || _den.includes(',') ? _('error.decimalComma') : null);

  let _userLatex = $derived.by(() => {
    if (!_den || _den === '0' || _den === '1') {
      const n = Number(_num);
      return isNaN(n) ? _num || '0' : coeffLatex(n, 1, '');
    }
    const n = Number(_num);
    const d = Number(_den);
    if (!isNaN(n) && !isNaN(d) && d !== 0) {
      return coeffLatex(n, d, '').replace('\\frac', '\\dfrac');
    }
    return `\\dfrac{${_num || '0'}}{${_den}}`;
  });

  function getSubmitValue(separator = ','): string {
    return `${_num}${separator}${_den}`;
  }

  return {
    get num() {
      return _num;
    },
    set num(v: string) {
      _num = v;
    },
    get den() {
      return _den;
    },
    set den(v: string) {
      _den = v;
    },
    get validationError() {
      return _validationError;
    },
    get userLatex() {
      return _userLatex;
    },
    getSubmitValue,
  };
}

export function fractionLatex(num: string, den: string): string {
  const d = !den || den === '0' ? '1' : den;
  if (d === '1') return num;
  const n = Number(num);
  const dn = Number(d);
  if (!isNaN(n) && !isNaN(dn)) {
    return coeffLatex(n, dn, '');
  }
  return `\\dfrac{${num}}{${d}}`;
}
