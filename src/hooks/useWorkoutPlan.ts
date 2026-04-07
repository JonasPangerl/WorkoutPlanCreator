import { useState, useCallback, useEffect } from 'react';
import type { WorkoutPlan, TrainingDay, PlannedExercise, Exercise, PlannedBlockType } from '../types';
import type { Goal } from '../types';
import { loadPlan, savePlan } from '../utils/storage';
import { buildPlannedExercise, applyGoalPreset } from '../utils/presets';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultPlan(): WorkoutPlan {
  return {
    trainingsPerWeek: 4,
    defaultRestSeconds: 120,
    maxHeartRate: 190,
    periodization: {
      cycleWeeks: 6,
      uprampEnabled: false,
      uprampWeeks: 2,
      overreachEnabled: true,
      deloadEnabled: true,
    },
    days: [
      { id: generateId(), label: 'Day 1 – Push', weekDay: 'mon', exercises: [] },
      { id: generateId(), label: 'Day 2 – Pull', weekDay: 'wed', exercises: [] },
      { id: generateId(), label: 'Day 3 – Legs', weekDay: 'fri', exercises: [] },
      { id: generateId(), label: 'Day 4 – Upper', weekDay: 'sat', exercises: [] },
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
          weekDay: 'mon',
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

  const updateDayWeekday = useCallback((dayId: string, weekDay: TrainingDay['weekDay']) => {
    setPlan((prev) => {
      const currentDay = prev.days.find((d) => d.id === dayId);
      if (!currentDay) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => {
          if (d.id === dayId) return { ...d, weekDay };
          if (d.weekDay === weekDay) return { ...d, weekDay: currentDay.weekDay };
          return d;
        }),
      };
    });
  }, []);

  // ── Exercises in a day ─────────────────────────────────
  const addExerciseToDay = useCallback((dayId: string, exerciseId: string, goal: Goal, blockType: PlannedBlockType = 'strength') => {
    const instanceId = generateId();
    const planned = buildPlannedExercise(exerciseId, goal, instanceId, blockType, false, plan.defaultRestSeconds);
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, planned] } : d
      ),
    }));
  }, [plan.defaultRestSeconds]);

  const setMaxHeartRate = useCallback((maxHeartRate: number) => {
    setPlan((prev) => ({
      ...prev,
      maxHeartRate: Math.max(120, Math.min(230, maxHeartRate)),
    }));
  }, []);

  const setDefaultRestSeconds = useCallback((restSeconds: number) => {
    setPlan((prev) => {
      const nextRestSeconds = Math.max(15, Math.min(600, restSeconds));
      return {
        ...prev,
        defaultRestSeconds: nextRestSeconds,
        days: prev.days.map((day) => ({
          ...day,
          exercises: day.exercises.map((exercise) => {
            if (
              exercise.blockType === 'strength' ||
              exercise.blockType === 'plyometric' ||
              exercise.blockType === 'warmupSets'
            ) {
              return { ...exercise, restSeconds: nextRestSeconds };
            }
            return exercise;
          }),
        })),
      };
    });
  }, []);

  const updatePeriodization = useCallback((updates: Partial<WorkoutPlan['periodization']>) => {
    setPlan((prev) => ({
      ...prev,
      periodization: {
        ...prev.periodization,
        ...updates,
        cycleWeeks: Math.max(2, Math.min(16, updates.cycleWeeks ?? prev.periodization.cycleWeeks)),
        uprampWeeks: Math.max(1, Math.min(8, updates.uprampWeeks ?? prev.periodization.uprampWeeks)),
      },
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
    setDefaultRestSeconds,
    setMaxHeartRate,
    updatePeriodization,
    updateDayLabel,
    updateDayWeekday,
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
