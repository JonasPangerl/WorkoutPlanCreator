export type Locale = 'en' | 'de';

export interface Translations {
  // ── App header ──────────────────────────────────────────
  appTitle: string;
  appSubtitle: string;
  colorsLabel: string;
  colorsTooltip: string;
  compactLabel: string;
  compactTooltip: string;
  daysWeek: string;
  importBtn: string;
  exportJsonBtn: string;
  pdfBtn: string;
  newPlanBtn: string;
  importError: string;

  // ── Goals ────────────────────────────────────────────────
  goals: Record<string, { label: string; description: string }>;
  goalAbbrev: Record<string, string>;

  // ── Muscle labels ────────────────────────────────────────
  muscles: Record<string, string>;

  // ── Muscle category names ────────────────────────────────
  muscleCategories: Record<string, string>;

  // ── Exercise categories ──────────────────────────────────
  exerciseCategories: Record<string, string>;

  // ── Training day column ──────────────────────────────────
  exercisesSingular: string;
  exercisesPlural: string;
  dropHere: string;

  // ── Planned exercise row ─────────────────────────────────
  setsLabel: string;
  repsLabel: string;
  restLabel: string;
  unilateralOn: string;
  unilateralOff: string;
  unilateralTooltip: string;

  // ── Day load bar ─────────────────────────────────────────
  trainingLoad: string;
  loadHighWarn: string;
  cnsLabel: string;
  muscleLabel: string;
  mentalLabel: string;
  cnsTooltip: string;
  muscleTooltip: string;
  mentalTooltip: string;
  loadLow: string;
  loadModerate: string;
  loadHigh: string;
  loadVeryHigh: string;

  // ── Exercise library ─────────────────────────────────────
  exerciseLibraryTitle: string;
  compactViewTooltip: string;
  detailedViewTooltip: string;
  newExerciseBtn: string;
  searchPlaceholder: string;
  allGoalsFilter: string;
  allTypesFilter: string;
  allLevelsFilter: string;
  compoundLabel: string;
  isolationLabel: string;
  compoundAbbrev: string;
  isolationAbbrev: string;
  beginnerLabel: string;
  intermediateLabel: string;
  advancedLabel: string;
  beginnerAbbrev: string;
  intermediateAbbrev: string;
  advancedAbbrev: string;
  noExercisesFound: string;
  createCustomLink: string;
  exercisesCountFmt: string; // uses {n} and {m} placeholders
  clearFilters: string;

  // ── Info panel ───────────────────────────────────────────
  muscleMapTab: string;
  weeklyTab: string;
  dailyTab: string;
  viewingLabel: string;
  weeklyOverview: string;
  noExercisesPlanned: string;
  allPlannedMuscles: string;
  frontLabel: string;
  backLabel: string;
  pushLegend: string;
  pullLegend: string;
  legsLegend: string;
  coreLegend: string;
  primaryLegend: string;
  secondaryLegend: string;
  hoverHint: string;
  noExercisesInSession: string;
  dragToAddHint: string;
  noTrainingDays: string;
  volumeSuffix: string; // appended after day label: "{dayLabel} — Volume"

  // ── Stats panel ──────────────────────────────────────────
  weeklyVolumeTitle: string;
  legendTitle: string;
  primarySets: string;
  secondarySets: string;
  rangeMarkers: string;

  // ── Custom exercise modal ────────────────────────────────
  createCustomTitle: string;
  exerciseNameLabel: string;
  exerciseNamePlaceholder: string;
  categoriesLabel: string;
  customCategoryPlaceholder: string;
  defaultGoalLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  typeLabel: string;
  difficultyLabel: string;
  unilateralTitle: string;
  unilateralSubLabel: string;
  musclesInstruction: string;
  cancelBtn: string;
  saveExerciseBtn: string;
  validationNameRequired: string;
  validationPrimaryRequired: string;

  // ── Exercise detail modal ────────────────────────────────
  customBadge: string;
  primaryMusclesSection: string;
  secondaryMusclesSection: string;
  defaultGoalSection: string;
  deleteCustomBtn: string;

  // ── Overview tab (all-days muscle map) ──────────────────
  overviewTab: string;
  restDayLabel: string;
  weeklyMapTitle: string;
  fitnessLevelLabel: string;
  levelBeginner: string;
  levelIntermediate: string;
  levelAdvanced: string;
  levelBeginnerDesc: string;
  levelIntermediateDesc: string;
  levelAdvancedDesc: string;
  exerciseNames: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────
const en: Translations = {
  appTitle: 'Workout Planner',
  appSubtitle: 'Plan · Track · Dominate',
  colorsLabel: 'Colors',
  colorsTooltip: 'Colour-code exercise blocks by muscle group',
  compactLabel: 'Compact',
  compactTooltip: 'Compact view — hide sets/reps/rest',
  daysWeek: 'Days/week',
  importBtn: 'Import',
  exportJsonBtn: 'Export JSON',
  pdfBtn: 'PDF',
  newPlanBtn: 'New Plan',
  importError: 'Failed to import: invalid file.',

  goals: {
    power:       { label: 'Power',       description: '1–5 reps · 5 sets · 3:00 rest' },
    strength:    { label: 'Strength',    description: '5–8 reps · 4 sets · 2:30 rest' },
    hypertrophy: { label: 'Hypertrophy', description: '8–12 reps · 3 sets · 2:00 rest' },
    endurance:   { label: 'Endurance',   description: '15–20 reps · 3 sets · 2:00 rest' },
  },
  goalAbbrev: {
    power: 'PWR', strength: 'STR', hypertrophy: 'HYP', endurance: 'END',
  },

  muscles: {
    chest: 'Chest', frontDelt: 'Front Delt', sideDelt: 'Side Delt',
    rearDelt: 'Rear Delt', biceps: 'Biceps', triceps: 'Triceps',
    forearms: 'Forearms', abs: 'Abs', obliques: 'Obliques',
    quads: 'Quads', adductors: 'Adductors', abductors: 'Abductors',
    calves: 'Calves', traps: 'Traps', lats: 'Lats',
    lowerBack: 'Lower Back', glutes: 'Glutes', hamstrings: 'Hamstrings',
  },

  muscleCategories: {
    Push: 'Push', Pull: 'Pull', Legs: 'Legs',
    'Front Core': 'Front Core', 'Side Core': 'Side Core',
  },

  exerciseCategories: {
    All: 'All', Chest: 'Chest', Back: 'Back', Shoulders: 'Shoulders',
    Arms: 'Arms', Glutes: 'Glutes', Quads: 'Quads', Hamstrings: 'Hamstrings',
    Calves: 'Calves', Legs: 'Legs', Core: 'Core',
    'Front Core': 'Front Core', 'Side Core': 'Side Core', 'Full Body': 'Full Body',
  },

  exercisesSingular: '1 exercise',
  exercisesPlural: '{n} exercises',
  dropHere: 'Drop exercises here',

  setsLabel: 'Sets',
  repsLabel: 'Reps',
  restLabel: 'Rest',
  unilateralOn: 'On',
  unilateralOff: 'Off',
  unilateralTooltip: 'Unilateral: left+right = 1 set, rest after both sides',

  trainingLoad: 'Training Load',
  loadHighWarn: '⚠ HIGH',
  cnsLabel: 'CNS',
  muscleLabel: 'Muscle',
  mentalLabel: 'Mental',
  cnsTooltip: 'Central Nervous System load — heavy compound lifts and low-rep power work drain the CNS most.',
  muscleTooltip: 'Muscle damage / volume fatigue — driven by total reps × sets × muscle size.',
  mentalTooltip: 'Mental / cognitive load — long sessions and many compound movements require sustained focus.',
  loadLow: 'Low',
  loadModerate: 'Moderate',
  loadHigh: 'High',
  loadVeryHigh: 'Very High',

  exerciseLibraryTitle: 'Exercise Library',
  compactViewTooltip: 'Compact view',
  detailedViewTooltip: 'Detailed view',
  newExerciseBtn: 'New',
  searchPlaceholder: 'Search exercises...',
  allGoalsFilter: 'All Goals',
  allTypesFilter: 'All',
  allLevelsFilter: 'All Levels',
  compoundLabel: 'Compound',
  isolationLabel: 'Isolation',
  compoundAbbrev: 'Comp',
  isolationAbbrev: 'Iso',
  beginnerLabel: 'Beginner',
  intermediateLabel: 'Intermediate',
  advancedLabel: 'Advanced',
  beginnerAbbrev: 'Beg',
  intermediateAbbrev: 'Int',
  advancedAbbrev: 'Adv',
  noExercisesFound: 'No exercises found',
  createCustomLink: 'Create custom exercise',
  exercisesCountFmt: '{n} of {m} exercises · Drag to plan',
  clearFilters: 'Clear all filters',

  muscleMapTab: 'Muscle Map',
  weeklyTab: 'Weekly',
  dailyTab: 'Daily',
  viewingLabel: 'Viewing',
  weeklyOverview: 'Weekly overview',
  noExercisesPlanned: 'No exercises planned',
  allPlannedMuscles: 'All planned muscles',
  frontLabel: 'Front',
  backLabel: 'Back',
  pushLegend: 'Push',
  pullLegend: 'Pull',
  legsLegend: 'Legs',
  coreLegend: 'Core',
  primaryLegend: 'Primary',
  secondaryLegend: 'Secondary',
  hoverHint: 'Hover any exercise to preview its activation',
  noExercisesInSession: 'No exercises in this session yet',
  dragToAddHint: 'Drag exercises from the library to add them',
  noTrainingDays: 'No training days configured',
  volumeSuffix: '— Volume',

  weeklyVolumeTitle: 'Weekly Volume',
  legendTitle: 'Legend',
  primarySets: 'Primary sets',
  secondarySets: 'Secondary sets (+Xs shown)',
  rangeMarkers: 'Recommended range markers',

  createCustomTitle: 'Create Custom Exercise',
  exerciseNameLabel: 'Exercise Name *',
  exerciseNamePlaceholder: 'e.g. Paused Bench Press',
  categoriesLabel: 'Categories',
  customCategoryPlaceholder: 'Custom category…',
  defaultGoalLabel: 'Default Goal',
  descriptionLabel: 'Description (optional)',
  descriptionPlaceholder: 'Brief description of the exercise...',
  typeLabel: 'Type',
  difficultyLabel: 'Difficulty',
  unilateralTitle: 'Can be done unilaterally',
  unilateralSubLabel: 'Left + right = 1 set, rest after both sides',
  musclesInstruction: 'Muscles — click once for primary, twice for secondary, third to clear *',
  cancelBtn: 'Cancel',
  saveExerciseBtn: 'Save Exercise',
  validationNameRequired: 'Exercise name is required.',
  validationPrimaryRequired: 'Select at least one primary muscle.',

  customBadge: 'Custom',
  primaryMusclesSection: 'Primary',
  secondaryMusclesSection: 'Secondary',
  defaultGoalSection: 'Default goal:',
  deleteCustomBtn: 'Delete Custom Exercise',

  overviewTab: 'Overview',
  restDayLabel: 'Rest',
  weeklyMapTitle: 'Weekly Training Map',

  fitnessLevelLabel: 'Level',
  levelBeginner: 'Beginner',
  levelIntermediate: 'Intermediate',
  levelAdvanced: 'Advanced',
  levelBeginnerDesc: 'New to training — your body reaches fatigue faster',
  levelIntermediateDesc: 'Regular gym-goer — standard recovery capacity',
  levelAdvancedDesc: 'Years of training — high work capacity & fast recovery',

  exerciseNames: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// GERMAN
// ─────────────────────────────────────────────────────────────────────────────
const de: Translations = {
  appTitle: 'Trainingsplaner',
  appSubtitle: 'Planen · Tracken · Dominieren',
  colorsLabel: 'Farben',
  colorsTooltip: 'Übungsblöcke nach Muskelgruppe einfärben',
  compactLabel: 'Kompakt',
  compactTooltip: 'Kompaktansicht — Sätze/Wdh./Pause ausblenden',
  daysWeek: 'Tage/Woche',
  importBtn: 'Importieren',
  exportJsonBtn: 'JSON exportieren',
  pdfBtn: 'PDF',
  newPlanBtn: 'Neuer Plan',
  importError: 'Import fehlgeschlagen: ungültige Datei.',

  goals: {
    power:       { label: 'Power',         description: '1–5 Wdh. · 5 Sätze · 3:00 Pause' },
    strength:    { label: 'Stärke',         description: '5–8 Wdh. · 4 Sätze · 2:30 Pause' },
    hypertrophy: { label: 'Hypertrophie',   description: '8–12 Wdh. · 3 Sätze · 2:00 Pause' },
    endurance:   { label: 'Ausdauer',       description: '15–20 Wdh. · 3 Sätze · 2:00 Pause' },
  },
  goalAbbrev: {
    power: 'KRF', strength: 'STR', hypertrophy: 'HYP', endurance: 'AUS',
  },

  muscles: {
    chest: 'Brust',
    frontDelt: 'Vord. Deltamuskel',
    sideDelt: 'Seit. Deltamuskel',
    rearDelt: 'Hint. Deltamuskel',
    biceps: 'Bizeps',
    triceps: 'Trizeps',
    forearms: 'Unterarme',
    abs: 'Bauch',
    obliques: 'Schrägmuskel',
    quads: 'Quadrizeps',
    adductors: 'Adduktoren',
    abductors: 'Abduktoren',
    calves: 'Waden',
    traps: 'Trapezmuskel',
    lats: 'Latissimus',
    lowerBack: 'Unterer Rücken',
    glutes: 'Gesäß',
    hamstrings: 'Beinbeuger',
  },

  muscleCategories: {
    Push: 'Drücken',
    Pull: 'Ziehen',
    Legs: 'Beine',
    'Front Core': 'Vorderer Rumpf',
    'Side Core': 'Seitlicher Rumpf',
  },

  exerciseCategories: {
    All: 'Alle',
    Chest: 'Brust',
    Back: 'Rücken',
    Shoulders: 'Schultern',
    Arms: 'Arme',
    Glutes: 'Gesäß',
    Quads: 'Quadrizeps',
    Hamstrings: 'Beinbeuger',
    Calves: 'Waden',
    Legs: 'Beine',
    Core: 'Rumpf',
    'Front Core': 'Vorderer Rumpf',
    'Side Core': 'Seitlicher Rumpf',
    'Full Body': 'Ganzkörper',
  },

  exercisesSingular: '1 Übung',
  exercisesPlural: '{n} Übungen',
  dropHere: 'Übungen hier ablegen',

  setsLabel: 'Sätze',
  repsLabel: 'Wdh.',
  restLabel: 'Pause',
  unilateralOn: 'An',
  unilateralOff: 'Aus',
  unilateralTooltip: 'Unilateral: links+rechts = 1 Satz, Pause nach beiden Seiten',

  trainingLoad: 'Trainingsbelastung',
  loadHighWarn: '⚠ HOCH',
  cnsLabel: 'ZNS',
  muscleLabel: 'Muskel',
  mentalLabel: 'Mental',
  cnsTooltip: 'ZNS-Belastung — schwere Grundübungen und Kraftarbeit beanspruchen das zentrale Nervensystem am stärksten.',
  muscleTooltip: 'Muskelschaden / Volumenermüdung — abhängig von Gesamtwiederholungen × Sätze × Muskelgröße.',
  mentalTooltip: 'Mentale Belastung — lange Einheiten und viele Grundübungen erfordern anhaltende Konzentration.',
  loadLow: 'Gering',
  loadModerate: 'Moderat',
  loadHigh: 'Hoch',
  loadVeryHigh: 'Sehr hoch',

  exerciseLibraryTitle: 'Übungsbibliothek',
  compactViewTooltip: 'Kompaktansicht',
  detailedViewTooltip: 'Detailansicht',
  newExerciseBtn: 'Neu',
  searchPlaceholder: 'Übungen suchen...',
  allGoalsFilter: 'Alle Ziele',
  allTypesFilter: 'Alle',
  allLevelsFilter: 'Alle Level',
  compoundLabel: 'Grundübung',
  isolationLabel: 'Isolationsübung',
  compoundAbbrev: 'GÜ',
  isolationAbbrev: 'Iso',
  beginnerLabel: 'Anfänger',
  intermediateLabel: 'Fortgeschritten',
  advancedLabel: 'Profi',
  beginnerAbbrev: 'Anf',
  intermediateAbbrev: 'For',
  advancedAbbrev: 'Pro',
  noExercisesFound: 'Keine Übungen gefunden',
  createCustomLink: 'Eigene Übung erstellen',
  exercisesCountFmt: '{n} von {m} Übungen · Zum Plan ziehen',
  clearFilters: 'Alle Filter zurücksetzen',

  muscleMapTab: 'Muskelkarte',
  weeklyTab: 'Wöchentlich',
  dailyTab: 'Täglich',
  viewingLabel: 'Vorschau',
  weeklyOverview: 'Wochenübersicht',
  noExercisesPlanned: 'Keine Übungen geplant',
  allPlannedMuscles: 'Alle geplanten Muskeln',
  frontLabel: 'Vorne',
  backLabel: 'Hinten',
  pushLegend: 'Drücken',
  pullLegend: 'Ziehen',
  legsLegend: 'Beine',
  coreLegend: 'Rumpf',
  primaryLegend: 'Primär',
  secondaryLegend: 'Sekundär',
  hoverHint: 'Über eine Übung fahren, um die Muskelaktivierung anzuzeigen',
  noExercisesInSession: 'Noch keine Übungen in dieser Einheit',
  dragToAddHint: 'Übungen aus der Bibliothek hierher ziehen',
  noTrainingDays: 'Keine Trainingstage konfiguriert',
  volumeSuffix: '— Volumen',

  weeklyVolumeTitle: 'Wöchentliches Volumen',
  legendTitle: 'Legende',
  primarySets: 'Primäre Sätze',
  secondarySets: 'Sekundäre Sätze (+X angezeigt)',
  rangeMarkers: 'Empfohlener Bereich',

  createCustomTitle: 'Eigene Übung erstellen',
  exerciseNameLabel: 'Übungsname *',
  exerciseNamePlaceholder: 'z. B. Pausiertes Bankdrücken',
  categoriesLabel: 'Kategorien',
  customCategoryPlaceholder: 'Eigene Kategorie…',
  defaultGoalLabel: 'Standard-Ziel',
  descriptionLabel: 'Beschreibung (optional)',
  descriptionPlaceholder: 'Kurze Beschreibung der Übung...',
  typeLabel: 'Typ',
  difficultyLabel: 'Schwierigkeit',
  unilateralTitle: 'Kann unilateral ausgeführt werden',
  unilateralSubLabel: 'Links + rechts = 1 Satz, Pause nach beiden Seiten',
  musclesInstruction: 'Muskeln — einmal: primär, zweimal: sekundär, drittes Mal: löschen *',
  cancelBtn: 'Abbrechen',
  saveExerciseBtn: 'Übung speichern',
  validationNameRequired: 'Übungsname ist erforderlich.',
  validationPrimaryRequired: 'Mindestens einen primären Muskel auswählen.',

  customBadge: 'Eigene',
  primaryMusclesSection: 'Primär',
  secondaryMusclesSection: 'Sekundär',
  defaultGoalSection: 'Standard-Ziel:',
  deleteCustomBtn: 'Eigene Übung löschen',

  overviewTab: 'Übersicht',
  restDayLabel: 'Ruhetag',
  weeklyMapTitle: 'Wöchentliche Muskelübersicht',

  fitnessLevelLabel: 'Level',
  levelBeginner: 'Anfänger',
  levelIntermediate: 'Fortgeschritten',
  levelAdvanced: 'Profi',
  levelBeginnerDesc: 'Neu im Training — dein Körper ermüdet schneller',
  levelIntermediateDesc: 'Regelmäßiger Gymbesucher — normale Erholungskapazität',
  levelAdvancedDesc: 'Jahrelange Erfahrung — hohe Belastbarkeit und schnelle Erholung',

  // German exercise name overrides keyed by exercise id
  exerciseNames: {
    'barbell-bench-press':       'Bankdrücken',
    'incline-bench-press':       'Schrägbankdrücken (aufwärts)',
    'decline-bench-press':       'Schrägbankdrücken (abwärts)',
    'decline-barbell-bench-press': 'Schrägbankdrücken (abwärts)',
    'close-grip-bench-press':    'Enges Bankdrücken',
    'wide-grip-bench-press':     'Breites Bankdrücken',
    'reverse-grip-bench-press':  'Bankdrücken (Untergriff)',
    'flat-db-press':             'Kurzhantel-Bankdrücken',
    'incline-db-press':          'Schrägbank Kurzhanteldrücken',
    'decline-db-press':          'Kurzhantel-Schrägbankdrücken (abwärts)',
    'neutral-grip-db-press':     'Kurzhanteldrücken (neutraler Griff)',
    'db-single-arm-press':       'Einarming Kurzhanteldrücken',
    'db-floor-press':            'Boden-Bankdrücken',
    'chest-press-machine':       'Brustdrücken Maschine',
    'incline-chest-press-machine': 'Schrägbank Brustdrücken Maschine',
    'decline-chest-press-machine': 'Negative Brustdrücken Maschine',
    'smith-bench-press':         'Smith-Maschinen-Bankdrücken',
    'smith-incline-bench':       'Smith-Schrägbankdrücken',
    'smith-decline-bench-press': 'Smith-Schrägbankdrücken (abwärts)',
    'cable-chest-press-standing':'Kabel-Brustdrücken (stehend)',
    'db-fly':                    'Kurzhantel-Fliegende',
    'incline-db-fly':            'Schrägbank Fliegende',
    'decline-db-fly':            'Negative Fliegende',
    'cable-fly-low':             'Kabelzug-Fliegende (unten nach oben)',
    'cable-fly-mid':             'Kabelzug-Fliegende (mitte)',
    'cable-fly-high':            'Kabelzug-Fliegende (oben nach unten)',
    'single-arm-cable-fly':      'Einarm Kabelzug-Fliegende',
    'machine-fly':               'Maschinen-Fliegende',
    'pec-deck':                  'Butterfly-Maschine',
    'push-up':                   'Liegestütz',
    'wide-push-up':              'Breiter Liegestütz',
    'decline-push-up':           'Negativer Liegestütz',
    'incline-push-up':           'Erhöhter Liegestütz',
    'archer-push-up':            'Bogenschützen-Liegestütz',
    'pull-up':                   'Klimmzug',
    'weighted-pull-up':          'Klimmzug mit Gewicht',
    'assisted-pull-up':          'Assistierter Klimmzug',
    'lat-pulldown':              'Latzug',
    'lat-pulldown-narrow':       'Latzug (enger Griff)',
    'lat-pulldown-reverse':      'Latzug (Untergriff)',
    'deadlift':                  'Kreuzheben',
    'smith-deadlift':            'Smith-Maschinen-Kreuzheben',
    'sumo-deadlift':             'Sumo-Kreuzheben',
    'romanian-deadlift':         'Rumänisches Kreuzheben',
    'stiff-leg-deadlift':        'Steifes Kreuzheben',
    'snatch-grip-deadlift':      'Reißgriff-Kreuzheben',
    'db-romanian-deadlift':      'Rumänisches Kurzhantel-Kreuzheben',
    'deadlift-machine':          'Kreuzheben-Maschine',
    'barbell-row':               'Langhantelrudern',
    'barbell-row-underhand':     'Langhantelrudern (Untergriff)',
    'pendlay-row':               'Pendlay-Rudern',
    'yates-row':                 'Yates-Rudern',
    'one-arm-db-row':            'Einarm-Kurzhantelrudern',
    'incline-db-row':            'Schrägbank Kurzhantelrudern',
    'seated-cable-row':          'Kabelrudern (sitzend)',
    'seated-cable-row-wide':     'Kabelrudern breit (sitzend)',
    'hammer-strength-row':       'Hammer-Strength-Rudern',
    'low-row-machine':           'Rudermaschine (tief)',
    'high-row-machine':          'Rudermaschine (hoch)',
    'face-pull':                 'Gesichtszug',
    'straight-arm-pulldown':     'Latzug gestreckt',
    'cable-pullover':            'Kabel-Pullover',
    'barbell-shrug':             'Schulterziehen',
    'db-shrug':                  'Kurzhantel-Schulterziehen',
    'barbell-squat':             'Kniebeuge',
    'front-squat':               'Frontkniebeuge',
    'zercher-squat':             'Zercher-Kniebeuge',
    'goblet-squat':              'Kelchkniebeuge',
    'db-squat':                  'Kurzhantel-Kniebeuge',
    'smith-squat':               'Smith-Maschinen-Kniebeuge',
    'hack-squat-machine':        'Hackenschmidt-Maschine',
    'belt-squat':                'Gürtelkniebeuge',
    'leg-press':                 'Beinpresse',
    'leg-press-high-foot':       'Beinpresse (hohe Fußstellung)',
    'leg-press-low-foot':        'Beinpresse (niedrige Fußstellung)',
    'single-leg-press':          'Einbeinige Beinpresse',
    'leg-extension':             'Beinstrecker',
    'leg-curl':                  'Beinbeuger (liegend)',
    'seated-leg-curl':           'Beinbeuger (sitzend)',
    'leg-curl-standing':         'Beinbeuger (stehend)',
    'nordic-curl':               'Nordisches Beinbeugen',
    'barbell-lunge':             'Ausfallschritt',
    'walking-lunge':             'Gehender Ausfallschritt',
    'reverse-lunge':             'Rückwärtiger Ausfallschritt',
    'bulgarian-split-squat':     'Bulgarische Kniebeuge',
    'bulgarian-split-squat-smith': 'Bulgarische Kniebeuge (Smith)',
    'step-up':                   'Aufstieg',
    'smith-machine-lunge':       'Smith-Ausfallschritt',
    'hip-thrust':                'Beckenheben',
    'hip-thrust-machine':        'Beckenheben Maschine',
    'glute-bridge':              'Gesäßbrücke',
    'cable-kickback':            'Kabel-Kickback',
    'glute-kickback-machine':    'Gesäß-Kickback Maschine',
    'abduction-machine':         'Abduktionsmaschine',
    'cable-hip-abduction':       'Kabel-Hüftabduktion',
    'adductor-machine':          'Adduktionsmaschine',
    'standing-calf-raise':       'Wadenheben (stehend)',
    'seated-calf-raise':         'Wadenheben (sitzend)',
    'donkey-calf-raise':         'Eselswadenheben',
    'single-leg-calf-raise':     'Einbeiniges Wadenheben',
    'barbell-overhead-press':    'Schulterdrücken (stehend)',
    'seated-overhead-press':     'Schulterdrücken (sitzend)',
    'push-press':                'Push-Press',
    'behind-neck-press':         'Nackendrücken',
    'db-shoulder-press':         'Kurzhantel-Schulterdrücken',
    'arnold-press':              'Arnold-Press',
    'db-single-arm-shoulder-press': 'Einarm Kurzhantel-Schulterdrücken',
    'shoulder-press-machine':    'Schulterdrücken-Maschine',
    'db-lateral-raise':          'Seitheben',
    'cable-lateral-raise':       'Kabel-Seitheben',
    'leaning-lateral-raise':     'Seitheben (schräg)',
    'machine-lateral-raise':     'Seitheben Maschine',
    'db-front-raise':            'Frontheben',
    'plate-front-raise':         'Scheiben-Frontheben',
    'machine-front-raise':       'Frontheben Maschine',
    'reverse-fly-db':            'Umgekehrte Fliegende',
    'reverse-fly-cable':         'Umgekehrte Kabel-Fliegende',
    'rear-delt-row-machine':     'Hinteren Delt Rudermaschine',
    'barbell-curl':              'Langhantel-Bizepscurl',
    'ez-curl':                   'EZ-Curl',
    'db-curl':                   'Kurzhantel-Bizepscurl',
    'hammer-curl':               'Hammercurl',
    'incline-db-curl':           'Schrägbank-Bizepscurl',
    'cable-curl':                'Kabel-Bizepscurl',
    'preacher-curl':             'Scottcurl',
    'preacher-curl-machine':     'Scottcurl Maschine',
    'bicep-curl-machine':        'Bizepscurl Maschine',
    'skull-crushers':            'Stirndrücken',
    'db-skull-crushers':         'Kurzhantel-Stirndrücken',
    'overhead-db-extension':     'Kurzhantel-Trizepsstrecker (über Kopf)',
    'overhead-cable-ext':        'Kabel-Trizepsstrecker (über Kopf)',
    'tricep-pushdown':           'Trizepsdrücken',
    'tricep-pushdown-rope':      'Trizepsdrücken (Seil)',
    'tricep-ext-machine':        'Trizepsstrecker Maschine',
    'assisted-dip-machine':      'Dip-Maschine (assistiert)',
    'dips':                      'Dips',
    'plank':                     'Unterarmstütz',
    'side-plank':                'Seitlicher Unterarmstütz',
    'hanging-leg-raise':         'Hängendes Beinheben',
    'toes-to-bar':               'Zehen zur Stange',
    'sit-up':                    'Sit-up',
    'decline-sit-up':            'Sit-up (schräg)',
    'weighted-sit-up':           'Sit-up mit Gewicht',
    'cable-crunch':              'Kabel-Crunch',
    'russian-twist':             'Russischer Twist',
    'pallof-press':              'Pallof-Press',
    'ab-crunch-machine':         'Bauchpresse Maschine',
    'rotary-torso-machine':      'Rumpfrotation Maschine',
    'hyperextension-back':       'Rückenstreckung',
    'hyperextension':            'Rückenstreckung (Schräg)',
    'roman-chair-side-bend':     'Seitneigen auf der Rückenstreckbank',
    'good-morning':              'Guten-Morgen-Übung',
    'good-morning-smith':        'Guten-Morgen-Übung (Smith)',
    'power-clean':               'Umsetzen',
    'barbell-snatch':            'Reißen',
    'kettlebell-swing':          'Kettlebell-Schwung',
    'thruster':                  'Barbell-Thruster',
    'farmers-carry':             'Farmer\'s Walk',
    'sled-push':                 'Schlittendrücken',
    'sled-pull':                 'Schlittenziehen',
    'turkish-get-up':            'Turkish Get-Up',
    'barbell-upright-row':       'Langhantel-Hochziehen',
    'db-upright-row':            'Kurzhantel-Hochziehen',
    'cable-upright-row':         'Kabel-Hochziehen',
    'ez-bar-drag-curl':          'EZ-Schleppcurl',
    'reverse-curl':              'Reverse Curl',
    'wrist-curl':                'Handgelenk-Curl',
    'reverse-wrist-curl':        'Reverse Handgelenk-Curl',
    'cable-pull-through':        'Kabel-Zug-Durchzug',
  },
};

export const translations: Record<Locale, Translations> = { en, de };
