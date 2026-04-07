import React from 'react';
import type { MuscleGroup, RecoveryStatus, TrainingDay, Weekday } from '../../types';
import { MUSCLE_LABELS } from '../../types';
import type { RecoveryConflictMap } from '../../utils/recovery';
import { RECOVERY_WEEKDAYS } from '../../utils/recovery';
import { getPlannedMuscles } from '../../utils/cardio';
import { EXERCISES } from '../../data/exercises';

interface Props {
  calendar: Record<MuscleGroup, Record<Weekday, RecoveryStatus>>;
  days: TrainingDay[];
  conflictMap: RecoveryConflictMap;
  weekdayLabels: Record<Weekday, string>;
  statusCodes: Record<RecoveryStatus, string>;
  freshLabel: string;
  recoveringLabel: string;
  fatiguedLabel: string;
  cyclingView: boolean;
  cyclingViewLabel: string;
  onToggleCyclingView: () => void;
  highlightConflicts: boolean;
  highlightConflictsLabel: string;
  onToggleHighlightConflicts: () => void;
  conflictsBadgeLabel: string;
  noConflictsLabel: string;
}

const COLORS: Record<RecoveryStatus, { bg: string; text: string }> = {
  fresh: { bg: '#0c4a6e', text: '#7dd3fc' },
  recovering: { bg: '#713f12', text: '#fde68a' },
  fatigued: { bg: '#7f1d1d', text: '#fca5a5' },
};

export const RecoveryCalendar: React.FC<Props> = ({
  calendar,
  weekdayLabels,
  statusCodes,
  freshLabel,
  recoveringLabel,
  fatiguedLabel,
  cyclingView,
  cyclingViewLabel,
  onToggleCyclingView,
  days,
  conflictMap,
  highlightConflicts,
  highlightConflictsLabel,
  onToggleHighlightConflicts,
  conflictsBadgeLabel,
  noConflictsLabel,
}) => {
  const muscles = Object.keys(MUSCLE_LABELS) as MuscleGroup[];
  const dayByWeekday = RECOVERY_WEEKDAYS.map((weekDay) => days.find((d) => d.weekDay === weekDay) ?? null);
  const trainedByWeekday: Record<Weekday, Set<MuscleGroup>> = {
    mon: new Set<MuscleGroup>(),
    tue: new Set<MuscleGroup>(),
    wed: new Set<MuscleGroup>(),
    thu: new Set<MuscleGroup>(),
    fri: new Set<MuscleGroup>(),
    sat: new Set<MuscleGroup>(),
    sun: new Set<MuscleGroup>(),
  };
  for (const day of days) {
    for (const planned of day.exercises) {
      const ex = EXERCISES.find((e) => e.id === planned.exerciseId);
      if (!ex) continue;
      const plannedMuscles = getPlannedMuscles(planned, ex);
      plannedMuscles.primary.forEach((m) => trainedByWeekday[day.weekDay].add(m));
      plannedMuscles.secondary.forEach((m) => trainedByWeekday[day.weekDay].add(m));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onToggleCyclingView}
          className="px-2.5 py-1 rounded-lg text-[10px] border font-semibold"
          style={{
            background: cyclingView ? '#0ea5e922' : '#13152a',
            borderColor: cyclingView ? '#0ea5e955' : '#2a2d42',
            color: cyclingView ? '#38bdf8' : '#6b7280',
          }}
        >
          {cyclingViewLabel}: {cyclingView ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={onToggleHighlightConflicts}
          className="px-2.5 py-1 rounded-lg text-[10px] border font-semibold"
          style={{
            background: highlightConflicts ? '#ef444422' : '#13152a',
            borderColor: highlightConflicts ? '#ef444477' : '#2a2d42',
            color: highlightConflicts ? '#fca5a5' : '#6b7280',
          }}
        >
          {highlightConflictsLabel}: {highlightConflicts ? 'ON' : 'OFF'}
        </button>
      </div>
      {highlightConflicts && (
        <div className="flex flex-wrap gap-2">
          {dayByWeekday.map((day, index) => {
            const conflictCount = day ? (conflictMap[day.id]?.length ?? 0) : 0;
            const conflictTitle = day
              ? (conflictMap[day.id] ?? [])
                  .map((c) => `${c.exerciseName} (${c.fatiguedPrimaryMuscles.join(', ')})`)
                  .join('\n')
              : '';
            return (
              <div
                key={`conflict-${RECOVERY_WEEKDAYS[index]}`}
                className="px-2 py-1 rounded-md border text-[10px] font-semibold"
                style={{
                  background: conflictCount > 0 ? '#7f1d1d' : '#0f172a',
                  borderColor: conflictCount > 0 ? '#fca5a5' : '#334155',
                  color: conflictCount > 0 ? '#fecaca' : '#93c5fd',
                }}
                title={conflictTitle}
              >
                {weekdayLabels[RECOVERY_WEEKDAYS[index]]}: {conflictCount > 0 ? `${conflictCount} ${conflictsBadgeLabel}` : noConflictsLabel}
              </div>
            );
          })}
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#2a2d42' }}>
        <table className="min-w-full text-[10px]">
          <thead style={{ background: '#13152a' }}>
            <tr>
              <th className="text-left px-2 py-2 text-gray-400">Muscle</th>
              {RECOVERY_WEEKDAYS.map((d) => (
                <th key={d} className="px-2 py-2 text-gray-500">{weekdayLabels[d]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {muscles.map((muscle) => (
              <tr key={muscle} className="border-t" style={{ borderColor: '#1e2035' }}>
                <td className="px-2 py-1.5 text-gray-300">{MUSCLE_LABELS[muscle]}</td>
                {RECOVERY_WEEKDAYS.map((d) => {
                  const status = calendar[muscle]?.[d] ?? 'fresh';
                  const color = COLORS[status];
                  const day = days.find((x) => x.weekDay === d);
                  const dayConflicts = day ? (conflictMap[day.id] ?? []) : [];
                  const hasConflict = highlightConflicts && dayConflicts.some((c) => c.fatiguedPrimaryMuscles.includes(muscle));
                  const isTrained = trainedByWeekday[d].has(muscle);
                  return (
                    <td key={`${muscle}-${d}`} className="px-1 py-1">
                      <div
                        className="rounded px-1.5 py-1 text-center font-semibold uppercase"
                        style={{
                          background: hasConflict ? '#ef4444' : color.bg,
                          color: hasConflict ? '#ffffff' : color.text,
                          border: hasConflict ? '2px solid #fef2f2' : isTrained ? '2px solid #60a5fa' : '1px solid transparent',
                          boxShadow: hasConflict ? '0 0 0 1px #7f1d1d inset' : isTrained ? '0 0 0 1px #1e3a8a inset' : 'none',
                        }}
                        title={status === 'fresh' ? freshLabel : status === 'recovering' ? recoveringLabel : fatiguedLabel}
                      >
                        {statusCodes[status]}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.fresh.text }} />{freshLabel}</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.recovering.text }} />{recoveringLabel}</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: COLORS.fatigued.text }} />{fatiguedLabel}</span>
      </div>
    </div>
  );
};
