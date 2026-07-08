// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExerciseComponent = (...args: any[]) => any;

export interface Exercise {
  prompt: string;
  answer: string;
  data?: Record<string, unknown>;
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
