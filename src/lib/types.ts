import type { Component } from 'svelte';

export type ExerciseFeedback = 'correct' | 'incorrect' | null;

export interface ExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
  onNext: () => void;
  feedback: ExerciseFeedback;
}

export type ExerciseComponent = Component<ExerciseProps>;

export interface ExerciseData {
  num1?: number;
  den1?: number;
  num2?: number;
  den2?: number;
  op?: string;
  promptKey?: string;
  fields?: { variablePart: string }[];
  primes?: number[];
  subType?: string;
  variable?: string;
  value?: string;
  term?: string;
  complexity?: number;
  varA?: string | null;
  varB?: string;
  correctFormula?: number;
}

export interface Exercise {
  prompt: string;
  answer: string;
  data?: ExerciseData;
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
  component: ExerciseComponent;
  prerequisites?: Prerequisite[];
}

export interface Discipline {
  id: string;
  nameKey: string;
  exerciseTypeIds: string[];
}

export type Lang = 'en' | 'de';
