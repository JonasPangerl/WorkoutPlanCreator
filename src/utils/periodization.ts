import type { PeriodizationSettings, PlannedExercise } from '../types';

export type PhaseType = 'upramp' | 'normal' | 'overreach' | 'deload';

export interface WeekPhase {
  week: number;
  phase: PhaseType;
  setMultiplier: number;
  rirOffset: number;
  intensityFactor: number;
}

export function buildWeekPhases(settings: PeriodizationSettings): WeekPhase[] {
  const phases: WeekPhase[] = [];
  const totalWeeks = Math.max(2, settings.cycleWeeks);
  const deloadWeek = settings.deloadEnabled ? totalWeeks : -1;
  const overreachWeek = settings.overreachEnabled
    ? (settings.deloadEnabled ? Math.max(1, totalWeeks - 1) : totalWeeks)
    : -1;

  for (let week = 1; week <= totalWeeks; week++) {
    if (settings.uprampEnabled && week <= settings.uprampWeeks) {
      const progress = settings.uprampWeeks <= 1 ? 1 : (week - 1) / (settings.uprampWeeks - 1);
      phases.push({
        week,
        phase: 'upramp',
        setMultiplier: 0.75 + progress * 0.2,
        rirOffset: 1,
        intensityFactor: 0.85 + progress * 0.1,
      });
      continue;
    }
    if (week === deloadWeek) {
      phases.push({ week, phase: 'deload', setMultiplier: 0.65, rirOffset: 2, intensityFactor: 0.7 });
      continue;
    }
    if (week === overreachWeek) {
      phases.push({ week, phase: 'overreach', setMultiplier: 1.1, rirOffset: -1, intensityFactor: 1.05 });
      continue;
    }
    phases.push({ week, phase: 'normal', setMultiplier: 1, rirOffset: 0, intensityFactor: 1 });
  }

  return phases;
}

export function projectExerciseForPhase(ex: PlannedExercise, phase: WeekPhase): PlannedExercise {
  const nextSets = Math.max(1, Math.round(ex.sets * phase.setMultiplier));
  const nextRir = Math.max(0, Math.min(5, ex.rir + phase.rirOffset));
  return {
    ...ex,
    sets: nextSets,
    rir: nextRir,
  };
}
