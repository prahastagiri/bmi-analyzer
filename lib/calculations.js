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

/**
 * Energi kira-kira yang tersimpan/dilepas per kilogram jaringan tubuh (kkal/kg).
 * Dipakai untuk memperkirakan waktu menuju berat target.
 */
export const CALORIES_PER_KG = 7700;

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
 * @typedef {Object} TargetEstimate
 * @property {"in_range" | "no_timeline" | "direction_mismatch" | "ok"} status
 *   `in_range`: berat sudah di zona normal (atau tepat di target). `no_timeline`:
 *   kalori harian setara pemeliharaan sehingga tidak ada defisit/surplus.
 *   `direction_mismatch`: rencana kalori mendorong ke arah berlawanan dari target
 *   (mis. target menurunkan berat tetapi rencana surplus). `ok`: estimasi tersedia.
 * @property {number | null} targetWeightKg Berat target yang dipakai (kg).
 * @property {number} [weightDeltaKg] Selisih bertanda target − berat sekarang.
 * @property {number} [days] Estimasi jumlah hari menuju target.
 * @property {number} [weeks] Estimasi jumlah minggu menuju target.
 * @property {"lose" | "gain"} [direction] Arah perubahan berat.
 */

/**
 * Memperkirakan waktu untuk mencapai berat target dari rencana kalori harian.
 *
 * Prinsip: pakai **defisit/surplus efektif** `dailyCalories − maintenanceCalories`
 * (bukan `calorieAdjustment` mentah, karena kalori harian bisa terkena batas
 * minimum sehingga selisih sebenarnya berbeda). Energi per kg = 7.700 kkal.
 *
 * Target default = batas zona normal terdekat: underweight → batas bawah,
 * overweight/obese → batas atas. Kategori normal dianggap sudah di range kecuali
 * ada target pribadi (`targetWeightKgOverride`) yang diberikan pengguna.
 *
 * @param {AnalysisResult} result
 * @param {number} [targetWeightKgOverride] Target berat pribadi (kg), opsional.
 * @returns {TargetEstimate}
 */
export function estimateTimeToTarget(result, targetWeightKgOverride) {
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

  let targetWeightKg;

  if (hasOverride) {
    targetWeightKg = targetWeightKgOverride;
  } else if (bmiCategory === "normal") {
    return { status: "in_range", targetWeightKg: null };
  } else if (bmiCategory === "underweight") {
    targetWeightKg = idealWeightLowerKg;
  } else {
    // overweight / obese
    targetWeightKg = idealWeightUpperKg;
  }

  const weightDeltaKg = targetWeightKg - weightKg;

  // Sudah pada (atau praktis pada) target — anggap sudah di range.
  if (Math.abs(weightDeltaKg) < 0.1) {
    return { status: "in_range", targetWeightKg };
  }

  const effectiveDailyDelta = dailyCalories - maintenanceCalories;
  const dailyGap = Math.abs(effectiveDailyDelta);

  // Kalori harian setara pemeliharaan → tidak ada perubahan berat terproyeksi.
  if (dailyGap < 1) {
    return { status: "no_timeline", targetWeightKg };
  }

  const needToLose = weightDeltaKg < 0;
  const planIsDeficit = effectiveDailyDelta < 0;

  // Rencana kalori mendorong arah berlawanan dari target.
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
