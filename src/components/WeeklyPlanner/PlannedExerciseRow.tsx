import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PlannedExercise, Exercise, CardioActivity } from '../../types';
import type { Goal } from '../../types';
import { calcExerciseDurationSeconds, formatDuration } from '../../utils/calculations';
import { MuscleTags } from '../shared/MuscleTags';
import { GoalSelector } from '../shared/GoalSelector';
import { CATEGORY_COLORS } from '../../utils/categoryColors';
import { GOAL_PRESETS, CARDIO_PRESETS } from '../../utils/presets';
import { useTranslation } from '../../contexts/LanguageContext';

interface Props {
  planned: PlannedExercise;
  exercise: Exercise;
  onRemove: () => void;
  onUpdate: (updates: Partial<PlannedExercise>) => void;
  onGoalChange: (goal: Goal) => void;
  onHover: (exercise: Exercise | null) => void;
  colorMode: boolean;
  compactMode: boolean;
  maxHeartRate: number;
}

export const PlannedExerciseRow: React.FC<Props> = ({ planned, exercise, onRemove, onUpdate, onGoalChange, onHover, colorMode, compactMode, maxHeartRate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: planned.instanceId });
  const { t } = useTranslation();
  const duration = calcExerciseDurationSeconds(planned);
  const displayName = t.exerciseNames[exercise.id] ?? exercise.name;
  const blockColor = CATEGORY_COLORS[exercise.categories?.[0]] ?? '#374151';
  const cardioPreset = planned.cardioPreset ?? 'zone2';
  const hrMinPct = planned.targetHrMinPercent ?? CARDIO_PRESETS[cardioPreset].hrMin;
  const hrMaxPct = planned.targetHrMaxPercent ?? CARDIO_PRESETS[cardioPreset].hrMax;
  const hrBpm = `${Math.round((hrMinPct / 100) * maxHeartRate)}-${Math.round((hrMaxPct / 100) * maxHeartRate)} bpm`;

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border group transition-all"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, background: colorMode ? `${blockColor}35` : '#13152a', borderColor: colorMode ? `${blockColor}90` : '#2a2d42', borderLeftWidth: colorMode ? 3 : 1, borderLeftColor: colorMode ? blockColor : '#2a2d42' }}
      onMouseEnter={() => onHover(exercise)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="p-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <button className="text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" {...attributes} {...listeners}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 100-4 2 2 0 000 4zM8 14a2 2 0 100-4 2 2 0 000 4zM8 22a2 2 0 100-4 2 2 0 000 4zM16 6a2 2 0 100-4 2 2 0 000 4zM16 14a2 2 0 100-4 2 2 0 000 4zM16 22a2 2 0 100-4 2 2 0 000 4z" /></svg>
          </button>
          <div className="flex-1 min-w-0"><span className="text-xs font-semibold truncate block" style={{ color: colorMode ? blockColor : 'white' }}>{displayName}</span></div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-gray-600">{formatDuration(duration)}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold leading-none" style={{ background: planned.blockType === 'strength' || planned.blockType === 'plyometric' ? `${GOAL_PRESETS[planned.goal].color}25` : planned.blockType === 'break' ? '#22c55e25' : planned.blockType === 'warmupSets' ? '#84cc1625' : '#0ea5e925', color: planned.blockType === 'strength' || planned.blockType === 'plyometric' ? GOAL_PRESETS[planned.goal].color : planned.blockType === 'break' ? '#4ade80' : planned.blockType === 'warmupSets' ? '#a3e635' : '#38bdf8' }}>
              {planned.blockType === 'strength' || planned.blockType === 'plyometric' ? (t.goalAbbrev[planned.goal] ?? planned.goal.slice(0, 3).toUpperCase()) : planned.blockType === 'break' ? 'BREAK' : planned.blockType === 'warmupSets' ? 'WARMUP' : (t.cardioPresetLabels[cardioPreset] ?? cardioPreset)}
            </span>
            <button onClick={onRemove} className="text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="mb-1.5"><MuscleTags primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} compact /></div>

        {!compactMode && (
          <>
            {(planned.blockType === 'strength' || planned.blockType === 'plyometric' || planned.blockType === 'warmupSets') ? (
              <>
                <div className="flex items-center justify-between mb-2.5">
                  {planned.blockType !== 'warmupSets' ? <GoalSelector goal={planned.goal} onChange={onGoalChange} size="sm" /> : <span className="text-[10px] text-lime-300 font-semibold">Warmup sets (time only)</span>}
                  {exercise.canBeUnilateral && <button onClick={() => onUpdate({ isUnilateral: !planned.isUnilateral })} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all" style={{ background: planned.isUnilateral ? '#f9731622' : '#1a1d2e', color: planned.isUnilateral ? '#f97316' : '#4b5563', border: `1px solid ${planned.isUnilateral ? '#f9731644' : '#2a2d42'}` }} title={t.unilateralTooltip}><span>1×</span><span>{planned.isUnilateral ? t.unilateralOn : t.unilateralOff}</span></button>}
                </div>
                <div className={`grid gap-2 ${planned.blockType === 'warmupSets' ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  <div className="rounded-lg p-2 text-center" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}><p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">{t.setsLabel}</p><div className="flex items-center justify-center gap-1.5"><button onClick={() => onUpdate({ sets: Math.max(1, planned.sets - 1) })} className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center justify-center">−</button><span className="text-white font-semibold text-sm w-5 text-center">{planned.sets}</span><button onClick={() => onUpdate({ sets: planned.sets + 1 })} className="w-5 h-5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center justify-center">+</button></div></div>
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}><p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.repsLabel}</p><div className="flex items-center gap-1"><input type="number" min={1} max={99} value={planned.repMin} onChange={(e) => onUpdate({ repMin: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full text-center bg-transparent text-white text-xs font-semibold outline-none" /><span className="text-gray-600 text-xs">–</span><input type="number" min={1} max={99} value={planned.repMax} onChange={(e) => onUpdate({ repMax: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full text-center bg-transparent text-white text-xs font-semibold outline-none" /></div></div>
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}><p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.restLabel}</p><div className="flex items-center gap-1"><button onClick={() => onUpdate({ restSeconds: Math.max(15, planned.restSeconds - 15) })} className="text-gray-400 hover:text-white transition-colors text-xs">−</button><span className="text-white text-xs font-semibold text-center flex-1">{planned.restSeconds}s</span><button onClick={() => onUpdate({ restSeconds: planned.restSeconds + 15 })} className="text-gray-400 hover:text-white transition-colors text-xs">+</button></div></div>
                  {planned.blockType !== 'warmupSets' && <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}><p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.rirLabel}</p><div className="flex items-center gap-1"><button onClick={() => onUpdate({ rir: Math.max(0, planned.rir - 1) })} className="text-gray-400 hover:text-white transition-colors text-xs">−</button><span className="text-white text-xs font-semibold text-center flex-1">{planned.rir}</span><button onClick={() => onUpdate({ rir: Math.min(6, planned.rir + 1) })} className="text-gray-400 hover:text-white transition-colors text-xs">+</button></div></div>}
                </div>
              </>
            ) : (
              planned.blockType === 'break' ? (
                <div className="grid grid-cols-1 gap-2">
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.durationLabel}</p>
                    <div className="flex items-center gap-1"><button onClick={() => onUpdate({ durationSeconds: Math.max(60, (planned.durationSeconds ?? 300) - 30) })} className="text-gray-400 hover:text-white text-xs">−</button><span className="text-white text-xs font-semibold text-center flex-1">{formatDuration(planned.durationSeconds ?? 0)}</span><button onClick={() => onUpdate({ durationSeconds: (planned.durationSeconds ?? 300) + 30 })} className="text-gray-400 hover:text-white text-xs">+</button></div>
                  </div>
                </div>
              ) : (
              <>
                <div className="mb-2 rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.cardioActivityLabel}</p>
                  <select value={planned.cardioActivity ?? 'run'} onChange={(e) => onUpdate({ cardioActivity: e.target.value as CardioActivity })} className="w-full rounded border px-2 py-1 bg-[#0f172a] text-white text-xs outline-none" style={{ borderColor: '#334155' }}>
                    <option value="run" style={{ background: '#0f172a', color: '#e5e7eb' }}>Run</option>
                    <option value="bike" style={{ background: '#0f172a', color: '#e5e7eb' }}>Bike</option>
                    <option value="rower" style={{ background: '#0f172a', color: '#e5e7eb' }}>Rower</option>
                    <option value="crosstrainer" style={{ background: '#0f172a', color: '#e5e7eb' }}>Crosstrainer</option>
                    <option value="stairmaster" style={{ background: '#0f172a', color: '#e5e7eb' }}>Stairmaster</option>
                    <option value="walk" style={{ background: '#0f172a', color: '#e5e7eb' }}>Walk</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">HR%</p>
                    <div className="flex items-center gap-1">
                      <input type="number" min={40} max={100} value={hrMinPct} onChange={(e) => onUpdate({ targetHrMinPercent: Math.max(40, Math.min(100, parseInt(e.target.value) || 40)) })} className="w-full text-center bg-transparent text-white text-xs outline-none" />
                      <span className="text-gray-600 text-xs">-</span>
                      <input type="number" min={40} max={100} value={hrMaxPct} onChange={(e) => onUpdate({ targetHrMaxPercent: Math.max(40, Math.min(100, parseInt(e.target.value) || 40)) })} className="w-full text-center bg-transparent text-white text-xs outline-none" />
                    </div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.targetHrBpmLabel}</p>
                    <div className="text-center text-xs text-cyan-300 font-semibold">{hrBpm}</div>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: '#1a1d2e', border: '1px solid #2a2d42' }}>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide text-center">{t.durationLabel}</p>
                    {planned.blockType === 'cardio' ? (
                      <div className="flex items-center gap-1"><button onClick={() => onUpdate({ durationSeconds: Math.max(300, (planned.durationSeconds ?? 900) - 60) })} className="text-gray-400 hover:text-white text-xs">−</button><span className="text-white text-xs font-semibold text-center flex-1">{formatDuration(planned.durationSeconds ?? 0)}</span><button onClick={() => onUpdate({ durationSeconds: (planned.durationSeconds ?? 900) + 60 })} className="text-gray-400 hover:text-white text-xs">+</button></div>
                    ) : (
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center gap-1"><span className="text-gray-500">{t.intervalHighIntensityLabel}</span><input type="number" value={planned.intervalWorkSeconds ?? 60} onChange={(e) => onUpdate({ intervalWorkSeconds: Math.max(5, parseInt(e.target.value) || 5) })} className="w-full bg-transparent text-white outline-none text-right" /></div>
                        <div className="flex items-center gap-1"><span className="text-gray-500">{t.intervalLowIntensityLabel}</span><input type="number" value={planned.intervalRestSeconds ?? 90} onChange={(e) => onUpdate({ intervalRestSeconds: Math.max(5, parseInt(e.target.value) || 5) })} className="w-full bg-transparent text-white outline-none text-right" /></div>
                        <div className="flex items-center gap-1"><span className="text-gray-500">{t.intervalCyclesLabel}</span><input type="number" value={planned.intervalRounds ?? 8} onChange={(e) => onUpdate({ intervalRounds: Math.max(1, parseInt(e.target.value) || 1) })} className="w-full bg-transparent text-white outline-none text-right" /></div>
                      </div>
                    )}
                  </div>
                </div>
              </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
