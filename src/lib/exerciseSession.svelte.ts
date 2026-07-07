import type { Exercise, ExerciseType } from './types';
import { exerciseTypes } from './data/exerciseTypes';
import { disciplines } from './data/disciplines';
import { mulberry32 } from './prng';
import { getComplexity, updateProgress } from './progress.svelte';

export class ExerciseSession {
  disciplineId = $state('');
  currentType = $state<ExerciseType>({} as ExerciseType);
  currentSeed = $state(0);
  userAnswer = $state('');
  userValues = $state<number[]>([]);
  feedback = $state<'correct' | 'incorrect' | null>(null);
  exercise = $state<Exercise>({} as Exercise);

  constructor(disciplineId: string) {
    this.disciplineId = disciplineId;
    this.next();
  }

  submit() {
    const answer = this.exercise.fields ? this.userValues.join(',') : this.userAnswer;
    const correct = this.currentType.validate(answer, this.exercise);
    updateProgress(this.currentType.id, correct, this.currentType.maxComplexity);
    this.feedback = correct ? 'correct' : 'incorrect';
  }

  formatAnswer(ex: Exercise): string {
    if (ex.fields) {
      const parts = ex.answer.split(',').map((e, i) => `${ex.fields![i].label}^${e}`);
      return parts.join(' × ');
    }
    return ex.answer;
  }

  next() {
    const discipline = disciplines.find((d) => d.id === this.disciplineId)!;
    const rng = mulberry32(Date.now());
    const index = Math.floor(rng() * discipline.exerciseTypeIds.length);
    this.currentType = exerciseTypes[discipline.exerciseTypeIds[index]];
    this.currentSeed = Date.now();
    this.exercise = this.currentType.generate(this.currentSeed, getComplexity(this.currentType.id));
    if (this.exercise.fields) {
      this.userValues = this.exercise.fields.map(() => 0);
    } else {
      this.userValues = [];
    }
    this.userAnswer = '';
    this.feedback = null;
  }
}
