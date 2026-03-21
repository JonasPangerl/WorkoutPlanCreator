import React, { useState } from 'react';
import type { Exercise, TrainingDay, MuscleGroup } from '../../types';
import { EXERCISES } from '../../data/exercises';
import { MuscleDiagram } from '../MuscleDiagram/MuscleDiagram';
import { StatsPanel } from '../StatsPanel/StatsPanel';
import { calcWeeklyMuscleVolume } from '../../utils/calculations';
import { MUSCLE_COLORS } from '../../utils/categoryColors';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  hoveredExercise: Exercise | null;
  days: TrainingDay[];
  customExercises: Exercise[];
  colorMode: boolean;
}

function getDayMuscles(day: TrainingDay, allExercises: Exercise[]) {
  const primary = new Set<MuscleGroup>();
  const secondary = new Set<MuscleGroup>();
  for (const planned of day.exercises) {
    const ex = allExercises.find((e) => e.id === planned.exerciseId);
    if (!ex) continue;
    ex.primaryMuscles.forEach((m) => primary.add(m));
    ex.secondaryMuscles.forEach((m) => secondary.add(m));
  }
  return {
    primary: Array.from(primary) as MuscleGroup[],
    secondary: Array.from(secondary).filter((m) => !primary.has(m)) as MuscleGroup[],
  };
}

export const InfoPanel: React.FC<Props> = ({ hoveredExercise, days, customExercises, colorMode }) => {
  const [tab, setTab] = useState<'body' | 'weekly' | 'daily' | 'overview'>('body');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const { t } = useTranslation();

  const allExercises = [...EXERCISES, ...customExercises];
  const weeklyVolume = calcWeeklyMuscleVolume(days, allExercises);

  const safeDay = days[selectedDayIndex] ?? days[0];
  const dailyVolume = safeDay ? calcWeeklyMuscleVolume([safeDay], allExercises) : {};

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
    { id: 'body' as const,     label: t.muscleMapTab },
    { id: 'overview' as const, label: t.overviewTab },
    { id: 'weekly' as const,   label: t.weeklyTab },
    { id: 'daily' as const,    label: t.dailyTab },
  ];

  const ColorLegend = () => (
    <div className="flex items-center justify-center gap-5 text-xs text-gray-500">
      {colorMode ? (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#0ea5e9' }} /><span>{t.pushLegend}</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} /><span>{t.pullLegend}</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} /><span>{t.legsLegend}</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} /><span>{t.coreLegend}</span></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }} />
            {t.primaryLegend}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f9731640' }} />
            {t.secondaryLegend}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex-shrink-0 p-3 border-b" style={{ borderColor: '#1e2035' }}>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#2a2d42' }}>
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors"
              style={{
                background: tab === tb.id ? '#f9731620' : 'transparent',
                color: tab === tb.id ? '#f97316' : '#6b7280',
              }}
            >
              {tb.label}
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
                  <p className="text-xs text-gray-500 mb-0.5">{t.viewingLabel}</p>
                  <p className="text-sm font-semibold text-white">{t.exerciseNames[displayExercise.id] ?? displayExercise.name}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{t.weeklyOverview}</p>
                  <p className="text-sm font-semibold text-gray-400">
                    {showPrimary.length === 0 ? t.noExercisesPlanned : t.allPlannedMuscles}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-6">
              <div className="text-center">
                <div className="mx-auto" style={{ width: 130, height: 260 }}>
                  <MuscleDiagram
                    primaryMuscles={showPrimary}
                    secondaryMuscles={showSecondary}
                    view="front"
                    muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1 block">{t.frontLabel}</span>
              </div>
              <div className="text-center">
                <div className="mx-auto" style={{ width: 130, height: 260 }}>
                  <MuscleDiagram
                    primaryMuscles={showPrimary}
                    secondaryMuscles={showSecondary}
                    view="back"
                    muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-1 block">{t.backLabel}</span>
              </div>
            </div>

            <ColorLegend />

            {!displayExercise && (
              <p className="text-xs text-gray-600 text-center">{t.hoverHint}</p>
            )}
          </div>
        )}

        {/* ── Overview: all days side by side ── */}
        {tab === 'overview' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.weeklyMapTitle}</h3>

            {days.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p className="text-sm">{t.noTrainingDays}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {days.map((day) => {
                  const { primary, secondary } = getDayMuscles(day, allExercises);
                  const isEmpty = day.exercises.length === 0;
                  return (
                    <div
                      key={day.id}
                      className="rounded-xl border p-3 flex flex-col gap-2"
                      style={{ background: '#0f1117', borderColor: '#1e2035' }}
                    >
                      {/* Day label */}
                      <p
                        className="text-xs font-semibold truncate text-center"
                        style={{ color: isEmpty ? '#374151' : '#e5e7eb' }}
                      >
                        {day.label}
                      </p>

                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-3 gap-1">
                          <svg className="w-5 h-5" style={{ color: '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-[10px]" style={{ color: '#374151' }}>{t.restDayLabel}</span>
                        </div>
                      ) : (
                        <>
                          {/* Front + back mini diagrams */}
                          <div className="flex justify-center gap-2">
                            <div className="text-center">
                              <div style={{ width: 72, height: 144, margin: '0 auto' }}>
                                <MuscleDiagram
                                  primaryMuscles={primary}
                                  secondaryMuscles={secondary}
                                  view="front"
                                  compact
                                  muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                                />
                              </div>
                              <span className="text-[9px] text-gray-700 mt-0.5 block">{t.frontLabel}</span>
                            </div>
                            <div className="text-center">
                              <div style={{ width: 72, height: 144, margin: '0 auto' }}>
                                <MuscleDiagram
                                  primaryMuscles={primary}
                                  secondaryMuscles={secondary}
                                  view="back"
                                  compact
                                  muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                                />
                              </div>
                              <span className="text-[9px] text-gray-700 mt-0.5 block">{t.backLabel}</span>
                            </div>
                          </div>

                          {/* Exercise count pill */}
                          <p className="text-center text-[10px]" style={{ color: '#f97316' }}>
                            {day.exercises.length === 1
                              ? t.exercisesSingular
                              : t.exercisesPlural.replace('{n}', String(day.exercises.length))}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shared legend */}
            <div className="pt-1">
              <ColorLegend />
            </div>
          </div>
        )}

        {/* ── Weekly Stats ── */}
        {tab === 'weekly' && (
          <StatsPanel volume={weeklyVolume} />
        )}

        {/* ── Daily Stats ── */}
        {tab === 'daily' && (
          <div className="space-y-4">
            {days.length > 0 ? (
              <>
                {/* Day picker */}
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
                  const { primary, secondary } = getDayMuscles(safeDay, allExercises);
                  return (
                    <>
                      <div className="flex justify-center gap-4">
                        <div className="text-center">
                          <div className="mx-auto" style={{ width: 100, height: 200 }}>
                            <MuscleDiagram
                              primaryMuscles={primary}
                              secondaryMuscles={secondary}
                              view="front"
                              muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 mt-1 block">{t.frontLabel}</span>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto" style={{ width: 100, height: 200 }}>
                            <MuscleDiagram
                              primaryMuscles={primary}
                              secondaryMuscles={secondary}
                              view="back"
                              muscleColors={colorMode ? MUSCLE_COLORS : undefined}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 mt-1 block">{t.backLabel}</span>
                        </div>
                      </div>
                      <ColorLegend />
                      <StatsPanel volume={dailyVolume} title={`${safeDay.label} ${t.volumeSuffix}`} />
                    </>
                  );
                })() : (
                  <div className="text-center py-8 text-gray-600">
                    <p className="text-sm">{t.noExercisesInSession}</p>
                    <p className="text-xs mt-1 text-gray-700">{t.dragToAddHint}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p className="text-sm">{t.noTrainingDays}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
