import type { TrainingDay, Exercise } from '../types';
import { calcDayDurationSeconds } from './calculations';

/** Per-goal CNS taxation factor (0–1) */
const CNS_GOAL_FACTOR: Record<string, number> = {
  power: 1.0,
  strength: 0.8,
  hypertrophy: 0.5,
  endurance: 0.2,
};

/**
 * Systemic size weight per muscle group.
 * Larger, multi-joint muscles cause more fatigue per set.
 */
const MUSCLE_SIZE: Record<string, number> = {
  glutes: 1.4,
  quads: 1.4,
  hamstrings: 1.3,
  lats: 1.2,
  chest: 1.2,
  lowerBack: 1.2,
  traps: 1.1,
  adductors: 1.0,
  abductors: 1.0,
  calves: 0.9,
  frontDelt: 0.8,
  sideDelt: 0.8,
  rearDelt: 0.8,
  triceps: 0.8,
  biceps: 0.7,
  abs: 0.7,
  obliques: 0.7,
  forearms: 0.6,
};

/**
 * Returns the TOTAL muscle load factor for an exercise by summing primary and
 * secondary muscle contributions. This ensures exercises training many muscles
 * (e.g. Deadlift, Squat) score much higher than single-muscle isolation work.
 *
 * Primary muscles count fully; secondary muscles count at 40%.
 */
function muscleLoadFactor(primaryMuscles: string[], secondaryMuscles: string[]): number {
  const primary = primaryMuscles.reduce((a, m) => a + (MUSCLE_SIZE[m] ?? 1.0), 0);
  const secondary = secondaryMuscles.reduce((a, m) => a + (MUSCLE_SIZE[m] ?? 1.0) * 0.4, 0);
  return primary + secondary;
}

/**
 * Returns the CNS load factor for an exercise. Uses the SUM of primary muscles
 * (the muscles that must generate force) so compound exercises tax the CNS more.
 */
function cnsLoadFactor(primaryMuscles: string[]): number {
  return primaryMuscles.reduce((a, m) => a + (MUSCLE_SIZE[m] ?? 1.0), 0);
}

export interface TrainingLoad {
  /** 0–100: nervous system taxation */
  cns: number;
  /** 0–100: muscle damage / volume fatigue */
  muscle: number;
  /** 0–100: mental/cognitive fatigue */
  mental: number;
  /** 0–100: overall composite */
  overall: number;
}

/**
 * Calibration thresholds — the raw score at which each dimension hits 100.
 *
 * Calibrated so that a "very hard" day of 6 big compound exercises reaches
 * ~90 % muscle, ~80 % CNS, ~75 % mental.
 *
 * Example hard leg day (Squat 4×8 + RDL 4×10 + Leg Press 3×12 + Leg Curl 3×12
 * + Leg Extension 3×15 + Calf Raise 4×15):
 *   muscleRaw ≈ 530  → 530/580 ≈ 91 %
 *   cnsRaw    ≈ 44   → 44/55   ≈ 80 %
 *   mentalRaw ≈ 65   → 65/88   ≈ 74 %
 */
const MUSCLE_MAX = 580;
const CNS_MAX = 55;
const MENTAL_MAX = 88;

function clamp100(v: number) {
  return Math.min(100, Math.max(0, Math.round(v)));
}

export function calcTrainingLoad(day: TrainingDay, allExercises: Exercise[]): TrainingLoad {
  if (day.exercises.length === 0) return { cns: 0, muscle: 0, mental: 0, overall: 0 };

  let cnsRaw = 0;
  let muscleRaw = 0;
  let compoundCount = 0;

  for (const planned of day.exercises) {
    const ex = allExercises.find((e) => e.id === planned.exerciseId);
    if (!ex) continue;

    const goalFactor = CNS_GOAL_FACTOR[planned.goal] ?? 0.5;
    const typeMult = ex.exerciseType === 'compound' ? 1.2 : 0.7;

    // CNS: intensity-driven — sets × goal × compound multiplier × sum of primary muscle sizes
    const cnsFactor = cnsLoadFactor(ex.primaryMuscles);
    cnsRaw += planned.sets * goalFactor * typeMult * cnsFactor;

    // Muscle: volume-driven — sets × reps × total muscle involvement (primary + secondary)
    const avgReps = (planned.repMin + planned.repMax) / 2;
    const repsPerSet = planned.isUnilateral ? avgReps * 2 : avgReps;
    const mFactor = muscleLoadFactor(ex.primaryMuscles, ex.secondaryMuscles);
    muscleRaw += planned.sets * repsPerSet * mFactor;

    if (ex.exerciseType === 'compound') compoundCount++;
  }

  // Mental: session duration + compound movement complexity
  const sessionMinutes = calcDayDurationSeconds(day) / 60;
  const mentalRaw = sessionMinutes + compoundCount * 3.5;

  const cns = clamp100((cnsRaw / CNS_MAX) * 100);
  const muscle = clamp100((muscleRaw / MUSCLE_MAX) * 100);
  const mental = clamp100((mentalRaw / MENTAL_MAX) * 100);

  // Weighted overall: muscle is now the dominant fatigue driver for typical training
  const overall = clamp100(muscle * 0.45 + cns * 0.35 + mental * 0.2);

  return { cns, muscle, mental, overall };
}

export function loadColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  return '#22c55e';
}

export function loadLabel(overall: number): string {
  if (overall >= 80) return 'Very Hard';
  if (overall >= 60) return 'Hard';
  if (overall >= 40) return 'Moderate';
  if (overall >= 20) return 'Easy';
  return 'Light';
}
