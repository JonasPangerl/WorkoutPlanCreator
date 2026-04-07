import React, { useState, useMemo } from 'react';
import type { Exercise, Goal, ExerciseType, Difficulty } from '../../types';
import { EXERCISES, EXERCISE_CATEGORIES } from '../../data/exercises';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { CustomExerciseModal } from './CustomExerciseModal';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  customExercises: Exercise[];
  onAddCustom: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => void;
  onDeleteCustom: (id: string) => void;
}

const GOAL_COLORS: Record<string, string> = {
  power: '#7c3aed',
  strength: '#ef4444',
  hypertrophy: '#f97316',
  endurance: '#22c55e',
  all: '#6b7280',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f97316',
  advanced: '#ef4444',
  all: '#6b7280',
};

function FilterPill<T extends string>({
  options,
  value,
  onChange,
  colorMap,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<string, string>;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => {
        const isActive = opt.value === value;
        const color = colorMap?.[opt.value] ?? '#6b7280';
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: isActive ? `${color}22` : '#1a1d2e',
              color: isActive ? color : '#6b7280',
              border: `1px solid ${isActive ? `${color}55` : '#2a2d42'}`,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const ExerciseLibrary: React.FC<Props> = ({ customExercises, onAddCustom, onDeleteCustom }) => {
  const [libraryTab, setLibraryTab] = useState<'muscle' | 'endurance' | 'plyometric' | 'breakWarmup'>('muscle');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [goalFilter, setGoalFilter] = useState<Goal | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<Difficulty | 'all'>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { t } = useTranslation();

  const allExercises = useMemo(() => [...EXERCISES, ...customExercises], [customExercises]);

  // Build translated filter arrays inside render so they re-compute on locale change
  const goalFilters: { value: Goal | 'all'; label: string }[] = [
    { value: 'all',         label: t.allGoalsFilter },
    { value: 'power',       label: t.goals['power']?.label ?? 'Power' },
    { value: 'strength',    label: t.goals['strength']?.label ?? 'Strength' },
    { value: 'hypertrophy', label: t.goals['hypertrophy']?.label ?? 'Hypertrophy' },
    { value: 'endurance',   label: t.goals['endurance']?.label ?? 'Endurance' },
  ];

  const typeFilters: { value: ExerciseType | 'all'; label: string }[] = [
    { value: 'all',       label: t.allTypesFilter },
    { value: 'compound',  label: t.compoundLabel },
    { value: 'isolation', label: t.isolationLabel },
  ];

  const levelFilters: { value: Difficulty | 'all'; label: string }[] = [
    { value: 'all',          label: t.allLevelsFilter },
    { value: 'beginner',     label: t.beginnerLabel },
    { value: 'intermediate', label: t.intermediateLabel },
    { value: 'advanced',     label: t.advancedLabel },
  ];

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      if (selectedCategory !== 'All' && !ex.categories.includes(selectedCategory)) return false;
      if (libraryTab === 'muscle' && (ex.exerciseType === 'cardio' || ex.exerciseType === 'plyometric' || ex.exerciseType === 'break' || ex.exerciseType === 'warmup')) return false;
      if (libraryTab === 'endurance' && ex.exerciseType !== 'cardio') return false;
      if (libraryTab === 'plyometric' && ex.exerciseType !== 'plyometric') return false;
      if (libraryTab === 'breakWarmup' && ex.exerciseType !== 'break' && ex.exerciseType !== 'warmup') return false;
      if (search) {
        const q = search.toLowerCase();
        const nameEN = ex.name.toLowerCase();
        const nameDE = (t.exerciseNames[ex.id] ?? '').toLowerCase();
        if (!nameEN.includes(q) && !nameDE.includes(q)) return false;
      }
      if (goalFilter !== 'all') {
        const goalMatch =
          goalFilter === 'power'
            ? ex.defaultGoal === 'power' || ex.defaultGoal === 'strength'
            : ex.defaultGoal === goalFilter;
        if (!goalMatch) return false;
      }
      if (typeFilter !== 'all' && ex.exerciseType !== typeFilter) return false;
      if (levelFilter !== 'all' && ex.difficulty !== levelFilter) return false;
      return true;
    });
  }, [allExercises, libraryTab, selectedCategory, search, goalFilter, typeFilter, levelFilter, t]);

  const categories = useMemo(() => {
    if (libraryTab !== 'muscle') return ['All'];
    const customCats = customExercises.flatMap((e) => e.categories);
    const base = EXERCISE_CATEGORIES.filter((c) => c !== 'All');
    const extra = [...new Set(customCats)].filter((c) => !base.includes(c));
    return ['All', ...base, ...extra];
  }, [customExercises, libraryTab]);

  const hasActiveFilters = goalFilter !== 'all' || typeFilter !== 'all' || levelFilter !== 'all' || selectedCategory !== 'All' || search;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b" style={{ borderColor: '#1e2035' }}>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.exerciseLibraryTitle}</h2>
          <div className="flex items-center gap-1.5">
            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#2a2d42' }}>
              <button
                onClick={() => setViewMode('compact')}
                className="px-2 py-1.5 transition-colors"
                style={{ background: viewMode === 'compact' ? '#f9731622' : 'transparent', color: viewMode === 'compact' ? '#f97316' : '#6b7280' }}
                title={t.compactViewTooltip}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className="px-2 py-1.5 transition-colors"
                style={{ background: viewMode === 'detailed' ? '#f9731622' : 'transparent', color: viewMode === 'detailed' ? '#f97316' : '#6b7280' }}
                title={t.detailedViewTooltip}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: '#f9731620', color: '#f97316', border: '1px solid #f9731640' }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t.newExerciseBtn}
            </button>
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden border mb-2" style={{ borderColor: '#2a2d42' }}>
          <button onClick={() => setLibraryTab('muscle')} className="flex-1 py-1 text-[10px] font-semibold" style={{ background: libraryTab === 'muscle' ? '#f9731622' : 'transparent', color: libraryTab === 'muscle' ? '#f97316' : '#6b7280' }}>{t.libraryTabMuscle}</button>
          <button onClick={() => setLibraryTab('endurance')} className="flex-1 py-1 text-[10px] font-semibold" style={{ background: libraryTab === 'endurance' ? '#0ea5e922' : 'transparent', color: libraryTab === 'endurance' ? '#38bdf8' : '#6b7280' }}>{t.libraryTabEndurance}</button>
          <button onClick={() => setLibraryTab('plyometric')} className="flex-1 py-1 text-[10px] font-semibold" style={{ background: libraryTab === 'plyometric' ? '#f59e0b22' : 'transparent', color: libraryTab === 'plyometric' ? '#fbbf24' : '#6b7280' }}>{t.libraryTabPlyometric}</button>
          <button onClick={() => setLibraryTab('breakWarmup')} className="flex-1 py-1 text-[10px] font-semibold" style={{ background: libraryTab === 'breakWarmup' ? '#22c55e22' : 'transparent', color: libraryTab === 'breakWarmup' ? '#4ade80' : '#6b7280' }}>{t.libraryTabBreakWarmup}</button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none transition-colors"
            style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter — wrapping pills */}
        {libraryTab === 'muscle' && (
        <div className="flex gap-1 flex-wrap mb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: selectedCategory === cat ? '#f9731622' : '#1a1d2e',
                color: selectedCategory === cat ? '#f97316' : '#6b7280',
                border: `1px solid ${selectedCategory === cat ? '#f9731444' : '#2a2d42'}`,
              }}
            >
              {t.exerciseCategories[cat] ?? cat}
            </button>
          ))}
        </div>
        )}

        {/* ── Sub-filters ── */}
        {libraryTab === 'muscle' && (
        <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: '#1e2035' }}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider w-8 flex-shrink-0">{t.goals['strength']?.label.slice(0, 4) ?? 'Goal'}</span>
            <FilterPill options={goalFilters} value={goalFilter} onChange={setGoalFilter} colorMap={GOAL_COLORS} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider w-8 flex-shrink-0">{t.typeLabel}</span>
            <FilterPill
              options={typeFilters}
              value={typeFilter}
              onChange={setTypeFilter}
              colorMap={{ compound: '#3b82f6', isolation: '#a78bfa', cardio: '#0ea5e9', plyometric: '#f59e0b', all: '#6b7280' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider w-8 flex-shrink-0">{t.difficultyLabel.slice(0, 4)}</span>
            <FilterPill options={levelFilters} value={levelFilter} onChange={setLevelFilter} colorMap={LEVEL_COLORS} />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setGoalFilter('all'); setTypeFilter('all'); setLevelFilter('all'); }}
              className="text-[9px] text-gray-600 hover:text-orange-400 transition-colors mt-0.5"
            >
              {t.clearFilters}
            </button>
          )}
        </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p className="text-sm">{t.noExercisesFound}</p>
            <button onClick={() => setShowCustomModal(true)} className="mt-2 text-xs text-orange-500 hover:text-orange-400 underline">
              {t.createCustomLink}
            </button>
          </div>
        ) : (
          filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              viewMode={viewMode}
              onOpenDetail={setDetailExercise}
            />
          ))
        )}
      </div>

      <div className="flex-shrink-0 px-3 py-1.5 border-t text-[10px] text-gray-700" style={{ borderColor: '#1e2035' }}>
        {t.exercisesCountFmt.replace('{n}', String(filtered.length)).replace('{m}', String(allExercises.length))}
      </div>

      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
          onDeleteCustom={detailExercise.isCustom ? onDeleteCustom : undefined}
        />
      )}
      {showCustomModal && (
        <CustomExerciseModal
          onSave={onAddCustom}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
};
