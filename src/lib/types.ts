import type { Component } from 'svelte';
import type { DictKey } from './i18n.svelte';

export type InputContext = 'coefficient' | 'exponent' | 'summand' | 'numerator' | 'denominator' | 'plain';

export type ExerciseFeedback = 'correct' | 'incorrect' | null;

export type CardPattern =
  | 'text-input'
  | 'fraction-input'
  | 'multi-field'
  | 'batch-choice'
  | 'single-choice'
  | 'multi-choice'
  | 'prime-factors'
  | 'custom';

export interface ExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  onNext: () => void;
  feedback: ExerciseFeedback;
}

export interface Exercise {
  prompt: string;
  answer: string;
  pattern?: CardPattern;
  data?: unknown;
}

export interface Prerequisite {
  typeId: string;
  complexity: number;
}

export interface ExerciseType {
  id: string;
  nameKey: DictKey;
  descriptionKey: DictKey;
  maxComplexity: number;
  generate: (seed: number, complexity: number) => Exercise;
  validate: (answer: string, exercise: Exercise) => boolean;
  component?: Component<ExerciseProps>;
  prerequisites?: Prerequisite[];
  instructionComponent?: Component;
}

export interface Discipline {
  id: string;
  nameKey: DictKey;
  exerciseTypeIds: string[];
}

export type Lang = 'en' | 'de';
