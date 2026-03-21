import React from 'react';
import type { TrainingLoad } from '../../utils/trainingLoad';
import { loadColor, loadLabel } from '../../utils/trainingLoad';

interface Props {
  load: TrainingLoad;
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

export const DayLoadBar: React.FC<Props> = ({ load }) => {
  if (load.overall === 0) return null;

  const overall = load.overall;
  const color = loadColor(overall);
  const label = loadLabel(overall);
  const isHigh = overall >= 80;
  const isWarning = overall >= 60;

  return (
    <div
      className="rounded-xl px-3 py-2 mb-2 flex-shrink-0"
      style={{ background: '#0d0f1c', border: `1px solid ${isHigh ? '#ef444430' : isWarning ? '#f9731630' : '#1e2035'}` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Training Load</span>
          {isHigh && (
            <span
              className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 rounded-full animate-pulse"
              style={{ background: '#ef444422', color: '#ef4444' }}
            >
              ⚠ HIGH
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
            {label}
          </span>
        </div>
      </div>

      {/* Three dimension bars */}
      <div className="space-y-1">
        <Dim
          label="CNS"
          value={load.cns}
          color={loadColor(load.cns)}
          tooltip="Central Nervous System load — heavy compound lifts and low-rep power work drain the CNS most. High CNS fatigue needs more recovery days."
        />
        <Dim
          label="Muscle"
          value={load.muscle}
          color={loadColor(load.muscle)}
          tooltip="Muscle damage / volume fatigue — driven by total reps × sets × muscle size. High values mean more soreness and longer tissue repair."
        />
        <Dim
          label="Mental"
          value={load.mental}
          color={loadColor(load.mental)}
          tooltip="Mental / cognitive load — long sessions and many compound movements require sustained focus and raise overall fatigue."
        />
      </div>
    </div>
  );
};
