import React, { useState } from 'react';
import type { Exercise, TrainingDay, MuscleGroup } from '../../types';
import { EXERCISES } from '../../data/exercises';
import { MuscleDiagram } from '../MuscleDiagram/MuscleDiagram';
import { StatsPanel } from '../StatsPanel/StatsPanel';
import { calcWeeklyMuscleVolume } from '../../utils/calculations';
import { MUSCLE_COLORS } from '../../utils/categoryColors';

interface Props {
  hoveredExercise: Exercise | null;
  days: TrainingDay[];
  customExercises: Exercise[];
  colorMode: boolean;
}

export const InfoPanel: React.FC<Props> = ({ hoveredExercise, days, customExercises, colorMode }) => {
  const [tab, setTab] = useState<'body' | 'weekly' | 'daily'>('body');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const allExercises = [...EXERCISES, ...customExercises];
  const weeklyVolume = calcWeeklyMuscleVolume(days, allExercises);

  const safeDay = days[selectedDayIndex] ?? days[0];
  const dailyVolume = safeDay
    ? calcWeeklyMuscleVolume([safeDay], allExercises)
    : {};

  const displayExercise = hoveredExercise;

  const allPrimary = new Set<MuscleGroup>();
  const allSecondary = new Set<MuscleGroup>();
  for (const day of days) {
    for (const planned of day.exercises) {
      const ex = allExercises.find((e) => e.id === planned.exerciseId);
      if (!ex) continue;
      ex.primaryMuscles.forEach((m) => allPrimary.add(m));
      ex.secondaryMuscles.forEach((m) => allSecondary.add(m));
    }
  }

  const showPrimary = displayExercise
    ? displayExercise.primaryMuscles
    : Array.from(allPrimary) as MuscleGroup[];
  const showSecondary = displayExercise
    ? displayExercise.secondaryMuscles
    : Array.from(allSecondary).filter((m) => !allPrimary.has(m)) as MuscleGroup[];

  const TABS = [
    { id: 'body' as const, label: 'Muscle Map' },
    { id: 'weekly' as const, label: 'Weekly' },
    { id: 'daily' as const, label: 'Daily' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex-shrink-0 p-4 border-b" style={{ borderColor: '#1e2035' }}>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#2a2d42' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
              style={{
                background: tab === t.id ? '#f9731620' : 'transparent',
                color: tab === t.id ? '#f97316' : '#6b7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ── Muscle Map ── */}
        {tab === 'body' && (
          <div className="space-y-4">
            <div className="text-center">
              {displayExercise ? (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Viewing</p>
                  <p className="text-sm font-semibold text-white">{displayExercise.name}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Weekly overview</p>
                  <p className="text-sm font-semibold text-gray-400">
                    {showPrimary.length === 0 ? 'No exercises planned' : 'All planned muscles'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="mx-auto" style={{ width: 110, height: 220 }}>
                  <MuscleDiagram
                    primaryMuscles={showPrimary}
                    secondaryMuscles={showSecondary}
                    view="front"
                    muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1 block">Front</span>
              </div>
              <div className="text-center">
                <div className="mx-auto" style={{ width: 110, height: 220 }}>
                  <MuscleDiagram
                    primaryMuscles={showPrimary}
                    secondaryMuscles={showSecondary}
                    view="back"
                    muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1 block">Back</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5 text-xs text-gray-500">
              {colorMode ? (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0ea5e9' }} /><span>Push</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} /><span>Pull</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} /><span>Legs</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} /><span>Core</span></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }} />
                    Primary
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f9731640' }} />
                    Secondary
                  </div>
                </>
              )}
            </div>

            {!displayExercise && (
              <p className="text-xs text-gray-600 text-center">Hover any exercise to preview its activation</p>
            )}
          </div>
        )}

        {/* ── Weekly Stats ── */}
        {tab === 'weekly' && (
          <StatsPanel volume={weeklyVolume} title="Weekly Volume" />
        )}

        {/* ── Daily Stats ── */}
        {tab === 'daily' && (
          <div className="space-y-4">
            {/* Day picker */}
            {days.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((day, idx) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayIndex(idx)}
                      className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: selectedDayIndex === idx ? '#f9731622' : '#1a1d2e',
                        color: selectedDayIndex === idx ? '#f97316' : '#6b7280',
                        border: `1px solid ${selectedDayIndex === idx ? '#f9731644' : '#2a2d42'}`,
                      }}
                    >
                      {day.label.length > 14 ? day.label.slice(0, 13) + '…' : day.label}
                    </button>
                  ))}
                </div>

                {safeDay && safeDay.exercises.length > 0 ? (() => {
                  const dayPrimary = new Set<MuscleGroup>();
                  const daySecondary = new Set<MuscleGroup>();
                  for (const planned of safeDay.exercises) {
                    const ex = allExercises.find((e) => e.id === planned.exerciseId);
                    if (!ex) continue;
                    ex.primaryMuscles.forEach((m) => dayPrimary.add(m));
                    ex.secondaryMuscles.forEach((m) => daySecondary.add(m));
                  }
                  const primary = Array.from(dayPrimary) as MuscleGroup[];
                  const secondary = Array.from(daySecondary).filter((m) => !dayPrimary.has(m)) as MuscleGroup[];
                  return (
                    <>
                      {/* Muscle diagram for the day */}
                      <div className="flex justify-center gap-3">
                        <div className="text-center">
                          <div className="mx-auto" style={{ width: 90, height: 180 }}>
                            <MuscleDiagram
                              primaryMuscles={primary}
                              secondaryMuscles={secondary}
                              view="front"
                              muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 mt-1 block">Front</span>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto" style={{ width: 90, height: 180 }}>
                            <MuscleDiagram
                              primaryMuscles={primary}
                              secondaryMuscles={secondary}
                              view="back"
                              muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 mt-1 block">Back</span>
                        </div>
                      </div>
                      <StatsPanel volume={dailyVolume} title={`${safeDay.label} — Volume`} />
                    </>
                  );
                })() : (
                  <div className="text-center py-8 text-gray-600">
                    <p className="text-sm">No exercises in this session yet</p>
                    <p className="text-xs mt-1 text-gray-700">Drag exercises from the library to add them</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p className="text-sm">No training days configured</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
