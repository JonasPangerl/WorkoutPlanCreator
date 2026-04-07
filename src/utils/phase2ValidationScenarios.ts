import { buildWeekPhases } from './periodization';
import type { Exercise, TrainingDay } from '../types';
import { buildRecoveryCalendar } from './recovery';

// Deterministic validation scenarios for manual/console verification.
export function runPhase2ValidationScenarios() {
  const phases = buildWeekPhases({
    cycleWeeks: 6,
    uprampEnabled: false,
    uprampWeeks: 2,
    overreachEnabled: true,
    deloadEnabled: true,
  });

  const sampleExercise: Exercise = {
    id: 'sample-bench',
    name: 'Bench Press',
    categories: ['Push'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'frontDelt'],
    defaultGoal: 'hypertrophy',
    exerciseType: 'compound',
    difficulty: 'beginner',
  };
  const sampleDays: TrainingDay[] = [
    {
      id: 'd1',
      label: 'Day 1',
      weekDay: 'mon',
      exercises: [
        {
          instanceId: 'p1',
          exerciseId: 'sample-bench',
          blockType: 'strength',
          goal: 'hypertrophy',
          sets: 3,
          repMin: 8,
          repMax: 12,
          restSeconds: 120,
          rir: 2,
          isUnilateral: false,
        },
      ],
    },
  ];
  const calendar = buildRecoveryCalendar(sampleDays, [sampleExercise]);

  return {
    overreachWeek: phases.find((p) => p.phase === 'overreach')?.week,
    deloadWeek: phases.find((p) => p.phase === 'deload')?.week,
    mondayChestStatus: calendar.chest.mon,
    wednesdayChestStatus: calendar.chest.wed,
  };
}
