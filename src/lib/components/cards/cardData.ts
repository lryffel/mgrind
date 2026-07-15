import type { DictKey } from '../../i18n.svelte';

export interface TextInputCardData {
  promptKey?: DictKey;
  promptArgs?: (string | number)[];
  promptMath?: string;
  promptKeySuffix?: DictKey;
  prefixLatex?: string;
  suffixLatex?: string;
  correctLatex?: string;
  formatNumbers?: boolean;
}

export interface BatchChoiceCardData {
  promptKey?: DictKey;
  rows: { latex: string; latex2?: string }[];
  buttons: string[];
}

export interface SingleChoiceCardData {
  promptKey?: DictKey;
  promptArgs?: (string | number)[];
  promptArgKeys?: DictKey[];
  promptText?: string;
  hideCorrectFeedback?: boolean;
  options: { label?: DictKey; latex?: string; text?: string; textDe?: string }[];
}

export interface MultiChoiceCardData {
  promptKey?: DictKey;
  promptMath?: string;
  promptKeySuffix?: DictKey;
  layout?: 'grid';
  options: { label?: DictKey; latex?: string }[];
}

export interface PrimeFactorsCardData {
  promptKey?: DictKey;
  primes: number[];
}
