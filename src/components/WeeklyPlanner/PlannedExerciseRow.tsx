import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PlannedExercise, Exercise } from '../../types';
import type { Goal } from '../../types';
import { calcExerciseDurationSeconds, formatDuration } from '../../utils/calculations';
import { MuscleTags } from '../shared/MuscleTags';
import { GoalSelector } from '../shared/GoalSelector';
import { CATEGORY_COLORS } from '../../utils/categoryColors';
import { GOAL_PRESETS } from '../../utils/presets';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  planned: PlannedExercise;
  exercise: Exercise;
  onRemove: () => void;
  onUpdate: (updates: Partial<PlannedExercise>) => void;
  onGoalChange: (goal: Goal) => void;
  onHover: (exercise: Exercise | null) => void;
  colorMode: boolean;
  compactMode: boolean;
}

export const PlannedExerciseRow: React.FC<Props> = ({
  planned,
  exercise,
  onRemove,
  onUpdate,
  onGoalChange,
  onHover,
  colorMode,
  compactMode,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: planned.instanceId,
  });
  const { t } = useTranslation();

  const duration = calcExerciseDurationSeconds(planned);
  const displayName = t.exerciseNames[exercise.id] ?? exercise.name;

  const formatRest = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0 && s > 0) return `${m}:${String(s).padStart(2, '0')}`;
    if (m > 0) return `${m}:00`;
    return `${s}s`;
  };

  // Resolve block color from the exercise's first category
  const blockColor = CATEGORY_COLORS[exercise.categories?.[0]] ?? '#374151';

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border group transition-all"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: colorMode ? `${blockColor}35` : '#13152a',
        borderColor: colorMode ? `${blockColor}90` : '#2a2d42',
        borderLeftWidth: colorMode ? 3 : 1,
        borderLeftColor: colorMode ? blockColor : '#2a2d42',
      }}
      onMouseEnter={() => onHover(exercise)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="p-2.5">
        {/* Top row: drag handle, name, duration, remove */}
        <div className="flex items-center gap-2 mb-1.5">
          <button
            className="text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 100-4 2 2 0 000 4zM8 14a2 2 0 100-4 2 2 0 000 4zM8 22a2 2 0 100-4 2 2 0 000 4zM16 6a2 2 0 100-4 2 2 0 000 4zM16 14a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-semibold truncate block"
              style={{ color: colorMode ? blockColor : 'white' }}
            >
              {displayName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-gray-600">{formatDuration(duration)}</span>
            {/* Goal badge — always visible so compact mode still shows it */}
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold leading-none"
              style={{
                background: `${GOAL_PRESETS[planned.goal].color}25`,
                color: GOAL_PRESETS[planned.goal].color,
              }}
            >
              {t.goalAbbrev[planned.goal] ?? planned.goal.slice(0, 3).toUpperCase()}
            </span>
            <button
              onClick={onRemove}
              className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Muscle tags — always visible */}
        <div className="mb-1.5">
          <MuscleTags primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} compact />
        </div>

        {/* Compact mode hides everything below */}
        {!compactMode && (
          <>
            {/* Goal selector + unilateral toggle */}
            <div className="flex items-center justify-between mb-2.5">
              <GoalSelector goal={planned.goal} onChange={onGoalChange} size="sm" />
              {exercise.canBeUnilateral && (
                <button
                  onClick={() => onUpdate({ isUnilateral: !planned.isUnilateral })}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                  style={{
                    background: planned.isUnilateral ? '#f9731622' : '#1a1d2e',
                    color: planned.isUnilateral ? '#f97316' : '#4b5563',
                    border: `1px solid ${planned.isUnilateral ? '#f9731644' : '#2a2d42'}`,
                  }}
                  title={t.unilateralTooltip}
                >
                  <span>1×</span>
                  <span>{planned.isUnilateral ? t.unilateralOn : t.unilateralOff}</span>
                </button>
              )}
            </div>

            {/* Sets / Reps / Rest controls */}
            <div className="grid grid-cols-3 gap-2">
              {/* Sets */}
              <div className="rounded-lg p-2 text-center" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">{t.setsLabel}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onUpdate({ sets: Math.max(1, planned.sets - 1) })}
                    className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center justify-center"
                  >−</button>
                  <span className="text-white font-semibold text-sm w-5 text-center">{planned.sets}</span>
                  <button
                    onClick={() => onUpdate({ sets: planned.sets + 1 })}
                    className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center justify-center"
                  >+</button>
                </div>
              </div>

              {/* Reps */}
              <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.repsLabel}</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={planned.repMin}
                    onChange={(e) => onUpdate({ repMin: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full text-center bg-transparent text-white text-xs font-semibold outline-none"
                  />
                  <span className="text-gray-600 text-xs">–</span>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={planned.repMax}
                    onChange={(e) => onUpdate({ repMax: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full text-center bg-transparent text-white text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Rest */}
              <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.restLabel}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdate({ restSeconds: Math.max(15, planned.restSeconds - 15) })}
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >−</button>
                  <span className="text-white text-xs font-semibold text-center flex-1">{formatRest(planned.restSeconds)}</span>
                  <button
                    onClick={() => onUpdate({ restSeconds: planned.restSeconds + 15 })}
                    className="text-gray-400 hover:text-white transition-colors text-xs"
                  >+</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
