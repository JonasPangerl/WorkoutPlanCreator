import type { Exercise, FitnessLevel, MuscleGroup, RecoveryStatus, TrainingDay, Weekday } from '../types';
import { countsCardioForMuscleMap, getPlannedMuscles } from './cardio';

const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const PRIMARY_RECOVERY_HOURS = 72;
const SECONDARY_RECOVERY_HOURS = 48;
const COMPOUND_BONUS_HOURS = 12;

export function getWeekdayLabel(day: Weekday): string {
  return day.toUpperCase();
}

function weekdayIndex(day: Weekday): number {
  return WEEKDAYS.indexOf(day);
}

function getExerciseById(exerciseId: string, allExercises: Exercise[]): Exercise | undefined {
  return allExercises.find((ex) => ex.id === exerciseId);
}

interface Stimulus {
  dayIndex: number;
  muscle: MuscleGroup;
  recoveryHours: number;
}

export type RecoveryViewMode = 'singleWeek' | 'cyclingWeek';
const FITNESS_RECOVERY_MULTIPLIER: Record<FitnessLevel, number> = {
  beginner: 1.08,
  intermediate: 1.0,
  advanced: 0.94,
};

function collectStimuli(days: TrainingDay[], allExercises: Exercise[], fitnessLevel: FitnessLevel): Stimulus[] {
  const stimuli: Stimulus[] = [];
  const levelMult = FITNESS_RECOVERY_MULTIPLIER[fitnessLevel];
  for (const day of days) {
    const dayIndex = weekdayIndex(day.weekDay);
    for (const planned of day.exercises) {
      const exercise = getExerciseById(planned.exerciseId, allExercises);
      if (!exercise) continue;
      if (planned.blockType === 'break' || planned.blockType === 'warmupSets') continue;
      if ((planned.blockType === 'cardio' || planned.blockType === 'interval') && !countsCardioForMuscleMap(planned)) continue;
      const bonus = exercise.exerciseType === 'compound' ? COMPOUND_BONUS_HOURS : 0;
      const muscles = getPlannedMuscles(planned, exercise);

      for (const muscle of muscles.primary) {
        stimuli.push({ dayIndex, muscle, recoveryHours: Math.round((PRIMARY_RECOVERY_HOURS + bonus) * levelMult) });
      }
      for (const muscle of muscles.secondary) {
        stimuli.push({ dayIndex, muscle, recoveryHours: Math.round((SECONDARY_RECOVERY_HOURS + bonus) * levelMult) });
      }
    }
  }
  return stimuli;
}

function statusFromRemainingHours(remainingHours: number): RecoveryStatus {
  if (remainingHours <= 0) return 'fresh';
  if (remainingHours > 24) return 'fatigued';
  return 'recovering';
}

function getElapsedHours(stimulusDayIndex: number, currentDayIndex: number, mode: RecoveryViewMode): number | null {
  if (mode === 'singleWeek') {
    if (stimulusDayIndex > currentDayIndex) return null;
    return (currentDayIndex - stimulusDayIndex) * 24;
  }

  // In cycling mode, treat future weekdays as prior-week stimuli.
  if (stimulusDayIndex <= currentDayIndex) {
    return (currentDayIndex - stimulusDayIndex) * 24;
  }
  return (currentDayIndex + 7 - stimulusDayIndex) * 24;
}

export function buildRecoveryCalendar(
  days: TrainingDay[],
  allExercises: Exercise[],
  mode: RecoveryViewMode = 'singleWeek',
  fitnessLevel: FitnessLevel = 'intermediate'
): Record<MuscleGroup, Record<Weekday, RecoveryStatus>> {
  const stimuli = collectStimuli(days, allExercises, fitnessLevel);
  const result = {} as Record<MuscleGroup, Record<Weekday, RecoveryStatus>>;
  const muscles: MuscleGroup[] = [
    'chest', 'frontDelt', 'sideDelt', 'rearDelt', 'biceps', 'triceps', 'forearms', 'abs',
    'obliques', 'quads', 'adductors', 'abductors', 'calves', 'traps', 'lats', 'lowerBack',
    'glutes', 'hamstrings',
  ];

  for (const muscle of muscles) {
    result[muscle] = {} as Record<Weekday, RecoveryStatus>;
    for (const day of WEEKDAYS) {
      const currentIdx = weekdayIndex(day);
      let maxRemaining = 0;

      for (const stimulus of stimuli) {
        if (stimulus.muscle !== muscle) continue;
        const elapsedHours = getElapsedHours(stimulus.dayIndex, currentIdx, mode);
        if (elapsedHours === null) continue;
        const remaining = stimulus.recoveryHours - elapsedHours;
        if (remaining > maxRemaining) maxRemaining = remaining;
      }

      result[muscle][day] = statusFromRemainingHours(maxRemaining);
    }
  }

  return result;
}

export const RECOVERY_WEEKDAYS = WEEKDAYS;

export interface RecoveryConflict {
  instanceId: string;
  exerciseName: string;
  fatiguedPrimaryMuscles: MuscleGroup[];
}

export type RecoveryConflictMap = Record<string, RecoveryConflict[]>;

export function buildPrimaryFatigueConflictMap(
  days: TrainingDay[],
  allExercises: Exercise[],
  mode: RecoveryViewMode = 'singleWeek',
  fitnessLevel: FitnessLevel = 'intermediate'
): RecoveryConflictMap {
  const stimuli = collectStimuli(days, allExercises, fitnessLevel);
  const result: RecoveryConflictMap = {};

  for (const day of days) {
    const currentDayIndex = weekdayIndex(day.weekDay);
    const conflicts: RecoveryConflict[] = [];
    for (const planned of day.exercises) {
      const ex = getExerciseById(planned.exerciseId, allExercises);
      if (!ex) continue;
      const plannedMuscles = getPlannedMuscles(planned, ex);
      const fatiguedPrimaryMuscles = plannedMuscles.primary.filter(
        (muscle) => {
          let maxRemaining = 0;
          for (const stimulus of stimuli) {
            if (stimulus.muscle !== muscle) continue;
            const elapsedHours = getElapsedHours(stimulus.dayIndex, currentDayIndex, mode);
            // Do not count same-day stimulus as a conflict source.
            if (elapsedHours === null || elapsedHours <= 0) continue;
            const remaining = stimulus.recoveryHours - elapsedHours;
            if (remaining > maxRemaining) maxRemaining = remaining;
          }
          return statusFromRemainingHours(maxRemaining) === 'fatigued';
        }
      );
      if (fatiguedPrimaryMuscles.length > 0) {
        conflicts.push({
          instanceId: planned.instanceId,
          exerciseName: ex.name,
          fatiguedPrimaryMuscles,
        });
      }
    }
    result[day.id] = conflicts;
  }

  return result;
}
