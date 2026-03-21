export type Goal = 'power' | 'strength' | 'hypertrophy' | 'endurance';
export type ExerciseType = 'compound' | 'isolation';
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
  goal: Goal;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  isUnilateral: boolean;
}

export interface TrainingDay {
  id: string;
  label: string;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  trainingsPerWeek: number;
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
