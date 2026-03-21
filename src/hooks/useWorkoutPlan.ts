import { useState, useCallback, useEffect } from 'react';
import type { WorkoutPlan, TrainingDay, PlannedExercise, Exercise } from '../types';
import type { Goal } from '../types';
import { loadPlan, savePlan } from '../utils/storage';
import { buildPlannedExercise, applyGoalPreset } from '../utils/presets';
import { EXERCISES } from '../data/exercises';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultPlan(): WorkoutPlan {
  return {
    trainingsPerWeek: 4,
    days: [
      { id: generateId(), label: 'Day 1 – Push', exercises: [] },
      { id: generateId(), label: 'Day 2 – Pull', exercises: [] },
      { id: generateId(), label: 'Day 3 – Legs', exercises: [] },
      { id: generateId(), label: 'Day 4 – Upper', exercises: [] },
    ],
    customExercises: [],
  };
}

export function useWorkoutPlan() {
  const [plan, setPlan] = useState<WorkoutPlan>(() => loadPlan() ?? defaultPlan());

  useEffect(() => {
    savePlan(plan);
  }, [plan]);

  // ── Week setup ─────────────────────────────────────────
  const setTrainingsPerWeek = useCallback((n: number) => {
    setPlan((prev) => {
      const clampedN = Math.max(1, Math.min(7, n));
      const current = prev.days;
      if (clampedN > current.length) {
        const extra: TrainingDay[] = Array.from({ length: clampedN - current.length }, (_, i) => ({
          id: generateId(),
          label: `Day ${current.length + i + 1}`,
          exercises: [],
        }));
        return { ...prev, trainingsPerWeek: clampedN, days: [...current, ...extra] };
      }
      return { ...prev, trainingsPerWeek: clampedN, days: current.slice(0, clampedN) };
    });
  }, []);

  const updateDayLabel = useCallback((dayId: string, label: string) => {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, label } : d)),
    }));
  }, []);

  // ── Exercises in a day ─────────────────────────────────
  const addExerciseToDay = useCallback((dayId: string, exerciseId: string, goal: Goal, customExercises: Exercise[] = []) => {
    const instanceId = generateId();
    const allEx = [...EXERCISES, ...customExercises];
    const ex = allEx.find((e) => e.id === exerciseId);
    const planned = buildPlannedExercise(exerciseId, goal, instanceId, false);
    void ex; // canBeUnilateral starts false; user toggles manually
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, planned] } : d
      ),
    }));
  }, []);

  const removeExerciseFromDay = useCallback((dayId: string, instanceId: string) => {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.instanceId !== instanceId) }
          : d
      ),
    }));
  }, []);

  const updateExercise = useCallback(
    (dayId: string, instanceId: string, updates: Partial<PlannedExercise>) => {
      setPlan((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId
            ? {
                ...d,
                exercises: d.exercises.map((e) =>
                  e.instanceId === instanceId ? { ...e, ...updates } : e
                ),
              }
            : d
        ),
      }));
    },
    []
  );

  const changeExerciseGoal = useCallback((dayId: string, instanceId: string, goal: Goal) => {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.instanceId === instanceId ? applyGoalPreset(e, goal) : e
              ),
            }
          : d
      ),
    }));
  }, []);

  const reorderExercises = useCallback((dayId: string, exercises: PlannedExercise[]) => {
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, exercises } : d)),
    }));
  }, []);

  // ── Custom exercises ───────────────────────────────────
  const addCustomExercise = useCallback((exercise: Omit<Exercise, 'id' | 'isCustom'>) => {
    const newEx: Exercise = { ...exercise, id: `custom-${generateId()}`, isCustom: true };
    setPlan((prev) => ({ ...prev, customExercises: [...prev.customExercises, newEx] }));
    return newEx;
  }, []);

  const deleteCustomExercise = useCallback((exerciseId: string) => {
    setPlan((prev) => ({
      ...prev,
      customExercises: prev.customExercises.filter((e) => e.id !== exerciseId),
      days: prev.days.map((d) => ({
        ...d,
        exercises: d.exercises.filter((e) => e.exerciseId !== exerciseId),
      })),
    }));
  }, []);

  // ── Full plan replacement (for import) ─────────────────
  const replacePlan = useCallback((newPlan: WorkoutPlan) => {
    setPlan(newPlan);
  }, []);

  return {
    plan,
    setTrainingsPerWeek,
    updateDayLabel,
    addExerciseToDay,
    removeExerciseFromDay,
    updateExercise,
    changeExerciseGoal,
    reorderExercises,
    addCustomExercise,
    deleteCustomExercise,
    replacePlan,
  };
}
