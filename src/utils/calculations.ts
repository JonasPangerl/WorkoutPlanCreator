import type { PlannedExercise, TrainingDay, MuscleGroup, Exercise } from '../types';
import { SECONDS_PER_REP } from './presets';
import { countsCardioForMuscleMap, getPlannedMuscles } from './cardio';

export function calcExerciseDurationSeconds(ex: PlannedExercise): number {
  if (ex.blockType === 'cardio' || ex.blockType === 'break') {
    return Math.max(60, ex.durationSeconds ?? 0);
  }
  if (ex.blockType === 'interval') {
    if (ex.intervalMode === 'advanced' && ex.intervalSegments?.length) {
      return ex.intervalSegments.reduce((sum, seg) => sum + (seg.durationSeconds * (seg.rounds ?? 1)), 0);
    }
    const rounds = Math.max(1, ex.intervalRounds ?? 1);
    return rounds * ((ex.intervalWorkSeconds ?? 0) + (ex.intervalRestSeconds ?? 0));
  }
  const avgReps = (ex.repMin + ex.repMax) / 2;
  // Unilateral: do left then right = 2× reps per set, but only one rest after both sides
  const repsPerSet = ex.isUnilateral ? avgReps * 2 : avgReps;
  const sets = Math.max(1, ex.sets);
  const workTime = sets * repsPerSet * SECONDS_PER_REP;
  const restTime = Math.max(0, sets - 1) * ex.restSeconds;
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

      if ((planned.blockType === 'cardio' || planned.blockType === 'interval') && !countsCardioForMuscleMap(planned)) continue;
      const muscles = getPlannedMuscles(planned, exercise);
      for (const muscle of muscles.primary) {
        if (!result[muscle]) result[muscle] = { primarySets: 0, secondarySets: 0 };
        result[muscle].primarySets += planned.sets;
      }
      for (const muscle of muscles.secondary) {
        if (!result[muscle]) result[muscle] = { primarySets: 0, secondarySets: 0 };
        result[muscle].secondarySets += planned.sets;
      }
    }
  }

  return result as Record<MuscleGroup, MuscleVolume>;
}
