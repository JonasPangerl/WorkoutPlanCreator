import type { CardioActivity, CardioPreset, Exercise, MuscleGroup, PlannedExercise } from '../types';

export const CARDIO_ACTIVITIES: CardioActivity[] = ['run', 'bike', 'rower', 'crosstrainer', 'stairmaster', 'walk'];

export const CARDIO_ACTIVITY_MUSCLES: Record<CardioActivity, { primary: MuscleGroup[]; secondary: MuscleGroup[] }> = {
  run: { primary: ['quads', 'calves'], secondary: ['glutes', 'hamstrings'] },
  bike: { primary: ['quads'], secondary: ['glutes', 'calves'] },
  rower: { primary: ['lats', 'hamstrings'], secondary: ['glutes', 'forearms'] },
  crosstrainer: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'] },
  stairmaster: { primary: ['glutes', 'quads'], secondary: ['calves', 'hamstrings'] },
  walk: { primary: ['calves'], secondary: ['quads', 'glutes'] },
};

export function countsCardioForMuscleMap(block: PlannedExercise): boolean {
  if (block.blockType === 'interval') return true;
  if (block.blockType !== 'cardio') return true;
  return block.cardioPreset === 'vo2max' || block.cardioPreset === 'speed';
}

export function getPlannedMuscles(planned: PlannedExercise, exercise: Exercise): { primary: MuscleGroup[]; secondary: MuscleGroup[] } {
  if (planned.blockType === 'break' || planned.blockType === 'warmupSets') {
    return { primary: [], secondary: [] };
  }
  if ((planned.blockType === 'cardio' || planned.blockType === 'interval') && countsCardioForMuscleMap(planned)) {
    const activity = planned.cardioActivity ?? 'run';
    return CARDIO_ACTIVITY_MUSCLES[activity];
  }
  if (planned.blockType === 'cardio' || planned.blockType === 'interval') {
    return { primary: [], secondary: [] };
  }
  return { primary: exercise.primaryMuscles, secondary: exercise.secondaryMuscles };
}

export function cardioPresetFromExerciseId(exerciseId: string): CardioPreset | undefined {
  if (exerciseId.includes('recovery')) return 'recovery';
  if (exerciseId.includes('warmup')) return 'warmup';
  if (exerciseId.includes('zone2')) return 'zone2';
  if (exerciseId.includes('vo2max')) return 'vo2max';
  if (exerciseId.includes('speed')) return 'speed';
  return undefined;
}
