import type { Goal, PlannedExercise } from '../types';

export interface GoalPreset {
  label: string;
  repMin: number;
  repMax: number;
  sets: number;
  restSeconds: number;
  color: string;
  description: string;
}

export const GOAL_PRESETS: Record<Goal, GoalPreset> = {
  power: {
    label: 'Power',
    repMin: 1,
    repMax: 5,
    sets: 5,
    restSeconds: 180,
    color: '#7c3aed',
    description: '1–5 reps · 5 sets · 3:00 rest',
  },
  strength: {
    label: 'Strength',
    repMin: 5,
    repMax: 8,
    sets: 4,
    restSeconds: 150,
    color: '#ef4444',
    description: '5–8 reps · 4 sets · 2:30 rest',
  },
  hypertrophy: {
    label: 'Hypertrophy',
    repMin: 8,
    repMax: 12,
    sets: 3,
    restSeconds: 120,
    color: '#f97316',
    description: '8–12 reps · 3 sets · 2:00 rest',
  },
  endurance: {
    label: 'Endurance',
    repMin: 15,
    repMax: 20,
    sets: 3,
    restSeconds: 120,
    color: '#22c55e',
    description: '15–20 reps · 3 sets · 2:00 rest',
  },
};

export const SECONDS_PER_REP = 4.5;

export function buildPlannedExercise(
  exerciseId: string,
  goal: Goal,
  instanceId: string,
  isUnilateral = false
): PlannedExercise {
  const preset = GOAL_PRESETS[goal];
  return {
    instanceId,
    exerciseId,
    goal,
    sets: preset.sets,
    repMin: preset.repMin,
    repMax: preset.repMax,
    restSeconds: preset.restSeconds,
    isUnilateral,
  };
}

export function applyGoalPreset(ex: PlannedExercise, goal: Goal): PlannedExercise {
  const preset = GOAL_PRESETS[goal];
  return {
    ...ex,
    goal,
    sets: preset.sets,
    repMin: preset.repMin,
    repMax: preset.repMax,
    restSeconds: preset.restSeconds,
  };
}
