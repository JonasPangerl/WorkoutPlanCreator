/**
 * Unified color map for exercise categories, muscle stat groups, and body diagram.
 *
 * Colorblind-safe palette (safe for deuteranopia & protanopia — the two most common types):
 *   Push family  — sky blue  (#0ea5e9)
 *   Pull family  — red       (#ef4444)  clearly distinct from sky-blue
 *   Legs family  — green shades
 *   Core family  — amber / teal
 *   Full Body    — orange
 */
export const CATEGORY_COLORS: Record<string, string> = {
  // ── Push ───────────────────────────────────────
  Push:      '#0ea5e9',   // sky-500
  Chest:     '#0284c7',   // sky-600
  Shoulders: '#38bdf8',   // sky-400

  // ── Pull ───────────────────────────────────────
  Pull:      '#ef4444',   // red-500
  Back:      '#dc2626',   // red-600
  Arms:      '#f87171',   // red-400

  // ── Legs ───────────────────────────────────────
  Legs:      '#86efac',   // green-300  (adductors/abductors)
  Calves:    '#15803d',   // green-700
  Glutes:    '#16a34a',   // green-600
  Hamstrings:'#22c55e',   // green-500
  Quads:     '#4ade80',   // green-400 (brightest)

  // ── Core ───────────────────────────────────────
  'Front Core': '#f59e0b', // amber-400
  'Side Core':  '#14b8a6', // teal-500
  Core:         '#f59e0b', // amber-400

  // ── Other ──────────────────────────────────────
  'Full Body': '#f97316',  // orange-500
};

/**
 * Per-muscle-group color map for the body diagram color mode.
 * Each muscle is colored according to its training family.
 */
export const MUSCLE_COLORS: Record<string, string> = {
  // Push — sky-blue family
  chest:     '#0284c7',
  frontDelt: '#0ea5e9',
  sideDelt:  '#38bdf8',
  triceps:   '#7dd3fc',

  // Pull — red family
  lats:      '#dc2626',
  traps:     '#ef4444',
  rearDelt:  '#f87171',
  biceps:    '#fca5a5',
  forearms:  '#fecaca',

  // Legs — green family
  quads:     '#4ade80',
  hamstrings:'#22c55e',
  glutes:    '#16a34a',
  adductors: '#86efac',
  abductors: '#bbf7d0',
  calves:    '#15803d',

  // Core — amber / teal
  abs:       '#f59e0b',
  obliques:  '#14b8a6',
  lowerBack: '#0d9488',
};
