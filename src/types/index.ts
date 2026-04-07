export type Goal = 'power' | 'strength' | 'hypertrophy' | 'endurance';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type RecoveryStatus = 'fresh' | 'recovering' | 'fatigued';
export type PlannedBlockType = 'strength' | 'cardio' | 'interval' | 'plyometric' | 'break' | 'warmupSets';
export type CardioPreset = 'recovery' | 'warmup' | 'zone2' | 'vo2max' | 'speed';
export type CardioActivity = 'run' | 'bike' | 'rower' | 'crosstrainer' | 'stairmaster' | 'walk';

export const FITNESS_LEVEL_MULTIPLIER: Record<FitnessLevel, number> = {
  beginner:     1.6,
  intermediate: 1.0,
  advanced:     0.65,
};
export type ExerciseType = 'compound' | 'isolation' | 'cardio' | 'plyometric' | 'break' | 'warmup';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup =
  | 'chest'
  | 'frontDelt'
  | 'sideDelt'
  | 'rearDelt'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'adductors'
  | 'abductors'
  | 'calves'
  | 'traps'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'hamstrings';

export interface Exercise {
  id: string;
  name: string;
  categories: string[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  defaultGoal: Goal;
  exerciseType: ExerciseType;
  difficulty: Difficulty;
  canBeUnilateral?: boolean;
  description?: string;
  isCustom?: boolean;
}

export interface PlannedExercise {
  instanceId: string;
  exerciseId: string;
  blockType: PlannedBlockType;
  goal: Goal;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  rir: number;
  isUnilateral: boolean;
  durationSeconds?: number;
  cardioPreset?: CardioPreset;
  cardioActivity?: CardioActivity;
  targetHrMinPercent?: number;
  targetHrMaxPercent?: number;
  intervalMode?: 'simple' | 'advanced';
  intervalWorkSeconds?: number;
  intervalRestSeconds?: number;
  intervalRounds?: number;
  intervalSegments?: { name: 'warmup' | 'work' | 'rest' | 'cooldown'; durationSeconds: number; rounds?: number }[];
}

export interface TrainingDay {
  id: string;
  label: string;
  weekDay: Weekday;
  exercises: PlannedExercise[];
}

export interface PeriodizationSettings {
  cycleWeeks: number;
  uprampEnabled: boolean;
  uprampWeeks: number;
  overreachEnabled: boolean;
  deloadEnabled: boolean;
}

export interface WorkoutPlan {
  trainingsPerWeek: number;
  defaultRestSeconds: number;
  maxHeartRate: number;
  periodization: PeriodizationSettings;
  days: TrainingDay[];
  customExercises: Exercise[];
}

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  frontDelt: 'Front Delt',
  sideDelt: 'Side Delt',
  rearDelt: 'Rear Delt',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  adductors: 'Adductors',
  abductors: 'Abductors',
  calves: 'Calves',
  traps: 'Traps',
  lats: 'Lats',
  lowerBack: 'Lower Back',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
};

export const MUSCLE_CATEGORIES: Record<string, MuscleGroup[]> = {
  Push: ['chest', 'frontDelt', 'sideDelt', 'triceps'],
  Pull: ['lats', 'traps', 'rearDelt', 'biceps', 'forearms'],
  Legs: ['quads', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves'],
  'Front Core': ['abs'],
  'Side Core': ['obliques', 'lowerBack'],
};
