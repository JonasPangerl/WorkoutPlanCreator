import type { Exercise, FitnessLevel, WorkoutPlan } from '../types';
import { formatDuration, calcExerciseDurationSeconds, calcDayDurationSeconds } from './calculations';
import { buildWeekPhases } from './periodization';

function getExerciseName(exerciseId: string, allExercises: Exercise[]): string {
  return allExercises.find((ex) => ex.id === exerciseId)?.name ?? exerciseId;
}

export function buildLLMExportText(
  plan: WorkoutPlan,
  allExercises: Exercise[],
  fitnessLevel: FitnessLevel
): string {
  const lines: string[] = [];

  lines.push('WORKOUT PLAN REVIEW REQUEST');
  lines.push('');
  lines.push('User context');
  lines.push(`- Fitness level: ${fitnessLevel}`);
  lines.push(`- Training days per week: ${plan.trainingsPerWeek}`);
  lines.push(`- Default rest between sets: ${plan.defaultRestSeconds}s`);
  lines.push(`- Cycle length: ${plan.periodization.cycleWeeks} weeks`);
  lines.push(`- Upramp: ${plan.periodization.uprampEnabled ? `on (${plan.periodization.uprampWeeks} weeks)` : 'off'}`);
  lines.push(`- Overreach: ${plan.periodization.overreachEnabled ? 'on' : 'off'}`);
  lines.push(`- Deload: ${plan.periodization.deloadEnabled ? 'on' : 'off'}`);
  lines.push('');

  lines.push('Periodization phases');
  for (const phase of buildWeekPhases(plan.periodization)) {
    lines.push(
      `- Week ${phase.week}: ${phase.phase} | setMultiplier=${phase.setMultiplier.toFixed(2)} | intensityFactor=${phase.intensityFactor.toFixed(2)} | rirOffset=${phase.rirOffset}`
    );
  }
  lines.push('');

  lines.push('Program details');
  for (const day of plan.days) {
    lines.push('');
    lines.push(`${day.label} (estimated duration: ${formatDuration(calcDayDurationSeconds(day))})`);
    if (day.exercises.length === 0) {
      lines.push('- Rest / no exercises planned');
      continue;
    }

    day.exercises.forEach((planned, index) => {
      const exName = getExerciseName(planned.exerciseId, allExercises);
      if (planned.blockType === 'cardio') {
        const hrMin = Math.round(((planned.targetHrMinPercent ?? 0) / 100) * plan.maxHeartRate);
        const hrMax = Math.round(((planned.targetHrMaxPercent ?? 0) / 100) * plan.maxHeartRate);
        lines.push(
          `${index + 1}. ${exName} | block=cardio | preset=${planned.cardioPreset ?? 'zone2'} | duration=${formatDuration(planned.durationSeconds ?? 0)} | hr%=${planned.targetHrMinPercent ?? 0}-${planned.targetHrMaxPercent ?? 0} | targetBpm=${hrMin}-${hrMax}`
        );
        return;
      }
      if (planned.blockType === 'interval') {
        lines.push(
          `${index + 1}. ${exName} | block=interval | mode=${planned.intervalMode ?? 'simple'} | work=${planned.intervalWorkSeconds ?? 0}s | rest=${planned.intervalRestSeconds ?? 0}s | rounds=${planned.intervalRounds ?? 1}`
        );
        return;
      }
      lines.push(
        `${index + 1}. ${exName} | block=${planned.blockType} | goal=${planned.goal} | sets=${planned.sets} | reps=${planned.repMin}-${planned.repMax} | rest=${planned.restSeconds}s | RiR=${planned.rir} | unilateral=${planned.isUnilateral ? 'yes' : 'no'} | estTime=${formatDuration(calcExerciseDurationSeconds(planned))}`
      );
    });
  }

  if (plan.customExercises.length > 0) {
    lines.push('');
    lines.push('Custom exercises');
    for (const ex of plan.customExercises) {
      lines.push(
        `- ${ex.name} | categories=${ex.categories.join(', ')} | primary=${ex.primaryMuscles.join(', ')} | secondary=${ex.secondaryMuscles.join(', ')}`
      );
    }
  }

  lines.push('');
  lines.push('Prompt for evaluation');
  lines.push(
    'Please review this workout plan for the stated fitness level. Evaluate what is strong, what is weak, and what should be improved based on current evidence-based training best practices. Check exercise order, weekly volume, set/rep/rest choices, goal fit, and recovery demands. Suggest concrete adjustments.'
  );

  return lines.join('\n');
}
