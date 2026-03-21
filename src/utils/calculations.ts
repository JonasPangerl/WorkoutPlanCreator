import type { PlannedExercise, TrainingDay, MuscleGroup, Exercise } from '../types';
import { SECONDS_PER_REP } from './presets';

export function calcExerciseDurationSeconds(ex: PlannedExercise): number {
  const avgReps = (ex.repMin + ex.repMax) / 2;
  // Unilateral: do left then right = 2× reps per set, but only one rest after both sides
  const repsPerSet = ex.isUnilateral ? avgReps * 2 : avgReps;
  const workTime = ex.sets * repsPerSet * SECONDS_PER_REP;
  const restTime = (ex.sets - 1) * ex.restSeconds;
  return Math.round(workTime + restTime);
}

export function calcDayDurationSeconds(day: TrainingDay): number {
  return day.exercises.reduce((sum, ex) => sum + calcExerciseDurationSeconds(ex), 0);
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export interface MuscleVolume {
  primarySets: number;
  secondarySets: number;
}

export function calcWeeklyMuscleVolume(
  days: TrainingDay[],
  allExercises: Exercise[]
): Record<MuscleGroup, MuscleVolume> {
  const result: Record<string, MuscleVolume> = {};

  for (const day of days) {
    for (const planned of day.exercises) {
      const exercise = allExercises.find((e) => e.id === planned.exerciseId);
      if (!exercise) continue;

      for (const muscle of exercise.primaryMuscles) {
        if (!result[muscle]) result[muscle] = { primarySets: 0, secondarySets: 0 };
        result[muscle].primarySets += planned.sets;
      }
      for (const muscle of exercise.secondaryMuscles) {
        if (!result[muscle]) result[muscle] = { primarySets: 0, secondarySets: 0 };
        result[muscle].secondarySets += planned.sets;
      }
    }
  }

  return result as Record<MuscleGroup, MuscleVolume>;
}
