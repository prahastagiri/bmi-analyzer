/**
 * @typedef {"sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active"} ActivityLevel
 */

/**
 * @typedef {"male" | "female"} Gender
 */

/**
 * @typedef {"underweight" | "normal" | "overweight" | "obese"} BmiCategory
 */

/**
 * Raw input shape used by the calculator form before the values are normalized.
 *
 * @typedef {Object} CalculatorInput
 * @property {string | number} heightCm
 * @property {string | number} weightKg
 * @property {string | number} age
 * @property {Gender} gender
 * @property {ActivityLevel} activityLevel
 */

/**
 * Normalized analysis object returned by the calculator logic.
 *
 * @typedef {Object} AnalysisResult
 * @property {number} heightCm
 * @property {number} heightM
 * @property {number} weightKg
 * @property {number} age
 * @property {Gender} gender
 * @property {ActivityLevel} activityLevel
 * @property {number} bmi
 * @property {BmiCategory} bmiCategory
 * @property {number} idealWeightKg
 * @property {number} idealWeightLowerKg
 * @property {number} idealWeightUpperKg
 * @property {number} bmr
 * @property {number} activityMultiplier
 * @property {number} calorieAdjustment
 * @property {number} dailyCalories
 * @property {number} proteinMultiplier
 * @property {number} dailyProteinGrams
 * @property {number} fatRatio
 * @property {number} dailyFatGrams
 * @property {number} dailyCarbGrams
 * @property {number} maintenanceCalories
 * @property {string} generatedAt
 */

const NORMAL_BMI_MIN = 18.5;
const NORMAL_BMI_TARGET = 22;
const NORMAL_BMI_MAX = 24.9;

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

/**
 * Maps a BMI number to the category used by the UI and recommendation copy.
 *
 * @param {number} bmi
 * @returns {BmiCategory}
 */
export function getBmiCategory(bmi) {
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

/**
 * Uses BMI 22 as the target reference for "ideal" weight.
 *
 * @param {number} heightCm
 * @returns {number}
 */
export function calculateIdealWeight(heightCm) {
  const heightM = heightCm / 100;

  return NORMAL_BMI_TARGET * (heightM * heightM);
}

/**
 * Returns the lower and upper body-weight boundaries that still fall inside the
 * normal BMI range for a given height.
 *
 * @param {number} heightCm
 * @returns {{ lower: number, upper: number }}
 */
export function calculateIdealWeightRange(heightCm) {
  const heightM = heightCm / 100;

  return {
    lower: NORMAL_BMI_MIN * (heightM * heightM),
    upper: NORMAL_BMI_MAX * (heightM * heightM),
  };
}

/**
 * Applies a small calorie adjustment based on the user's BMI category so the
 * final recommendation nudges the user toward maintaining, gaining, or losing
 * weight gradually.
 *
 * @param {BmiCategory} category
 * @returns {number}
 */
function getBaseCaloriesDelta(category) {
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

/**
 * Adjusts protein needs using a simple ruleset that favors a higher protein
 * target when the user is trying to gain or reduce weight.
 *
 * @param {BmiCategory} category
 * @returns {number}
 */
function getProteinMultiplier(category) {
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

/**
 * Splits daily calories into a fat target ratio.
 *
 * @param {BmiCategory} category
 * @returns {number}
 */
function getFatRatio(category) {
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

/**
 * Adds a simple calorie floor to avoid unrealistic recommendations.
 *
 * @param {Gender} gender
 * @returns {number}
 */
function getMinimumCalories(gender) {
  return gender === "female" ? 1200 : 1500;
}

/**
 * Calculates Basal Metabolic Rate with the Mifflin-St Jeor formula.
 *
 * @param {{ weightKg: number, heightCm: number, age: number, gender: Gender }} params
 * @returns {number}
 */
function calculateBmr({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  return gender === "female" ? base - 161 : base + 5;
}

/**
 * Normalizes the raw form input and produces the full analysis object consumed
 * by the result card, persistence layer, and recommendation copy.
 *
 * @param {CalculatorInput} input
 * @returns {AnalysisResult}
 */
export function calculateAnalysis(input) {
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
  // Carbohydrates take whatever daily calories remain after protein (4 kcal/g)
  // and fat (9 kcal/g) are covered. Clamp at zero so an aggressive protein/fat
  // split can never produce a negative carb target.
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

/**
 * Performs frontend validation before any calculation happens so the component
 * can show a single friendly error message to the user.
 *
 * @param {CalculatorInput} input
 * @returns {string | null}
 */
export function validateCalculatorInput(input) {
  const requiredFields = [
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

  const numericFields = ["heightCm", "weightKg", "age"];

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
