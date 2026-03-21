import React, { useEffect, useRef } from 'react';
import type { MuscleGroup } from '../../types';

interface Props {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  view: 'front' | 'back';
  primaryColor?: string;
  secondaryColor?: string;
  compact?: boolean;
  /** When provided, each muscle is colored individually using this map (colorMode). */
  muscleColors?: Record<string, string>;
}

// Maps muscle groups to their SVG element IDs
const FRONT_MUSCLE_IDS: Partial<Record<MuscleGroup, string[]>> = {
  chest: ['chest'],
  frontDelt: ['frontDelt-left', 'frontDelt-right'],
  sideDelt: ['sideDelt-left', 'sideDelt-right'],
  biceps: ['biceps-left', 'biceps-right'],
  triceps: ['triceps-left', 'triceps-right'],
  forearms: ['forearms-left', 'forearms-right'],
  abs: ['abs'],
  obliques: ['obliques-left', 'obliques-right'],
  quads: ['quads-left', 'quads-right'],
  adductors: ['adductors-left', 'adductors-right'],
  abductors: ['abductors-left', 'abductors-right'],
  calves: ['calves-left', 'calves-right'],
  traps: ['traps-front'],
};

const BACK_MUSCLE_IDS: Partial<Record<MuscleGroup, string[]>> = {
  traps: ['traps'],
  rearDelt: ['rearDelt-left', 'rearDelt-right'],
  lats: ['lats-left', 'lats-right'],
  lowerBack: ['lowerBack'],
  glutes: ['glutes-left', 'glutes-right'],
  hamstrings: ['hamstrings-left', 'hamstrings-right'],
  abductors: ['abductors-left-back', 'abductors-right-back'],
  calves: ['calves-left', 'calves-right'],
  triceps: ['triceps-left-back', 'triceps-right-back'],
  forearms: ['forearms-left-back', 'forearms-right-back'],
};

const PRIMARY_COLOR = '#f97316';
const SECONDARY_COLOR = '#f9731660';

/**
 * Append alpha suffix to a hex color string.
 * e.g. hex6ToAlpha('#ef4444', '70') → '#ef444470'
 */
function withAlpha(hex: string, alpha: string): string {
  return hex.replace('#', '#') + alpha;
}

function applyMuscleColors(
  svgEl: Element,
  muscleIds: Partial<Record<MuscleGroup, string[]>>,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[],
  primaryColor: string,
  secondaryColor: string,
  muscleColors?: Record<string, string>
) {
  // Reset all muscle paths
  const allIds = Object.values(muscleIds).flat();
  for (const id of allIds) {
    const el = svgEl.querySelector(`#${id}`) as SVGPathElement | null;
    if (el) el.setAttribute('fill', 'transparent');
  }

  // Apply secondary first (so primary overrides on overlap)
  for (const muscle of secondaryMuscles) {
    const ids = muscleIds[muscle] ?? [];
    const color = muscleColors
      ? withAlpha(muscleColors[muscle] ?? primaryColor, '70')
      : secondaryColor;
    for (const id of ids) {
      const el = svgEl.querySelector(`#${id}`) as SVGPathElement | null;
      if (el) {
        el.setAttribute('fill', color);
        el.setAttribute('opacity', '1');
      }
    }
  }

  // Apply primary
  for (const muscle of primaryMuscles) {
    const ids = muscleIds[muscle] ?? [];
    const color = muscleColors ? (muscleColors[muscle] ?? primaryColor) : primaryColor;
    for (const id of ids) {
      const el = svgEl.querySelector(`#${id}`) as SVGPathElement | null;
      if (el) {
        el.setAttribute('fill', color);
        el.setAttribute('opacity', '1');
      }
    }
  }
}

const MuscleSvgView: React.FC<{
  svgContent: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  muscleIds: Partial<Record<MuscleGroup, string[]>>;
  primaryColor: string;
  secondaryColor: string;
  muscleColors?: Record<string, string>;
}> = ({ svgContent, primaryMuscles, secondaryMuscles, muscleIds, primaryColor, secondaryColor, muscleColors }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    applyMuscleColors(svgEl, muscleIds, primaryMuscles, secondaryMuscles, primaryColor, secondaryColor, muscleColors);
  }, [primaryMuscles, secondaryMuscles, muscleIds, primaryColor, secondaryColor, muscleColors]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

// We load SVG content via fetch/import
import frontSvgRaw from './BodyFront.svg?raw';
import backSvgRaw from './BodyBack.svg?raw';

export const MuscleDiagram: React.FC<Props> = ({
  primaryMuscles,
  secondaryMuscles,
  view,
  primaryColor = PRIMARY_COLOR,
  secondaryColor = SECONDARY_COLOR,
  compact = false,
  muscleColors,
}) => {
  const svgContent = view === 'front' ? frontSvgRaw : backSvgRaw;
  const muscleIds = view === 'front' ? FRONT_MUSCLE_IDS : BACK_MUSCLE_IDS;

  return (
    <div className={compact ? 'w-20 h-40' : 'w-full h-full'}>
      <MuscleSvgView
        svgContent={svgContent}
        primaryMuscles={primaryMuscles}
        secondaryMuscles={secondaryMuscles}
        muscleIds={muscleIds}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        muscleColors={muscleColors}
      />
    </div>
  );
};

export { FRONT_MUSCLE_IDS, BACK_MUSCLE_IDS };
