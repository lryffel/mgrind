export interface ExerciseField {
  label: string;
}

export interface Exercise {
  prompt: string;
  answer: string;
  fields?: ExerciseField[];
}

export interface ExerciseType {
  id: string;
  nameKey: string;
  descriptionKey: string;
  maxComplexity: number;
  generate: (seed: number, complexity: number) => Exercise;
  validate: (answer: string, exercise: Exercise) => boolean;
}

export interface Discipline {
  id: string;
  nameKey: string;
  exerciseTypeIds: string[];
}

export type Lang = 'en' | 'de';
