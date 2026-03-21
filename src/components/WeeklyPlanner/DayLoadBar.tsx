import React from 'react';
import type { TrainingLoad } from '../../utils/trainingLoad';
import { loadColor } from '../../utils/trainingLoad';
import type { FitnessLevel } from '../../types';
import { FITNESS_LEVEL_MULTIPLIER } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  load: TrainingLoad;
  fitnessLevel: FitnessLevel;
}

interface DimProps {
  label: string;
  value: number;
  color: string;
  tooltip: string;
}

const Dim: React.FC<DimProps> = ({ label, value, color, tooltip }) => (
  <div className="flex items-center gap-1.5" title={tooltip}>
    <span className="text-[9px] font-medium w-10 flex-shrink-0" style={{ color: '#6b7280' }}>
      {label}
    </span>
    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: '#1e2035' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
    <span className="text-[9px] font-semibold w-5 text-right flex-shrink-0" style={{ color }}>
      {value}
    </span>
  </div>
);

export const DayLoadBar: React.FC<Props> = ({ load, fitnessLevel }) => {
  const { t } = useTranslation();

  if (load.overall === 0) return null;

  const multiplier = FITNESS_LEVEL_MULTIPLIER[fitnessLevel];

  // Apply multiplier and cap at 100
  const scale = (v: number) => Math.min(100, Math.round(v * multiplier));

  const overall = scale(load.overall);
  const cns     = scale(load.cns);
  const muscle  = scale(load.muscle);
  const mental  = scale(load.mental);

  const color = loadColor(overall);
  const isHigh = overall >= 80;
  const isWarning = overall >= 60;

  const loadLabelText =
    overall < 30 ? t.loadLow :
    overall < 60 ? t.loadModerate :
    overall < 80 ? t.loadHigh :
    t.loadVeryHigh;

  return (
    <div
      className="rounded-xl px-3 py-2 mb-2 flex-shrink-0"
      style={{ background: '#0d0f1c', border: `1px solid ${isHigh ? '#ef444430' : isWarning ? '#f9731630' : '#1e2035'}` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t.trainingLoad}</span>
          {isHigh && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 rounded-full animate-pulse"
              style={{ background: '#ef444422', color: '#ef4444' }}
            >
              {t.loadHighWarn}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 rounded-full" style={{ width: 40, background: '#1e2035' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${overall}%`, background: color }}
            />
          </div>
          <span className="text-[10px] font-bold" style={{ color }}>
            {loadLabelText}
          </span>
        </div>
      </div>

      {/* Three dimension bars */}
      <div className="space-y-1">
        <Dim label={t.cnsLabel}    value={cns}    color={loadColor(cns)}    tooltip={t.cnsTooltip} />
        <Dim label={t.muscleLabel} value={muscle} color={loadColor(muscle)} tooltip={t.muscleTooltip} />
        <Dim label={t.mentalLabel} value={mental} color={loadColor(mental)} tooltip={t.mentalTooltip} />
      </div>
    </div>
  );
};
