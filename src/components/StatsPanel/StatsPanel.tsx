import React from 'react';
import type { MuscleGroup } from '../../types';
import { MUSCLE_CATEGORIES } from '../../types';
import type { MuscleVolume } from '../../utils/calculations';
import { CATEGORY_COLORS } from '../../utils/categoryColors';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  volume: Record<string, MuscleVolume>;
  title?: string;
}

const WEEKLY_TARGETS: Partial<Record<MuscleGroup, { min: number; max: number }>> = {
  chest: { min: 10, max: 20 },
  lats: { min: 10, max: 20 },
  traps: { min: 10, max: 20 },
  rearDelt: { min: 10, max: 20 },
  frontDelt: { min: 8, max: 16 },
  sideDelt: { min: 10, max: 20 },
  biceps: { min: 10, max: 20 },
  triceps: { min: 10, max: 20 },
  quads: { min: 10, max: 20 },
  hamstrings: { min: 10, max: 20 },
  glutes: { min: 10, max: 20 },
  abs: { min: 8, max: 16 },
  obliques: { min: 6, max: 14 },
  abductors: { min: 6, max: 14 },
  adductors: { min: 6, max: 14 },
};

export const StatsPanel: React.FC<Props> = ({ volume, title }) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t.weeklyVolumeTitle;
  const allMuscles = Object.values(MUSCLE_CATEGORIES).flat() as MuscleGroup[];

  const maxSets = Math.max(
    ...allMuscles.map((m) => (volume[m]?.primarySets ?? 0) + (volume[m]?.secondarySets ?? 0)),
    10
  );

  const getCategoryColor = (muscle: MuscleGroup): string => {
    for (const [cat, muscles] of Object.entries(MUSCLE_CATEGORIES)) {
      if (muscles.includes(muscle)) return CATEGORY_COLORS[cat] ?? '#6b7280';
    }
    return '#6b7280';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{resolvedTitle}</h3>

      {Object.entries(MUSCLE_CATEGORIES).map(([category, muscles]) => (
        <div key={category}>
          <p className="text-xs mb-2 font-medium" style={{ color: CATEGORY_COLORS[category] ?? '#6b7280' }}>
            {t.muscleCategories[category] ?? category}
          </p>
          <div className="space-y-2">
            {(muscles as MuscleGroup[]).map((muscle) => {
              const vol = volume[muscle] ?? { primarySets: 0, secondarySets: 0 };
              const total = vol.primarySets + vol.secondarySets;
              const primaryPct = (vol.primarySets / maxSets) * 100;
              const secondaryPct = (vol.secondarySets / maxSets) * 100;
              const target = WEEKLY_TARGETS[muscle];
              const color = getCategoryColor(muscle);
              const isUntrained = total === 0;

              return (
                <div key={muscle}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${isUntrained ? 'text-gray-700' : 'text-gray-400'}`}>
                      {t.muscles[muscle] ?? muscle}
                    </span>
                    <div className="flex items-center gap-2">
                      {vol.secondarySets > 0 && (
                        <span className="text-[10px] text-gray-600">+{vol.secondarySets}s</span>
                      )}
                      <span className={`text-xs font-semibold min-w-[1.5rem] text-right ${isUntrained ? 'text-gray-700' : 'text-white'}`}>
                        {vol.primarySets}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#1a1d2e' }}>
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${primaryPct}%`,
                        background: isUntrained ? '#1f2235' : color,
                        opacity: isUntrained ? 0.5 : 1,
                      }}
                    />
                    {vol.secondarySets > 0 && (
                      <div
                        className="absolute top-0 h-full rounded-full transition-all duration-300"
                        style={{
                          left: `${primaryPct}%`,
                          width: `${secondaryPct}%`,
                          background: color,
                          opacity: 0.35,
                        }}
                      />
                    )}
                    {target && (
                      <>
                        <div
                          className="absolute top-0 w-px h-full opacity-40"
                          style={{ left: `${(target.min / maxSets) * 100}%`, background: color }}
                        />
                        <div
                          className="absolute top-0 w-px h-full opacity-20"
                          style={{ left: `${(target.max / maxSets) * 100}%`, background: color }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="pt-3 border-t space-y-1.5" style={{ borderColor: '#1e2035' }}>
        <p className="text-xs text-gray-600 font-medium mb-2">{t.legendTitle}</p>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-2 rounded-full" style={{ background: '#3b82f6' }} />
          <span>{t.primarySets}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-2 rounded-full opacity-35" style={{ background: '#3b82f6' }} />
          <span>{t.secondarySets}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-px h-3 bg-gray-500" />
          <span>{t.rangeMarkers}</span>
        </div>
      </div>
    </div>
  );
};
