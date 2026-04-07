import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useWorkoutPlan } from './hooks/useWorkoutPlan';
import { EXERCISES } from './data/exercises';
import { ExerciseLibrary } from './components/ExerciseLibrary/ExerciseLibrary';
import { TrainingDayColumn } from './components/WeeklyPlanner/TrainingDayColumn';
import { InfoPanel } from './components/InfoPanel/InfoPanel';
import type { Exercise } from './types';
import type { Goal } from './types';
import type { FitnessLevel } from './types';
import type { PlannedBlockType } from './types';
import { exportPlanJSON, importPlanJSON } from './utils/storage';
import { exportToPDF, exportFullPeriodPDF } from './utils/pdf';
import { buildLLMExportText } from './utils/textExport';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import type { Locale } from './i18n/translations';
import { HelpContent } from './components/Help/HelpContent';

function AppInner() {
  const { t, locale, setLocale } = useTranslation();
  const {
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
  } = useWorkoutPlan();

  const [hoveredExercise, setHoveredExercise] = useState<Exercise | null>(null);
  const [activeDragExerciseId, setActiveDragExerciseId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(() => {
    return (localStorage.getItem('fitnessLevel') as FitnessLevel) || 'intermediate';
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showFirstSteps, setShowFirstSteps] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const allExercises = useMemo(
    () => [...EXERCISES, ...plan.customExercises],
    [plan.customExercises]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === 'exercise') {
      setActiveDragExerciseId(data.exerciseId as string);
    }
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // nothing needed
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragExerciseId(null);

    if (!over) return;

    const activeData = active.data.current;

    // ── New exercise dragged from library into a day ──
    if (activeData?.type === 'exercise') {
      const exerciseId = activeData.exerciseId as string;
      const goal = (activeData.defaultGoal as Goal) ?? 'hypertrophy';
      const blockType = (activeData.blockType as PlannedBlockType) ?? 'strength';

      // over.id could be the day id (droppable) or a plannedExercise instanceId (sortable inside a day)
      let targetDayId: string | null = null;

      const dayById = plan.days.find((d) => d.id === over.id);
      if (dayById) {
        targetDayId = dayById.id;
      } else {
        // over is an exercise instance — find its day
        const day = plan.days.find((d) => d.exercises.some((e) => e.instanceId === over.id));
        if (day) targetDayId = day.id;
      }

      if (targetDayId) {
        addExerciseToDay(targetDayId, exerciseId, goal, blockType);
      }
      return;
    }

    // ── Reorder within same day ──
    const instanceId = active.id as string;
    const overInstanceId = over.id as string;

    const fromDay = plan.days.find((d) => d.exercises.some((e) => e.instanceId === instanceId));
    const toDay = plan.days.find(
      (d) => d.id === overInstanceId || d.exercises.some((e) => e.instanceId === overInstanceId)
    );

    if (!fromDay || !toDay) return;

    if (fromDay.id === toDay.id) {
      const oldIndex = fromDay.exercises.findIndex((e) => e.instanceId === instanceId);
      const newIndex = fromDay.exercises.findIndex((e) => e.instanceId === overInstanceId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderExercises(fromDay.id, arrayMove(fromDay.exercises, oldIndex, newIndex));
      }
    }
  }, [plan.days, addExerciseToDay, reorderExercises]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importPlanJSON(file);
      replacePlan(imported);
    } catch {
      alert(t.importError);
    }
    e.target.value = '';
  };

  const activeExercise = activeDragExerciseId
    ? allExercises.find((e) => e.id === activeDragExerciseId)
    : null;

  const handleCopyLLMExport = useCallback(async () => {
    try {
      const text = buildLLMExportText(plan, allExercises, fitnessLevel);
      await navigator.clipboard.writeText(text);
      alert(t.copySuccess);
    } catch {
      alert(t.copyFailed);
    }
  }, [allExercises, fitnessLevel, plan, t.copyFailed, t.copySuccess]);

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0a0b12' }}>
        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b"
          style={{ background: '#0f1117', borderColor: '#1e2035' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFirstSteps(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-emerald-500/40"
              style={{ background: '#10b98118', borderColor: '#10b98144', color: '#34d399' }}
            >
              {t.firstStepsBtn}
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">{t.appTitle}</h1>
              <p className="text-[10px] text-gray-600">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#2a2d42' }}>
              {(['en', 'de'] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className="px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-all"
                  style={{
                    background: locale === l ? '#f9731622' : 'transparent',
                    color: locale === l ? '#f97316' : '#6b7280',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Fitness level selector */}
            {(() => {
              const LEVELS: { value: FitnessLevel; label: string; desc: string; color: string }[] = [
                { value: 'beginner',     label: t.levelBeginner,     desc: t.levelBeginnerDesc,     color: '#22c55e' },
                { value: 'intermediate', label: t.levelIntermediate, desc: t.levelIntermediateDesc, color: '#f97316' },
                { value: 'advanced',     label: t.levelAdvanced,     desc: t.levelAdvancedDesc,     color: '#ef4444' },
              ];
              return (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{t.fitnessLevelLabel}</span>
                  <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#2a2d42' }}>
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        onClick={() => {
                          setFitnessLevel(lvl.value);
                          localStorage.setItem('fitnessLevel', lvl.value);
                        }}
                        title={lvl.desc}
                        className="px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all whitespace-nowrap"
                        style={{
                          background: fitnessLevel === lvl.value ? `${lvl.color}22` : 'transparent',
                          color: fitnessLevel === lvl.value ? lvl.color : '#6b7280',
                          borderRight: '1px solid #2a2d42',
                        }}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* View toggles */}
            <button
              onClick={() => setColorMode((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: colorMode ? '#3b82f622' : '#13152a',
                borderColor: colorMode ? '#3b82f644' : '#2a2d42',
                color: colorMode ? '#60a5fa' : '#6b7280',
              }}
              title={t.colorsTooltip}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              {t.colorsLabel}
            </button>
            <button
              onClick={() => setCompactMode((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
              style={{
                background: compactMode ? '#f9731622' : '#13152a',
                borderColor: compactMode ? '#f9731644' : '#2a2d42',
                color: compactMode ? '#f97316' : '#6b7280',
              }}
              title={t.compactTooltip}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
              </svg>
              {t.compactLabel}
            </button>

            {/* Trainings per week */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border" style={{ background: '#13152a', borderColor: '#2a2d42' }}>
              <span className="text-xs text-gray-500">{t.daysWeek}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTrainingsPerWeek(plan.trainingsPerWeek - 1)}
                  disabled={plan.trainingsPerWeek <= 1}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 text-sm flex items-center justify-center"
                >−</button>
                <span className="text-white font-bold text-sm w-5 text-center">{plan.trainingsPerWeek}</span>
                <button
                  onClick={() => setTrainingsPerWeek(plan.trainingsPerWeek + 1)}
                  disabled={plan.trainingsPerWeek >= 7}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 text-sm flex items-center justify-center"
                >+</button>
              </div>
            </div>

            {/* Global default rest */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border" style={{ background: '#13152a', borderColor: '#2a2d42' }}>
              <span className="text-xs text-gray-500">{t.defaultRestLabel}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDefaultRestSeconds(plan.defaultRestSeconds - 15)}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm flex items-center justify-center"
                >−</button>
                <span className="text-white font-bold text-sm w-14 text-center">{formatSeconds(plan.defaultRestSeconds)}</span>
                <button
                  onClick={() => setDefaultRestSeconds(plan.defaultRestSeconds + 15)}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm flex items-center justify-center"
                >+</button>
              </div>
              <span className="text-[10px] text-gray-600">{t.step15SecLabel}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border" style={{ background: '#13152a', borderColor: '#2a2d42' }}>
              <span className="text-xs text-gray-500">{t.maxHrLabel}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setMaxHeartRate(plan.maxHeartRate - 1)} className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10">−</button>
                <span className="text-white font-bold text-sm w-12 text-center">{plan.maxHeartRate}</span>
                <button onClick={() => setMaxHeartRate(plan.maxHeartRate + 1)} className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10">+</button>
              </div>
            </div>

            {/* Periodization controls */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 border" style={{ background: '#13152a', borderColor: '#2a2d42' }}>
              <span className="text-xs text-gray-500">{t.cycleWeeksLabel}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updatePeriodization({ cycleWeeks: plan.periodization.cycleWeeks - 1 })}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm flex items-center justify-center"
                >−</button>
                <span className="text-white font-bold text-sm w-8 text-center">{plan.periodization.cycleWeeks}</span>
                <button
                  onClick={() => updatePeriodization({ cycleWeeks: plan.periodization.cycleWeeks + 1 })}
                  className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm flex items-center justify-center"
                >+</button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updatePeriodization({ uprampEnabled: !plan.periodization.uprampEnabled })}
                className="px-2 py-1 rounded-lg text-[10px] border"
                style={{
                  background: plan.periodization.uprampEnabled ? '#22c55e22' : '#13152a',
                  borderColor: plan.periodization.uprampEnabled ? '#22c55e55' : '#2a2d42',
                  color: plan.periodization.uprampEnabled ? '#22c55e' : '#6b7280',
                }}
              >
                {t.uprampLabel}
              </button>
              <button
                onClick={() => updatePeriodization({ overreachEnabled: !plan.periodization.overreachEnabled })}
                className="px-2 py-1 rounded-lg text-[10px] border"
                style={{
                  background: plan.periodization.overreachEnabled ? '#f59e0b22' : '#13152a',
                  borderColor: plan.periodization.overreachEnabled ? '#f59e0b55' : '#2a2d42',
                  color: plan.periodization.overreachEnabled ? '#f59e0b' : '#6b7280',
                }}
              >
                {t.overreachLabel}
              </button>
              <button
                onClick={() => updatePeriodization({ deloadEnabled: !plan.periodization.deloadEnabled })}
                className="px-2 py-1 rounded-lg text-[10px] border"
                style={{
                  background: plan.periodization.deloadEnabled ? '#60a5fa22' : '#13152a',
                  borderColor: plan.periodization.deloadEnabled ? '#60a5fa55' : '#2a2d42',
                  color: plan.periodization.deloadEnabled ? '#60a5fa' : '#6b7280',
                }}
              >
                {t.deloadLabel}
              </button>
              {plan.periodization.uprampEnabled && (
                <div className="flex items-center gap-1 rounded-lg border px-2 py-1" style={{ borderColor: '#2a2d42' }}>
                  <span className="text-[10px] text-gray-500">{t.uprampWeeksLabel}</span>
                  <button onClick={() => updatePeriodization({ uprampWeeks: plan.periodization.uprampWeeks - 1 })} className="text-gray-400 hover:text-white">−</button>
                  <span className="text-[10px] text-white">{plan.periodization.uprampWeeks}</span>
                  <button onClick={() => updatePeriodization({ uprampWeeks: plan.periodization.uprampWeeks + 1 })} className="text-gray-400 hover:text-white">+</button>
                </div>
              )}
            </div>

            {/* Import */}
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-gray-500"
              style={{ background: '#13152a', borderColor: '#2a2d42', color: '#9ca3af' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t.importBtn}
            </button>

            {/* Export JSON */}
            <button
              onClick={() => exportPlanJSON(plan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-gray-500"
              style={{ background: '#13152a', borderColor: '#2a2d42', color: '#9ca3af' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.exportJsonBtn}
            </button>

            {/* Export LLM text */}
            <button
              onClick={handleCopyLLMExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-emerald-500/40"
              style={{ background: '#10b98118', borderColor: '#10b98144', color: '#10b981' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8M8 13h6m5 8H7a2 2 0 01-2-2V5a2 2 0 012-2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.exportLlmBtn}
            </button>

            {/* Export PDF */}
            <button
              onClick={() => exportToPDF(plan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-orange-500/40"
              style={{ background: '#f9731618', borderColor: '#f9731644', color: '#f97316' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t.pdfBtn}
            </button>
            <button
              onClick={() => exportFullPeriodPDF(plan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-cyan-500/40"
              style={{ background: '#0891b218', borderColor: '#0891b244', color: '#22d3ee' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6m13 9H5a2 2 0 01-2-2V5a2 2 0 012-2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t.fullPeriodPdfBtn}
            </button>

            {/* Help */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:border-blue-500/40"
              style={{ background: '#3b82f618', borderColor: '#3b82f644', color: '#60a5fa' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9a3 3 0 115.544 2c0 2-3 2-3 4m.008 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.helpBtn}
            </button>
          </div>
        </header>

        {/* Main layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Exercise Library */}
          <div
            className="flex-shrink-0 w-96 border-r flex flex-col overflow-hidden"
            style={{ borderColor: '#1e2035', background: '#0f1117' }}
          >
            <ExerciseLibrary
              customExercises={plan.customExercises}
              onAddCustom={addCustomExercise}
              onDeleteCustom={deleteCustomExercise}
            />
          </div>

          {/* Center: Weekly planner */}
          <div className="flex-1 min-w-0 overflow-x-auto p-4" id="planner-area">
            <div
              className="flex gap-4 h-full"
              style={{ minWidth: `${plan.days.length * 360}px` }}
            >
              {plan.days.map((day) => (
                <div key={day.id} className="flex-1 min-w-[320px] max-w-[420px]">
                  <TrainingDayColumn
                    day={day}
                    allExercises={allExercises}
                    onUpdateLabel={(label) => updateDayLabel(day.id, label)}
                    onUpdateWeekday={(weekDay) => updateDayWeekday(day.id, weekDay)}
                    onRemoveExercise={(instanceId) => removeExerciseFromDay(day.id, instanceId)}
                    onUpdateExercise={(instanceId, updates) => updateExercise(day.id, instanceId, updates)}
                    onChangeGoal={(instanceId, goal) => changeExerciseGoal(day.id, instanceId, goal)}
                    onHoverExercise={setHoveredExercise}
                    colorMode={colorMode}
                    compactMode={compactMode}
                    fitnessLevel={fitnessLevel}
                    maxHeartRate={plan.maxHeartRate}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info panel */}
          <div
            className="flex-shrink-0 w-[440px] border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#1e2035', background: '#0f1117' }}
          >
            <InfoPanel
              hoveredExercise={hoveredExercise}
              days={plan.days}
              customExercises={plan.customExercises}
              colorMode={colorMode}
              fitnessLevel={fitnessLevel}
            />
          </div>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#00000099' }}>
          <div className="w-full max-w-3xl rounded-2xl border shadow-2xl max-h-[85vh] overflow-y-auto" style={{ background: '#0f1117', borderColor: '#2a2d42' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2a2d42' }}>
              <h2 className="text-lg font-semibold text-white">{t.helpBtn}</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
            </div>
            <div className="p-5">
              <HelpContent />
            </div>
          </div>
        </div>
      )}
      {showFirstSteps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#00000099' }}>
          <div className="w-full max-w-3xl rounded-2xl border shadow-2xl max-h-[85vh] overflow-y-auto" style={{ background: '#0f1117', borderColor: '#2a2d42' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2a2d42' }}>
              <h2 className="text-lg font-semibold text-white">{t.firstStepsBtn}</h2>
              <button onClick={() => setShowFirstSteps(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
            </div>
            <div className="p-5 text-sm text-gray-300 space-y-3">
              <p>1) Set your weekly structure first: number of training days, weekdays, default rest, and max heart rate.</p>
              <p>2) Build each day by dragging blocks from the library tabs: Muscle Training, Endurance, Plyometric, or Break/Warmup.</p>
              <p>3) Tune intensity with goals (or HR zones for endurance), then adjust sets/reps/RiR/rest per block.</p>
              <p>4) Use the Recovery tab to check muscle status and highlight fatigue conflicts before finalizing.</p>
              <p>5) Export: quick weekly PDF, full-period PDF, or copy plain-text for LLM analysis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      <DragOverlay>
        {activeExercise && (
          <div
            className="rounded-lg border px-3 py-2 shadow-2xl"
            style={{ background: '#1f2235', borderColor: '#f97316', opacity: 0.95, maxWidth: 240 }}
          >
            <span className="text-sm font-medium text-white">{activeExercise.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

export default App;
