import React, { useState } from 'react';
import type { Exercise, MuscleGroup, ExerciseType, Difficulty } from '../../types';
import type { Goal } from '../../types';
import { MUSCLE_CATEGORIES } from '../../types';
import { GOAL_PRESETS } from '../../utils/presets';
import { EXERCISE_CATEGORIES } from '../../data/exercises';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  onSave: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;
  onClose: () => void;
}

const GOALS: Goal[] = ['power', 'strength', 'hypertrophy', 'endurance'];
const TYPES: ExerciseType[] = ['compound', 'isolation'];
const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const DIFF_COLORS: Record<Difficulty, string> = { beginner: '#22c55e', intermediate: '#f97316', advanced: '#ef4444' };
const SELECTABLE_CATEGORIES = EXERCISE_CATEGORIES.filter((c) => c !== 'All');

export const CustomExerciseModal: React.FC<Props> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>(['Custom']);
  const [description, setDescription] = useState('');
  const [primaryMuscles, setPrimaryMuscles] = useState<MuscleGroup[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [defaultGoal, setDefaultGoal] = useState<Goal>('hypertrophy');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('isolation');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [canBeUnilateral, setCanBeUnilateral] = useState(false);
  const [customCat, setCustomCat] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addCustomCategory = () => {
    const trimmed = customCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev.filter((c) => c !== 'Custom'), trimmed]);
    }
    setCustomCat('');
  };

  const toggleMuscle = (
    muscle: MuscleGroup,
    list: MuscleGroup[],
    setList: (v: MuscleGroup[]) => void,
    otherList: MuscleGroup[],
    setOtherList: (v: MuscleGroup[]) => void
  ) => {
    if (list.includes(muscle)) {
      setList(list.filter((m) => m !== muscle));
    } else {
      setOtherList(otherList.filter((m) => m !== muscle));
      setList([...list, muscle]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) { setError(t.validationNameRequired); return; }
    if (primaryMuscles.length === 0) { setError(t.validationPrimaryRequired); return; }
    const finalCategories = categories.length > 0 ? categories : ['Custom'];
    onSave({ name: name.trim(), categories: finalCategories, description, primaryMuscles, secondaryMuscles, defaultGoal, exerciseType, difficulty, canBeUnilateral });
    onClose();
  };

  const getMuscleStatus = (m: MuscleGroup): 'primary' | 'secondary' | 'none' => {
    if (primaryMuscles.includes(m)) return 'primary';
    if (secondaryMuscles.includes(m)) return 'secondary';
    return 'none';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl border max-w-lg w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        style={{ background: '#13152a', borderColor: '#2a2d42' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{t.createCustomTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-lg px-3 py-2 text-sm text-red-400 bg-red-900/20 border border-red-900/40">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.exerciseNameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder={t.exerciseNamePlaceholder}
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/60 transition-colors"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.categoriesLabel}</label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {SELECTABLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all"
                    style={{
                      background: categories.includes(cat) ? '#f9731622' : '#1a1d2e',
                      color: categories.includes(cat) ? '#f97316' : '#6b7280',
                      border: `1px solid ${categories.includes(cat) ? '#f9731444' : '#2a2d42'}`,
                    }}
                  >{t.exerciseCategories[cat] ?? cat}</button>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }}
                  placeholder={t.customCategoryPlaceholder}
                  className="flex-1 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 outline-none"
                  style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}
                />
                <button
                  onClick={addCustomCategory}
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{ background: '#1a1d2e', color: '#f97316', border: '1px solid #2a2d42' }}
                >+</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.defaultGoalLabel}</label>
              <div className="flex gap-1">
                {GOALS.map((g) => {
                  const p = GOAL_PRESETS[g];
                  return (
                    <button
                      key={g}
                      onClick={() => setDefaultGoal(g)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: defaultGoal === g ? `${p.color}33` : '#1a1d2e',
                        color: defaultGoal === g ? p.color : '#6b7280',
                        border: `1px solid ${defaultGoal === g ? p.color : '#2a2d42'}`,
                      }}
                    >
                      {t.goals[g]?.label ?? p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.descriptionLabel}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-orange-500/60 transition-colors"
              style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.typeLabel}</label>
              <div className="flex gap-1">
                {TYPES.map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setExerciseType(tp)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: exerciseType === tp ? (tp === 'compound' ? '#3b82f622' : '#a78bfa22') : '#1a1d2e',
                      color: exerciseType === tp ? (tp === 'compound' ? '#3b82f6' : '#a78bfa') : '#6b7280',
                      border: `1px solid ${exerciseType === tp ? (tp === 'compound' ? '#3b82f644' : '#a78bfa44') : '#2a2d42'}`,
                    }}
                  >{tp === 'compound' ? t.compoundLabel : t.isolationLabel}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{t.difficultyLabel}</label>
              <div className="flex gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      background: difficulty === d ? `${DIFF_COLORS[d]}22` : '#1a1d2e',
                      color: difficulty === d ? DIFF_COLORS[d] : '#6b7280',
                      border: `1px solid ${difficulty === d ? `${DIFF_COLORS[d]}44` : '#2a2d42'}`,
                    }}
                  >
                    {d === 'beginner' ? t.beginnerLabel : d === 'intermediate' ? t.intermediateLabel : t.advancedLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
            <div>
              <p className="text-xs text-white font-medium">{t.unilateralTitle}</p>
              <p className="text-[10px] text-gray-600">{t.unilateralSubLabel}</p>
            </div>
            <button
              onClick={() => setCanBeUnilateral(!canBeUnilateral)}
              className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
              style={{ background: canBeUnilateral ? '#f97316' : '#374151' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: canBeUnilateral ? '1.25rem' : '0.125rem' }}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              {t.musclesInstruction}
            </label>
            <div className="space-y-3">
              {Object.entries(MUSCLE_CATEGORIES).map(([cat, muscles]) => (
                <div key={cat}>
                  <p className="text-xs text-gray-600 mb-1.5">{t.muscleCategories[cat] ?? cat}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {muscles.map((m) => {
                      const status = getMuscleStatus(m);
                      return (
                        <button
                          key={m}
                          onClick={() => {
                            if (status === 'none') {
                              toggleMuscle(m, primaryMuscles, setPrimaryMuscles, secondaryMuscles, setSecondaryMuscles);
                            } else if (status === 'primary') {
                              setPrimaryMuscles(primaryMuscles.filter((x) => x !== m));
                              setSecondaryMuscles([...secondaryMuscles, m]);
                            } else {
                              setSecondaryMuscles(secondaryMuscles.filter((x) => x !== m));
                            }
                            setError('');
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                          style={{
                            background: status === 'primary' ? '#f9731622' : status === 'secondary' ? '#37415133' : '#1a1d2e',
                            color: status === 'primary' ? '#f97316' : status === 'secondary' ? '#9ca3af' : '#4b5563',
                            border: `1px solid ${status === 'primary' ? '#f9731644' : status === 'secondary' ? '#37415166' : '#2a2d42'}`,
                          }}
                        >
                          {t.muscles[m] ?? m}
                          {status === 'primary' && ' ●'}
                          {status === 'secondary' && ' ○'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }}
            >
              {t.saveExerciseBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
