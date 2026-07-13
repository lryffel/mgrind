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
  num1?: number;
  den1?: number;
  num2?: number;
  den2?: number;
  op?: string;
  promptKey?: string;
  fields?: { variablePart: string }[];
  mode?: 'fraction' | 'polynomial';
  denominatorFields?: { variablePart: string }[];
  cannotSimplifyType?: string;
  primes?: number[];
  subType?: string;
  variable?: string;
  value?: string;
  term?: string;
  complexity?: number;
  varA?: string | null;
  varB?: string;
  correctFormula?: number;
  numSolutions?: number;
  questions?: { latex: string; needsParens: boolean }[];
  signs?: { latex: string; sign: string }[];
  comparisons?: { num1: number; den1: number; num2: number; den2: number; correctOperator: string }[];
  sides?: number;
  angles?: { value: number; isMissing: boolean }[];
  isRight?: boolean;
  triangleVertices?: { x: number; y: number }[];
  rightAngleVertex?: number | null;
  sideANum?: number;
  sideADen?: number;
  sideBNum?: number;
  sideBDen?: number;
  sideCNum?: number;
  sideCDen?: number;
  missingSide?: string;
  answerLatex?: string;
  triviaType?: string;
  triviaA?: number;
  triviaB?: number;
  triviaExpressionLatex?: string;
  triviaOptionsLatex?: string[];
  triviaOptionsText?: string[];
  triviaSubType?: string;
  sigfigsCount?: number;
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
