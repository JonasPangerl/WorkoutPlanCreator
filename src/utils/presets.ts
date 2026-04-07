import type { Goal, PlannedExercise, PlannedBlockType, CardioPreset } from '../types';
import { cardioPresetFromExerciseId } from './cardio';

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
export const CARDIO_PRESETS: Record<CardioPreset, { label: string; hrMin: number; hrMax: number; durationSeconds: number }> = {
  recovery: { label: 'Recovery', hrMin: 50, hrMax: 60, durationSeconds: 1800 },
  warmup: { label: 'Warmup', hrMin: 55, hrMax: 65, durationSeconds: 900 },
  zone2: { label: 'Zone 2', hrMin: 60, hrMax: 70, durationSeconds: 2400 },
  vo2max: { label: 'VO2 max', hrMin: 90, hrMax: 95, durationSeconds: 900 },
  speed: { label: 'Speed', hrMin: 85, hrMax: 95, durationSeconds: 1200 },
};

export function buildPlannedExercise(
  exerciseId: string,
  goal: Goal,
  instanceId: string,
  blockType: PlannedBlockType,
  isUnilateral = false,
  restSecondsOverride?: number
): PlannedExercise {
  const preset = GOAL_PRESETS[goal];
  if (blockType === 'cardio') {
    const presetFromExercise = cardioPresetFromExerciseId(exerciseId) ?? 'zone2';
    const selected = CARDIO_PRESETS[presetFromExercise];
    return {
      instanceId,
      exerciseId,
      blockType,
      goal: 'endurance',
      sets: 1,
      repMin: 1,
      repMax: 1,
      restSeconds: 0,
      rir: 2,
      isUnilateral: false,
      durationSeconds: selected.durationSeconds,
      cardioPreset: presetFromExercise,
      cardioActivity: 'run',
      targetHrMinPercent: selected.hrMin,
      targetHrMaxPercent: selected.hrMax,
    };
  }
  if (blockType === 'interval') {
    return {
      instanceId,
      exerciseId,
      blockType,
      goal: 'endurance',
      sets: 1,
      repMin: 1,
      repMax: 1,
      restSeconds: 0,
      rir: 2,
      isUnilateral: false,
      intervalMode: 'simple',
      intervalWorkSeconds: 60,
      intervalRestSeconds: 90,
      intervalRounds: 8,
      cardioPreset: 'vo2max',
      cardioActivity: 'run',
      targetHrMinPercent: 90,
      targetHrMaxPercent: 95,
    };
  }
  if (blockType === 'plyometric') {
    return {
      instanceId,
      exerciseId,
      blockType,
      goal,
      sets: 4,
      repMin: 3,
      repMax: 6,
      restSeconds: 120,
      rir: 2,
      isUnilateral,
    };
  }
  if (blockType === 'break') {
    return {
      instanceId,
      exerciseId,
      blockType,
      goal: 'endurance',
      sets: 1,
      repMin: 1,
      repMax: 1,
      restSeconds: 0,
      rir: 2,
      isUnilateral: false,
      durationSeconds: 120,
    };
  }
  if (blockType === 'warmupSets') {
    return {
      instanceId,
      exerciseId,
      blockType,
      goal: 'endurance',
      sets: 1,
      repMin: 15,
      repMax: 15,
      restSeconds: 60,
      rir: 0,
      isUnilateral: false,
    };
  }
  return {
    instanceId,
    exerciseId,
    blockType,
    goal,
    sets: preset.sets,
    repMin: preset.repMin,
    repMax: preset.repMax,
    restSeconds: restSecondsOverride ?? preset.restSeconds,
    rir: 2,
    isUnilateral,
  };
}

export function applyGoalPreset(ex: PlannedExercise, goal: Goal): PlannedExercise {
  if (ex.blockType !== 'strength' && ex.blockType !== 'plyometric') {
    return ex;
  }
  const preset = GOAL_PRESETS[goal];
  return {
    ...ex,
    goal,
    sets: preset.sets,
    repMin: preset.repMin,
    repMax: preset.repMax,
    restSeconds: preset.restSeconds,
    rir: 2,
  };
}
