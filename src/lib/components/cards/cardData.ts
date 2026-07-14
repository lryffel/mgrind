export interface TextInputCardData {
  promptKey?: string;
  promptArgs?: (string | number)[];
  promptMath?: string;
  promptKeySuffix?: string;
  prefixLatex?: string;
  suffixLatex?: string;
  correctLatex?: string;
  formatNumbers?: boolean;
}

export interface BatchChoiceCardData {
  promptKey?: string;
  rows: { latex: string; latex2?: string }[];
  buttons: string[];
}

export interface SingleChoiceCardData {
  promptKey?: string;
  promptArgs?: (string | number)[];
  promptArgKeys?: string[];
  promptText?: string;
  hideCorrectFeedback?: boolean;
  options: { label?: string; latex?: string; text?: string; textDe?: string }[];
}

export interface MultiChoiceCardData {
  promptKey?: string;
  promptMath?: string;
  promptKeySuffix?: string;
  layout?: 'grid';
  options: { label?: string; latex?: string }[];
}

export interface PrimeFactorsCardData {
  promptKey?: string;
  primes: number[];
}
