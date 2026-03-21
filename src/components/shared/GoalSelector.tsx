import React from 'react';
import type { Goal } from '../../types';
import { GOAL_PRESETS } from '../../utils/presets';

interface Props {
  goal: Goal;
  onChange?: (goal: Goal) => void;
  size?: 'sm' | 'md';
}

const GOALS: Goal[] = ['power', 'strength', 'hypertrophy', 'endurance'];

export const GoalSelector: React.FC<Props> = ({ goal, onChange, size = 'md' }) => {
  const preset = GOAL_PRESETS[goal];

  if (!onChange) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
        style={{ background: `${preset.color}22`, color: preset.color, border: `1px solid ${preset.color}44` }}
      >
        {preset.label}
      </span>
    );
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {GOALS.map((g) => {
        const p = GOAL_PRESETS[g];
        const isActive = g === goal;
        return (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`rounded-full font-semibold transition-all ${
              size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
            }`}
            style={{
              background: isActive ? `${p.color}33` : 'transparent',
              color: isActive ? p.color : '#6b7280',
              border: `1px solid ${isActive ? p.color : '#374151'}`,
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};
