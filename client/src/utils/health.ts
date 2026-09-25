// Utilidades de cálculo nutricional y renal.
// Fórmulas de referencia general (Mifflin-St Jeor; rangos de proteína/sodio tipo KDOQI para ERC).
// Son estimaciones educativas y no sustituyen la valoración de un profesional de salud,
// especialmente en presencia de enfermedad renal.

export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'none'
  | 'walk_occasional'
  | 'walk_3_4'
  | 'walk_5'
  | 'walk_strength_2'
  | 'walk_strength_3'
  | 'walk_20k_5';

export interface ProfileInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; factor: number }[] = [
  { id: 'none', label: 'Nada (sin caminata ni ejercicio)', factor: 1.15 },
  {
    id: 'walk_occasional',
    label: '10,000 pasos ocasional (2 días/semana)',
    factor: 1.275,
  },
  { id: 'walk_3_4', label: '10,000 pasos 3–4 días/semana', factor: 1.325 },
  { id: 'walk_5', label: '10,000 pasos 5 días/semana', factor: 1.375 },
  {
    id: 'walk_strength_2',
    label: '10,000 pasos + 2 sesiones de fuerza/semana',
    factor: 1.425,
  },
  {
    id: 'walk_strength_3',
    label: '10,000 pasos + 3 sesiones de fuerza/semana',
    factor: 1.475,
  },
  { id: 'walk_20k_5', label: '20,000 pasos 5 días/semana', factor: 1.6 },
];

const KCAL_PER_KG_FAT = 7700; // aprox. 1 kg de grasa corporal
const DEFAULT_PROTEIN_G_PER_KG = 1.8; // valor de respaldo; el real vive en el perfil del usuario y es configurable
const FAT_PCT_OF_KCAL = 0.30;
const FIBER_G_PER_1000KCAL = 30;
const MIN_SAFE_KCAL: Record<Sex, number> = { male: 1500, female: 1200 };

export function calculateBMR({ sex, age, heightCm, weightKg }: ProfileInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(input: ProfileInput): number {
  const factor = ACTIVITY_LEVELS.find((level) => level.id === input.activityLevel)?.factor ?? 1.15;
  return calculateBMR(input) * factor;
}

export interface Macros {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export const GOAL_KEYS = ['maintenance', 'deficit_0_5', 'deficit_0_8', 'deficit_1', 'recomp'] as const;
export type GoalKey = (typeof GOAL_KEYS)[number];

export const GOAL_LABELS: Record<GoalKey, string> = {
  maintenance: 'Mantenimiento',
  deficit_0_5: 'Déficit −0.5 kg/semana',
  deficit_0_8: 'Déficit −0.8 kg/semana',
  deficit_1: 'Déficit −1 kg/semana',
  recomp: 'Recomposición corporal',
};

export interface CalorieTarget {
  key: GoalKey;
  label: string;
  dailyKcal: number;
  weeklyKcal: number;
  macros: Macros;
  sodiumMaxMg?: number;
  warning?: string;
}

function buildMacros(dailyKcal: number, proteinGPerKg: number, weightKg: number): Macros {
  const proteinG = Math.round(proteinGPerKg * weightKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = dailyKcal * FAT_PCT_OF_KCAL;
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(dailyKcal - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbsKcal / 4);
  const fiberG = FIBER_G_PER_1000KCAL;
  return { proteinG, carbsG, fatG, fiberG };
}

function dailyDeficitFor(key: GoalKey, tdee: number): number {
  switch (key) {
    case 'maintenance':
      return 0;
    case 'deficit_0_5':
      return (KCAL_PER_KG_FAT * 0.5) / 7;
    case 'deficit_0_8':
      return (KCAL_PER_KG_FAT * 0.8) / 7;
    case 'deficit_1':
      return (KCAL_PER_KG_FAT * 1) / 7;
    case 'recomp':
      return tdee * 0.15;
    default:
      return 0;
  }
}

export interface RenalAdjustment {
  proteinGPerKg: number;
  sodiumMaxMg: number;
}

export function calculateCalorieTargets(
  input: ProfileInput,
  renalAdjustment?: RenalAdjustment | null,
  customProteinGPerKg?: number
): CalorieTarget[] {
  const tdee = calculateTDEE(input);
  const minSafe = MIN_SAFE_KCAL[input.sex];
  const proteinGPerKg = renalAdjustment
    ? renalAdjustment.proteinGPerKg
    : customProteinGPerKg ?? DEFAULT_PROTEIN_G_PER_KG;

  return GOAL_KEYS.map((key) => {
    const dailyDeficit = dailyDeficitFor(key, tdee);
    const rawKcal = Math.round(tdee - dailyDeficit);
    const dailyKcal = Math.max(rawKcal, Math.round(minSafe * 0.85));
    const warning =
      rawKcal < minSafe
        ? `Este objetivo se acerca o cae por debajo de un mínimo generalmente seguro (~${minSafe} kcal/día). Considera un déficit menor o supervisión profesional.`
        : undefined;

    return {
      key,
      label: GOAL_LABELS[key],
      dailyKcal,
      weeklyKcal: dailyKcal * 7,
      macros: buildMacros(dailyKcal, proteinGPerKg, input.weightKg),
      sodiumMaxMg: renalAdjustment?.sodiumMaxMg,
      warning,
    };
  });
}

export type DialysisModality = 'none' | 'hemodialysis' | 'peritoneal';

export interface RenalStage {
  id: string;
  tfgLabel: string;
  description: string;
  minGPerKg: number;
  maxGPerKg: number;
  sodiumMaxMg: number;
  note: string;
}

export const RENAL_STAGES: RenalStage[] = [
  {
    id: 'g1',
    tfgLabel: 'G1 · TFG ≥ 90',
    description: 'Normal o alta',
    minGPerKg: 0.8,
    maxGPerKg: 1.0,
    sodiumMaxMg: 2300,
    note: 'Sin restricción estricta si no hay proteinuria. Con un solo riñón, evita dietas hiperproteicas sostenidas.',
  },
  {
    id: 'g2',
    tfgLabel: 'G2 · TFG 60–89',
    description: 'Ligeramente disminuida',
    minGPerKg: 0.8,
    maxGPerKg: 1.0,
    sodiumMaxMg: 2300,
    note: 'Generalmente sin restricción; conviene monitorear la función renal periódicamente.',
  },
  {
    id: 'g3a',
    tfgLabel: 'G3a · TFG 45–59',
    description: 'Leve–moderadamente disminuida',
    minGPerKg: 0.6,
    maxGPerKg: 0.8,
    sodiumMaxMg: 2000,
    note: 'Restricción moderada recomendada, idealmente con seguimiento de nefrología o nutrición renal.',
  },
  {
    id: 'g3b',
    tfgLabel: 'G3b · TFG 30–44',
    description: 'Moderada–severamente disminuida',
    minGPerKg: 0.6,
    maxGPerKg: 0.8,
    sodiumMaxMg: 2000,
    note: 'Restricción moderada; vigilar el estado nutricional para evitar desnutrición proteica.',
  },
  {
    id: 'g4',
    tfgLabel: 'G4 · TFG 15–29',
    description: 'Severamente disminuida',
    minGPerKg: 0.55,
    maxGPerKg: 0.6,
    sodiumMaxMg: 2000,
    note: 'Restricción más estricta, idealmente bajo supervisión de nutrición renal (a veces con cetoanálogos).',
  },
  {
    id: 'g5',
    tfgLabel: 'G5 · TFG < 15',
    description: 'Fallo renal / insuficiencia renal avanzada',
    minGPerKg: 0.55,
    maxGPerKg: 0.6,
    sodiumMaxMg: 1500,
    note: 'Manejo conservador; requiere seguimiento estrecho por nefrología. Si ya está en diálisis, indícalo abajo: las necesidades de proteína cambian de forma importante.',
  },
];

const DIALYSIS_OVERRIDES: Record <
  Exclude<DialysisModality, 'none'>,
  { minGPerKg: number; maxGPerKg: number; sodiumMaxMg: number; note: string }
> = {
  hemodialysis: {
    minGPerKg: 1.0,
    maxGPerKg: 1.2,
    sodiumMaxMg: 2000,
    note: 'En hemodiálisis las necesidades de proteína aumentan por las pérdidas durante el tratamiento.',
  },
  peritoneal: {
    minGPerKg: 1.2,
    maxGPerKg: 1.3,
    sodiumMaxMg: 2000,
    note: 'En diálisis peritoneal la pérdida de proteína a través del líquido de diálisis es aún mayor.',
  },
};

export interface RenalResult {
  stage: RenalStage;
  dialysisModality: DialysisModality;
  minGPerKg: number;
  maxGPerKg: number;
  avgGPerKg: number;
  sodiumMaxMg: number;
  minProteinG: number;
  maxProteinG: number;
  note: string;
}

export function calculateRenalProtein(
  stageId: string,
  weightKg: number,
  dialysisModality: DialysisModality = 'none'
): RenalResult | null {
  const stage = RENAL_STAGES.find((s) => s.id === stageId);
  if (!stage || !weightKg || weightKg <= 0) return null;

  const override = stage.id === 'g5' && dialysisModality !== 'none' ? DIALYSIS_OVERRIDES[dialysisModality] : null;

  const minGPerKg = override?.minGPerKg ?? stage.minGPerKg;
  const maxGPerKg = override?.maxGPerKg ?? stage.maxGPerKg;
  const sodiumMaxMg = override?.sodiumMaxMg ?? stage.sodiumMaxMg;
  const avgGPerKg = (minGPerKg + maxGPerKg) / 2;

  return {
    stage,
    dialysisModality,
    minGPerKg,
    maxGPerKg,
    avgGPerKg,
    sodiumMaxMg,
    minProteinG: Math.round(minGPerKg * weightKg),
    maxProteinG: Math.round(maxGPerKg * weightKg),
    note: override?.note ?? stage.note,
  };
}