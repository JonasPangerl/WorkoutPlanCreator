import jsPDF from 'jspdf';
import type { WorkoutPlan, Exercise, MuscleGroup } from '../types';
import { EXERCISES } from '../data/exercises';
import { MUSCLE_LABELS, MUSCLE_CATEGORIES } from '../types';
import { GOAL_PRESETS } from './presets';
import {
  calcExerciseDurationSeconds,
  calcDayDurationSeconds,
  formatDuration,
  calcWeeklyMuscleVolume,
} from './calculations';

const BG = '#0f1117';
const SURFACE = '#13152a';
const BORDER = '#2a2d42';
const TEXT_PRIMARY = '#e2e8f0';
const TEXT_SECONDARY = '#9ca3af';
const TEXT_MUTED = '#4b5563';
const ACCENT = '#f97316';

// jsPDF works with RGB arrays
const c = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const CATEGORY_COLORS: Record<string, string> = {
  Push: '#3b82f6',
  Pull: '#8b5cf6',
  Legs: '#22c55e',
  'Front Core': '#f59e0b',
  'Side Core': '#14b8a6',
};

export function exportToPDF(plan: WorkoutPlan): void {
  const allExercises: Exercise[] = [...EXERCISES, ...plan.customExercises];
  const weeklyVolume = calcWeeklyMuscleVolume(plan.days, allExercises);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let y = MARGIN;

  // ── Helpers ────────────────────────────────────────────
  const setFont = (size: number, style: 'normal' | 'bold' = 'normal', color = TEXT_PRIMARY) => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', style);
    pdf.setTextColor(...c(color));
  };

  const fillRect = (x: number, ry: number, w: number, h: number, color: string) => {
    pdf.setFillColor(...c(color));
    pdf.rect(x, ry, w, h, 'F');
  };

  const checkPage = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      pdf.addPage();
      fillRect(0, 0, PAGE_W, PAGE_H, BG);
      y = MARGIN;
    }
  };

  // ── Page background ────────────────────────────────────
  fillRect(0, 0, PAGE_W, PAGE_H, BG);

  // ── Header ─────────────────────────────────────────────
  fillRect(MARGIN, y, CONTENT_W, 18, SURFACE);
  pdf.setDrawColor(...c(BORDER));
  pdf.setLineWidth(0.3);
  pdf.rect(MARGIN, y, CONTENT_W, 18);

  setFont(14, 'bold', ACCENT);
  pdf.text('Workout Plan', MARGIN + 5, y + 7);

  setFont(8, 'normal', TEXT_SECONDARY);
  pdf.text(`${plan.trainingsPerWeek} days/week  ·  Generated ${new Date().toLocaleDateString()}`, MARGIN + 5, y + 13);

  y += 24;

  // ── Training Days ──────────────────────────────────────
  for (const day of plan.days) {
    checkPage(16);

    // Day header
    fillRect(MARGIN, y, CONTENT_W, 9, '#1a1d2e');
    setFont(9, 'bold', TEXT_PRIMARY);
    pdf.text(day.label, MARGIN + 3, y + 6);

    const dayDuration = calcDayDurationSeconds(day);
    if (dayDuration > 0) {
      setFont(8, 'normal', ACCENT);
      const durText = `~${formatDuration(dayDuration)}`;
      const tw = pdf.getTextWidth(durText);
      pdf.text(durText, MARGIN + CONTENT_W - tw - 3, y + 6);
    }
    y += 11;

    if (day.exercises.length === 0) {
      checkPage(8);
      setFont(8, 'normal', TEXT_MUTED);
      pdf.text('No exercises', MARGIN + 3, y + 5);
      y += 9;
    } else {
      // Column headers
      checkPage(7);
      setFont(7, 'bold', TEXT_MUTED);
      pdf.text('Exercise', MARGIN + 3, y + 4);
      pdf.text('Goal', MARGIN + 74, y + 4);
      pdf.text('Sets', MARGIN + 98, y + 4);
      pdf.text('Reps', MARGIN + 112, y + 4);
      pdf.text('Rest', MARGIN + 130, y + 4);
      pdf.text('Est. Time', MARGIN + 152, y + 4);
      pdf.setDrawColor(...c(BORDER));
      pdf.setLineWidth(0.2);
      pdf.line(MARGIN, y + 6, MARGIN + CONTENT_W, y + 6);
      y += 8;

      for (const planned of day.exercises) {
        checkPage(9);
        const exercise = allExercises.find((e) => e.id === planned.exerciseId);
        if (!exercise) continue;

        const preset = GOAL_PRESETS[planned.goal];
        const dur = calcExerciseDurationSeconds(planned);
        const restMin = Math.floor(planned.restSeconds / 60);
        const restSec = planned.restSeconds % 60;
        const restLabel = restMin > 0
          ? `${restMin}:${String(restSec).padStart(2, '0')}`
          : `${restSec}s`;

        // Zebra row
        if (day.exercises.indexOf(planned) % 2 === 0) {
          fillRect(MARGIN, y, CONTENT_W, 8, '#12141f');
        }

        setFont(8, 'normal', TEXT_PRIMARY);
        // Truncate long names
        const name = exercise.name.length > 32 ? exercise.name.slice(0, 31) + '…' : exercise.name;
        pdf.text(name, MARGIN + 3, y + 5.5);

        setFont(7, 'bold');
        pdf.setTextColor(...c(preset.color));
        pdf.text(preset.label, MARGIN + 74, y + 5.5);

        setFont(8, 'normal', TEXT_SECONDARY);
        pdf.text(String(planned.sets), MARGIN + 100, y + 5.5);
        pdf.text(`${planned.repMin}–${planned.repMax}`, MARGIN + 112, y + 5.5);
        pdf.text(restLabel, MARGIN + 130, y + 5.5);

        setFont(8, 'normal', ACCENT);
        pdf.text(formatDuration(dur), MARGIN + 152, y + 5.5);

        y += 8.5;
      }

      // Day total row
      fillRect(MARGIN, y, CONTENT_W, 7, SURFACE);
      setFont(7.5, 'bold', TEXT_SECONDARY);
      pdf.text(`${day.exercises.length} exercise${day.exercises.length !== 1 ? 's' : ''}`, MARGIN + 3, y + 4.5);
      if (dayDuration > 0) {
        setFont(7.5, 'bold', ACCENT);
        pdf.text(`Total: ~${formatDuration(dayDuration)}`, MARGIN + CONTENT_W - 35, y + 4.5);
      }
      y += 10;
    }

    y += 3;
  }

  // ── Weekly Volume Summary ──────────────────────────────
  checkPage(20);
  y += 2;

  fillRect(MARGIN, y, CONTENT_W, 9, SURFACE);
  setFont(9, 'bold', TEXT_PRIMARY);
  pdf.text('Weekly Muscle Volume', MARGIN + 3, y + 6);
  y += 12;

  const allMuscles = Object.values(MUSCLE_CATEGORIES).flat() as MuscleGroup[];
  const maxSets = Math.max(
    ...allMuscles.map((m) => (weeklyVolume[m]?.primarySets ?? 0) + (weeklyVolume[m]?.secondarySets ?? 0)),
    10
  );
  const BAR_MAX_W = CONTENT_W - 50;

  for (const [category, muscles] of Object.entries(MUSCLE_CATEGORIES)) {
    checkPage((muscles.length + 1) * 6 + 4);

    const catColor = CATEGORY_COLORS[category] ?? '#6b7280';
    setFont(7.5, 'bold', catColor);
    pdf.text(category, MARGIN, y + 4);
    y += 6;

    for (const muscle of muscles as MuscleGroup[]) {
      checkPage(6);
      const vol = weeklyVolume[muscle] ?? { primarySets: 0, secondarySets: 0 };
      const total = vol.primarySets + vol.secondarySets;
      const isUntrained = total === 0;

      setFont(7, 'normal', isUntrained ? TEXT_MUTED : TEXT_SECONDARY);
      pdf.text(MUSCLE_LABELS[muscle], MARGIN + 2, y + 3.5);

      // Bar background
      fillRect(MARGIN + 32, y + 0.5, BAR_MAX_W, 4, '#1a1d2e');

      // Primary bar
      if (vol.primarySets > 0) {
        const pw = (vol.primarySets / maxSets) * BAR_MAX_W;
        pdf.setFillColor(...c(catColor));
        pdf.rect(MARGIN + 32, y + 0.5, pw, 4, 'F');
      }
      // Secondary bar (drawn lighter by blending with background color)
      if (vol.secondarySets > 0) {
        const pw = (vol.primarySets / maxSets) * BAR_MAX_W;
        const sw = (vol.secondarySets / maxSets) * BAR_MAX_W;
        const rgb = c(catColor);
        // Mix with background to simulate 35% opacity: result = color * 0.35 + bg * 0.65
        const bg = c('#1a1d2e');
        const blended: [number, number, number] = [
          Math.round(rgb[0] * 0.35 + bg[0] * 0.65),
          Math.round(rgb[1] * 0.35 + bg[1] * 0.65),
          Math.round(rgb[2] * 0.35 + bg[2] * 0.65),
        ];
        pdf.setFillColor(...blended);
        pdf.rect(MARGIN + 32 + pw, y + 0.5, sw, 4, 'F');
      }

      // Sets label
      setFont(7, 'bold', isUntrained ? TEXT_MUTED : TEXT_PRIMARY);
      const label = isUntrained ? '0' : `${vol.primarySets}${vol.secondarySets > 0 ? ` +${vol.secondarySets}s` : ''}`;
      pdf.text(label, MARGIN + 32 + BAR_MAX_W + 2, y + 3.5);

      y += 5.5;
    }
    y += 2;
  }

  pdf.save('workout-plan.pdf');
}
