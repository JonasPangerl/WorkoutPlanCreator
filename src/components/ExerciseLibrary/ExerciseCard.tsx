import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Exercise } from '../../types';
import { MuscleDiagram } from '../MuscleDiagram/MuscleDiagram';
import { MuscleTags } from '../shared/MuscleTags';
import { GOAL_PRESETS } from '../../utils/presets';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  exercise: Exercise;
  viewMode: 'compact' | 'detailed';
  onOpenDetail: (exercise: Exercise) => void;
}

const DIFFICULTY_COLORS = { beginner: '#22c55e', intermediate: '#f97316', advanced: '#ef4444' };
const TYPE_COLORS = { compound: '#3b82f6', isolation: '#a78bfa' };

export const ExerciseCard: React.FC<Props> = ({ exercise, viewMode, onOpenDetail }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: exercise.id,
    data: { type: 'exercise', exerciseId: exercise.id, defaultGoal: exercise.defaultGoal },
  });
  const { t } = useTranslation();

  const dragStyle: React.CSSProperties = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 999, opacity: 0.9 }
    : {};

  const preset = GOAL_PRESETS[exercise.defaultGoal];
  const diffColor = DIFFICULTY_COLORS[exercise.difficulty] ?? '#6b7280';
  const typeColor = TYPE_COLORS[exercise.exerciseType] ?? '#6b7280';
  const displayName = t.exerciseNames[exercise.id] ?? exercise.name;

  const diffAbbrev = exercise.difficulty === 'beginner' ? t.beginnerAbbrev
    : exercise.difficulty === 'intermediate' ? t.intermediateAbbrev
    : t.advancedAbbrev;

  if (viewMode === 'compact') {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...dragStyle,
          background: isDragging ? '#1f2235' : '#181a2a',
          borderColor: isDragging ? '#f97316' : '#2a2d42',
        }}
        className="rounded-lg border px-2.5 py-2 cursor-grab active:cursor-grabbing transition-all select-none hover:border-orange-500/40 hover:bg-white/5"
        {...listeners}
        {...attributes}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: preset.color }} />
            <span className="text-xs font-medium text-white leading-snug">{displayName}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {exercise.canBeUnilateral && (
              <span className="text-[9px] px-1 rounded" style={{ background: '#f9731618', color: '#f9731680' }}>1x</span>
            )}
            <span className="text-[9px] px-1.5 rounded-full font-medium" style={{ background: `${typeColor}18`, color: typeColor }}>
              {exercise.exerciseType === 'compound' ? t.compoundAbbrev : t.isolationAbbrev}
            </span>
            <span className="text-[9px] px-1.5 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor }}>
              {diffAbbrev}
            </span>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onOpenDetail(exercise); }}
              className="text-gray-600 hover:text-gray-300 transition-colors p-0.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        <MuscleTags primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} compact />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        background: isDragging ? '#1f2235' : '#181a2a',
        borderColor: isDragging ? '#f97316' : '#2a2d42',
      }}
      className="rounded-xl border overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none hover:border-orange-500/40"
      {...listeners}
      {...attributes}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex gap-1 flex-shrink-0">
            <div className="w-10 h-20 opacity-90">
              <MuscleDiagram primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} view="front" compact />
            </div>
            <div className="w-10 h-20 opacity-90">
              <MuscleDiagram primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} view="back" compact />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-sm font-semibold text-white leading-tight flex-1">{displayName}</span>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onOpenDetail(exercise); }}
                className="text-gray-500 hover:text-orange-400 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1 mb-2 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}>
                {exercise.exerciseType === 'compound' ? t.compoundLabel : t.isolationLabel}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${diffColor}18`, color: diffColor, border: `1px solid ${diffColor}30` }}>
                {exercise.difficulty === 'beginner' ? t.beginnerLabel : exercise.difficulty === 'intermediate' ? t.intermediateLabel : t.advancedLabel}
              </span>
              {exercise.canBeUnilateral && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#f9731618', color: '#f97316', border: '1px solid #f9731630' }}>
                  {t.unilateralTitle.split(' ')[0].toLowerCase()}
                </span>
              )}
            </div>
            {exercise.description && (
              <p className="text-[10px] text-gray-500 mb-2 leading-relaxed line-clamp-2">{exercise.description}</p>
            )}
            <MuscleTags primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} compact />
          </div>
        </div>
      </div>
    </div>
  );
};
