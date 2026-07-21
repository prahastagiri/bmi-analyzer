export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type Gender = "male" | "female";

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

export interface CalculatorInput {
  heightCm: string | number;
  weightKg: string | number;
  age: string | number;
  gender: Gender;
  activityLevel: ActivityLevel;
}

export interface AnalysisResult {
  heightCm: number;
  heightM: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  bmi: number;
  bmiCategory: BmiCategory;
  idealWeightKg: number;
  idealWeightLowerKg: number;
  idealWeightUpperKg: number;
  bmr: number;
  activityMultiplier: number;
  calorieAdjustment: number;
  dailyCalories: number;
  proteinMultiplier: number;
  dailyProteinGrams: number;
  fatRatio: number;
  dailyFatGrams: number;
  dailyCarbGrams: number;
  maintenanceCalories: number;
  generatedAt: string;
}

export interface TargetEstimate {
  status: "in_range" | "no_timeline" | "direction_mismatch" | "ok";
  targetWeightKg: number | null;
  weightDeltaKg?: number;
  days?: number;
  weeks?: number;
  direction?: "lose" | "gain";
}

const NORMAL_BMI_MIN = 18.5;
const NORMAL_BMI_TARGET = 22;
const NORMAL_BMI_MAX = 24.9;

export const CALORIES_PER_KG = 7700;

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return "underweight";
  }

  if (bmi < 25) {
    return "normal";
  }

  if (bmi < 30) {
    return "overweight";
  }

  return "obese";
}

export function calculateIdealWeight(heightCm: number): number {
  const heightM = heightCm / 100;

  return NORMAL_BMI_TARGET * (heightM * heightM);
}

export function calculateIdealWeightRange(heightCm: number): {
  lower: number;
  upper: number;
} {
  const heightM = heightCm / 100;

  return {
    lower: NORMAL_BMI_MIN * (heightM * heightM),
    upper: NORMAL_BMI_MAX * (heightM * heightM),
  };
}

function getBaseCaloriesDelta(category: BmiCategory): number {
  switch (category) {
    case "underweight":
      return 300;
    case "overweight":
      return -300;
    case "obese":
      return -500;
    default:
      return 0;
  }
}

function getProteinMultiplier(category: BmiCategory): number {
  switch (category) {
    case "underweight":
      return 1.6;
    case "overweight":
      return 1.8;
    case "obese":
      return 2;
    default:
      return 1.4;
  }
}

function getFatRatio(category: BmiCategory): number {
  switch (category) {
    case "underweight":
      return 0.3;
    case "overweight":
      return 0.25;
    case "obese":
      return 0.22;
    default:
      return 0.27;
  }
}

function getMinimumCalories(gender: Gender): number {
  return gender === "female" ? 1200 : 1500;
}

function calculateBmr({
  weightKg,
  heightCm,
  age,
  gender,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
}): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  return gender === "female" ? base - 161 : base + 5;
}

export function calculateAnalysis(input: CalculatorInput): AnalysisResult {
  const heightCm = Number(input.heightCm);
  const weightKg = Number(input.weightKg);
  const age = Number(input.age);
  const gender = input.gender;
  const activityLevel = input.activityLevel;
  const activityMultiplier =
    ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiCategory = getBmiCategory(bmi);
  const idealWeightKg = calculateIdealWeight(heightCm);
  const idealWeightRange = calculateIdealWeightRange(heightCm);
  const bmr = calculateBmr({ weightKg, heightCm, age, gender });
  const maintenanceCalories = bmr * activityMultiplier;
  const calorieAdjustment = getBaseCaloriesDelta(bmiCategory);
  const proteinMultiplier = getProteinMultiplier(bmiCategory);
  const fatRatio = getFatRatio(bmiCategory);
  const adjustedCalories = Math.max(
    maintenanceCalories + calorieAdjustment,
    getMinimumCalories(gender)
  );
  const proteinGrams = idealWeightKg * proteinMultiplier;
  const fatGrams = (adjustedCalories * fatRatio) / 9;
  const carbGrams = Math.max(
    (adjustedCalories - proteinGrams * 4 - fatGrams * 9) / 4,
    0
  );

  return {
    heightCm,
    heightM,
    weightKg,
    age,
    gender,
    activityLevel,
    bmi,
    bmiCategory,
    idealWeightKg,
    idealWeightLowerKg: idealWeightRange.lower,
    idealWeightUpperKg: idealWeightRange.upper,
    bmr,
    activityMultiplier,
    calorieAdjustment,
    dailyCalories: adjustedCalories,
    proteinMultiplier,
    dailyProteinGrams: proteinGrams,
    fatRatio,
    dailyFatGrams: fatGrams,
    dailyCarbGrams: carbGrams,
    maintenanceCalories,
    generatedAt: new Date().toISOString(),
  };
}

export function estimateTimeToTarget(
  result: AnalysisResult,
  targetWeightKgOverride?: number
): TargetEstimate {
  const {
    weightKg,
    dailyCalories,
    maintenanceCalories,
    idealWeightLowerKg,
    idealWeightUpperKg,
    bmiCategory,
  } = result;

  const hasOverride =
    typeof targetWeightKgOverride === "number" &&
    Number.isFinite(targetWeightKgOverride) &&
    targetWeightKgOverride > 0;

  let targetWeightKg: number;

  if (hasOverride) {
    targetWeightKg = targetWeightKgOverride;
  } else if (bmiCategory === "normal") {
    return { status: "in_range", targetWeightKg: null };
  } else if (bmiCategory === "underweight") {
    targetWeightKg = idealWeightLowerKg;
  } else {
    targetWeightKg = idealWeightUpperKg;
  }

  const weightDeltaKg = targetWeightKg - weightKg;

  if (Math.abs(weightDeltaKg) < 0.1) {
    return { status: "in_range", targetWeightKg };
  }

  const effectiveDailyDelta = dailyCalories - maintenanceCalories;
  const dailyGap = Math.abs(effectiveDailyDelta);

  if (dailyGap < 1) {
    return { status: "no_timeline", targetWeightKg };
  }

  const needToLose = weightDeltaKg < 0;
  const planIsDeficit = effectiveDailyDelta < 0;

  if (needToLose !== planIsDeficit) {
    return { status: "direction_mismatch", targetWeightKg };
  }

  const energyKcal = Math.abs(weightDeltaKg) * CALORIES_PER_KG;
  const days = energyKcal / dailyGap;

  return {
    status: "ok",
    targetWeightKg,
    weightDeltaKg,
    days,
    weeks: days / 7,
    direction: needToLose ? "lose" : "gain",
  };
}

export function validateCalculatorInput(
  input: CalculatorInput
): string | null {
  const requiredFields: (keyof CalculatorInput)[] = [
    "heightCm",
    "weightKg",
    "age",
    "gender",
    "activityLevel",
  ];

  for (const field of requiredFields) {
    if (!input[field]) {
      return "Semua field wajib diisi sebelum menghitung BMI.";
    }
  }

  const numericFields: (keyof CalculatorInput)[] = [
    "heightCm",
    "weightKg",
    "age",
  ];

  for (const field of numericFields) {
    const value = Number(input[field]);

    if (Number.isNaN(value) || value <= 0) {
      return "Tinggi badan, berat badan, dan usia harus berupa angka positif.";
    }
  }

  if (Number(input.heightCm) < 100 || Number(input.heightCm) > 250) {
    return "Tinggi badan sebaiknya diisi dalam satuan cm yang realistis.";
  }

  if (Number(input.weightKg) < 20 || Number(input.weightKg) > 400) {
    return "Berat badan sebaiknya diisi dalam satuan kg yang realistis.";
  }

  if (Number(input.age) < 10 || Number(input.age) > 100) {
    return "Usia sebaiknya berada di rentang 10 sampai 100 tahun.";
  }

  return null;
}
