import { disciplines } from './data/disciplines';
import { mulberry32 } from './prng';

export function pickExerciseTypeId(disciplineId: string, seed?: number): string {
  const discipline = disciplines.find((d) => d.id === disciplineId)!;
  const rng = mulberry32(seed ?? Date.now());
  const index = Math.floor(rng() * discipline.exerciseTypeIds.length);
  return discipline.exerciseTypeIds[index];
}
