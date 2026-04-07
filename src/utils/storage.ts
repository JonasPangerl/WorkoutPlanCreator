import type { WorkoutPlan, Exercise, Weekday } from '../types';

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

function normalizePlan(plan: WorkoutPlan): WorkoutPlan {
  const defaultRestSeconds = Math.max(15, Math.min(600, plan.defaultRestSeconds ?? 120));
  const maxHeartRate = Math.max(120, Math.min(230, plan.maxHeartRate ?? 190));
  const periodization = {
    cycleWeeks: Math.max(2, Math.min(16, plan.periodization?.cycleWeeks ?? 6)),
    uprampEnabled: Boolean(plan.periodization?.uprampEnabled ?? false),
    uprampWeeks: Math.max(1, Math.min(8, plan.periodization?.uprampWeeks ?? 2)),
    overreachEnabled: Boolean(plan.periodization?.overreachEnabled ?? true),
    deloadEnabled: Boolean(plan.periodization?.deloadEnabled ?? true),
  };
  const defaultWeekdays: Weekday[] = ['mon', 'wed', 'fri', 'sat', 'tue', 'thu', 'sun'];
  return {
    ...plan,
    defaultRestSeconds,
    maxHeartRate,
    periodization,
    days: (plan.days ?? []).map((day) => ({
      ...day,
      weekDay: day.weekDay ?? defaultWeekdays[(plan.days ?? []).indexOf(day)] ?? 'mon',
      exercises: (day.exercises ?? []).map((ex) => ({
        ...ex,
        blockType: ex.blockType ?? 'strength',
        restSeconds: typeof ex.restSeconds === 'number' ? ex.restSeconds : defaultRestSeconds,
        rir: typeof ex.rir === 'number' ? ex.rir : 2,
        durationSeconds: typeof ex.durationSeconds === 'number' ? ex.durationSeconds : undefined,
        cardioPreset: ex.cardioPreset ?? undefined,
        cardioActivity: ex.cardioActivity ?? 'run',
        targetHrMinPercent: typeof ex.targetHrMinPercent === 'number' ? ex.targetHrMinPercent : undefined,
        targetHrMaxPercent: typeof ex.targetHrMaxPercent === 'number' ? ex.targetHrMaxPercent : undefined,
        intervalMode: ex.intervalMode ?? 'simple',
        intervalWorkSeconds: typeof ex.intervalWorkSeconds === 'number' ? ex.intervalWorkSeconds : 60,
        intervalRestSeconds: typeof ex.intervalRestSeconds === 'number' ? ex.intervalRestSeconds : 90,
        intervalRounds: typeof ex.intervalRounds === 'number' ? ex.intervalRounds : 8,
      })),
    })),
  };
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
    return normalizePlan(plan as WorkoutPlan);
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
        resolve(normalizePlan(plan as WorkoutPlan));
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
