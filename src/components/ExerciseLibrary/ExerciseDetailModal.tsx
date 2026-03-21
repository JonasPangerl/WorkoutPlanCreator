import React from 'react';
import type { Exercise } from '../../types';
import { MuscleDiagram } from '../MuscleDiagram/MuscleDiagram';
import { GoalSelector } from '../shared/GoalSelector';
import { GOAL_PRESETS } from '../../utils/presets';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  exercise: Exercise;
  onClose: () => void;
  onDeleteCustom?: (id: string) => void;
}

export const ExerciseDetailModal: React.FC<Props> = ({ exercise, onClose, onDeleteCustom }) => {
  const preset = GOAL_PRESETS[exercise.defaultGoal];
  const { t } = useTranslation();
  const displayName = t.exerciseNames[exercise.id] ?? exercise.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl"
        style={{ background: '#13152a', borderColor: '#2a2d42' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              {exercise.isCustom && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {t.customBadge}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {exercise.categories.map((c) => t.exerciseCategories[c] ?? c).join(' · ')}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Body diagrams */}
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="w-28 h-56 mx-auto">
                <MuscleDiagram primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} view="front" />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{t.frontLabel}</span>
            </div>
            <div className="text-center">
              <div className="w-28 h-56 mx-auto">
                <MuscleDiagram primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} view="back" />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{t.backLabel}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#f97316' }} />
              <span className="text-gray-400">{t.primaryMusclesSection}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#f9731640' }} />
              <span className="text-gray-400">{t.secondaryMusclesSection}</span>
            </div>
          </div>

          {/* Muscles list */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{t.primaryMusclesSection}</p>
              <div className="space-y-1">
                {exercise.primaryMuscles.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f97316' }} />
                    <span className="text-sm text-white">{t.muscles[m] ?? m}</span>
                  </div>
                ))}
              </div>
            </div>
            {exercise.secondaryMuscles.length > 0 && (
              <div className="rounded-lg p-3" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{t.secondaryMusclesSection}</p>
                <div className="space-y-1">
                  {exercise.secondaryMuscles.map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                      <span className="text-sm text-gray-300">{t.muscles[m] ?? m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {exercise.description && (
            <p className="text-sm text-gray-400 leading-relaxed">{exercise.description}</p>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{t.defaultGoalSection}</span>
            <GoalSelector goal={exercise.defaultGoal} />
            <span className="text-xs text-gray-600">{t.goals[exercise.defaultGoal]?.description ?? preset.description}</span>
          </div>

          {exercise.isCustom && onDeleteCustom && (
            <button
              onClick={() => { onDeleteCustom(exercise.id); onClose(); }}
              className="w-full py-2 rounded-lg text-sm font-medium text-red-400 border border-red-900/40 hover:bg-red-900/20 transition-colors"
            >
              {t.deleteCustomBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
