import type { Exercise, ExerciseType } from './types';
import { exerciseTypes } from './data/exerciseTypes';
import { disciplines } from './data/disciplines';
import { mulberry32 } from './prng';
import { getComplexity, updateProgress } from './progress.svelte';
import { getEnabledTypeIds } from './disabledTypes.svelte';
import { arePrerequisitesMet } from './prerequisites.svelte';

export class ExerciseSession {
  disciplineId = $state('');
  currentType = $state<ExerciseType>({} as ExerciseType);
  currentSeed = $state(0);
  feedback = $state<'correct' | 'incorrect' | null>(null);
  exercise = $state<Exercise>({} as Exercise);

  constructor(disciplineId: string) {
    this.disciplineId = disciplineId;
    this.next();
  }

  submit(answer: string) {
    const correct = this.currentType.validate(answer, this.exercise);
    updateProgress(this.currentType.id, correct, this.currentType.maxComplexity);
    this.feedback = correct ? 'correct' : 'incorrect';
  }

  next() {
    const discipline = disciplines.find((d) => d.id === this.disciplineId)!;
    const typeIds = getEnabledTypeIds(discipline).filter((id) => arePrerequisitesMet(id));
    if (typeIds.length === 0) {
      this.currentType = exerciseTypes[discipline.exerciseTypeIds[0]];
    } else {
      const rng = mulberry32(Date.now());
      const index = Math.floor(rng() * typeIds.length);
      this.currentType = exerciseTypes[typeIds[index]];
    }
    this.currentSeed = Date.now();
    this.exercise = this.currentType.generate(this.currentSeed, getComplexity(this.currentType.id));
    this.feedback = null;
  }
}
