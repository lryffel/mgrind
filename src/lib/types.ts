import type { Component } from 'svelte';

export type InputContext = 'coefficient' | 'exponent' | 'summand' | 'numerator' | 'denominator' | 'plain';

export type ExerciseFeedback = 'correct' | 'incorrect' | null;

export interface ExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  onNext: () => void;
  feedback: ExerciseFeedback;
}

export interface ExerciseData {
  /** Properties shared across 2+ exercise types */
  promptKey?: string;
  fields?: { variablePart: string }[];
  subType?: string;
  varA?: string | null;
  varB?: string;
}

export interface Exercise {
  prompt: string;
  answer: string;
  data?: unknown;
}

export interface Prerequisite {
  typeId: string;
  complexity: number;
}

export interface ExerciseType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  maxComplexity: number;
  generate: (seed: number, complexity: number) => Exercise;
  validate: (answer: string, exercise: Exercise) => boolean;
  component: Component<ExerciseProps>;
  prerequisites?: Prerequisite[];
  instructionComponent?: Component;
}

export interface Discipline {
  id: string;
  nameKey: string;
  exerciseTypeIds: string[];
}

export type Lang = 'en' | 'de';
