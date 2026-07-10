import { _ } from './i18n.svelte';

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

  let _userLatex = $derived(
    (!_den || _den === '0' || _den === '1') ? `${_num || '0'}` : `\\frac{${_num || '0'}}{${_den}}`,
  );

  function getSubmitValue(separator = ','): string {
    return `${_num || '0'}${separator}${!_den || _den === '0' ? '1' : _den}`;
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
  return d === '1' ? num : `\\frac{${num}}{${d}}`;
}
