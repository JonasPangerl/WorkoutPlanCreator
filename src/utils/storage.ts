import type { WorkoutPlan, Exercise } from '../types';

// Bump this key whenever the stored shape changes incompatibly.
const STORAGE_KEY = 'workout-plan-v2';

/** Normalise any exercise that still uses the old `category: string` field. */
function migrateExercise(ex: Exercise & { category?: string }): Exercise {
  if (!ex.categories && ex.category) {
    return { ...ex, categories: [ex.category] };
  }
  if (!ex.categories) {
    return { ...ex, categories: ['Custom'] };
  }
  return ex;
}

export function loadPlan(): WorkoutPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const plan = JSON.parse(raw) as WorkoutPlan & { customExercises?: (Exercise & { category?: string })[] };
    // Migrate custom exercises to the new categories array format
    if (plan.customExercises) {
      plan.customExercises = plan.customExercises.map(migrateExercise);
    }
    return plan as WorkoutPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: WorkoutPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function exportPlanJSON(plan: WorkoutPlan): void {
  const json = JSON.stringify(plan, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workout-plan.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importPlanJSON(file: File): Promise<WorkoutPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const plan = JSON.parse(e.target?.result as string) as WorkoutPlan & {
          customExercises?: (Exercise & { category?: string })[];
        };
        if (plan.customExercises) {
          plan.customExercises = plan.customExercises.map(migrateExercise);
        }
        resolve(plan as WorkoutPlan);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
