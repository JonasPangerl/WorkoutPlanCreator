import React from 'react';
import type { MuscleGroup } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  compact?: boolean;
}

export const MuscleTags: React.FC<Props> = ({ primaryMuscles, secondaryMuscles, compact = false }) => {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? 'gap-0.5' : ''}`}>
      {primaryMuscles.map((m) => (
        <span
          key={m}
          className={`rounded-full font-medium ${compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'}`}
          style={{ background: '#f9731622', color: '#f97316', border: '1px solid #f9731644' }}
        >
          {t.muscles[m] ?? m}
        </span>
      ))}
      {secondaryMuscles.map((m) => (
        <span
          key={m}
          className={`rounded-full font-medium ${compact ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'}`}
          style={{ background: '#37415122', color: '#9ca3af', border: '1px solid #37415144' }}
        >
          {t.muscles[m] ?? m}
        </span>
      ))}
    </div>
  );
};
