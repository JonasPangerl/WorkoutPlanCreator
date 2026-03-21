import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TrainingDay, PlannedExercise, Exercise } from '../../types';
import type { Goal, FitnessLevel } from '../../types';
import { calcDayDurationSeconds, formatDuration } from '../../utils/calculations';
import { calcTrainingLoad } from '../../utils/trainingLoad';
import { PlannedExerciseRow } from './PlannedExerciseRow';
import { DayLoadBar } from './DayLoadBar';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  day: TrainingDay;
  allExercises: Exercise[];
  onUpdateLabel: (label: string) => void;
  onRemoveExercise: (instanceId: string) => void;
  onUpdateExercise: (instanceId: string, updates: Partial<PlannedExercise>) => void;
  onChangeGoal: (instanceId: string, goal: Goal) => void;
  onHoverExercise: (exercise: Exercise | null) => void;
  colorMode: boolean;
  compactMode: boolean;
  fitnessLevel: FitnessLevel;
}

export const TrainingDayColumn: React.FC<Props> = ({
  day,
  allExercises,
  onUpdateLabel,
  onRemoveExercise,
  onUpdateExercise,
  onChangeGoal,
  onHoverExercise,
  colorMode,
  compactMode,
  fitnessLevel,
}) => {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(day.label);
  const { t } = useTranslation();

  const { isOver, setNodeRef } = useDroppable({
    id: day.id,
    data: { type: 'day', dayId: day.id },
  });

  const totalSeconds = calcDayDurationSeconds(day);
  const exerciseIds = day.exercises.map((e) => e.instanceId);
  const load = calcTrainingLoad(day, allExercises);

  return (
    <div
      className="flex flex-col h-full rounded-2xl border overflow-hidden transition-all"
      style={{
        background: '#0f1117',
        borderColor: isOver ? '#f97316' : '#1e2035',
        boxShadow: isOver ? '0 0 0 1px #f97316, 0 0 20px #f9731620' : undefined,
        minWidth: 0,
      }}
    >
      {/* Day header */}
      <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#1e2035' }}>
        {editingLabel ? (
          <input
            autoFocus
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={() => { onUpdateLabel(labelValue); setEditingLabel(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateLabel(labelValue); setEditingLabel(false); } }}
            className="w-full bg-transparent text-white text-sm font-semibold outline-none border-b border-orange-500 pb-0.5"
          />
        ) : (
          <button
            onClick={() => { setLabelValue(day.label); setEditingLabel(true); }}
            className="text-sm font-semibold text-white hover:text-orange-400 transition-colors text-left w-full truncate"
          >
            {day.label}
          </button>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600">
            {day.exercises.length === 1 ? t.exercisesSingular : t.exercisesPlural.replace('{n}', String(day.exercises.length))}
          </span>
          {totalSeconds > 0 && (
            <span className="text-xs font-medium" style={{ color: '#f97316' }}>
              ~{formatDuration(totalSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ minHeight: 120 }}
      >
        {/* Training load indicator */}
        <DayLoadBar load={load} fitnessLevel={fitnessLevel} />
        <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
          {day.exercises.map((planned) => {
            const exercise = allExercises.find((e) => e.id === planned.exerciseId);
            if (!exercise) return null;
            return (
              <PlannedExerciseRow
                key={planned.instanceId}
                planned={planned}
                exercise={exercise}
                onRemove={() => onRemoveExercise(planned.instanceId)}
                onUpdate={(updates) => onUpdateExercise(planned.instanceId, updates)}
                onGoalChange={(goal) => onChangeGoal(planned.instanceId, goal)}
                onHover={onHoverExercise}
                colorMode={colorMode}
                compactMode={compactMode}
              />
            );
          })}
        </SortableContext>

        {day.exercises.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed transition-all"
            style={{
              borderColor: isOver ? '#f97316' : '#1e2035',
              background: isOver ? '#f9731608' : 'transparent',
            }}
          >
            <svg className="w-8 h-8 mb-2" style={{ color: isOver ? '#f97316' : '#374151' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-xs" style={{ color: isOver ? '#f97316' : '#374151' }}>
              {t.dropHere}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
