import { describe, expect, it } from "vitest";

import {
  CALORIES_PER_KG,
  calculateAnalysis,
  calculateIdealWeight,
  calculateIdealWeightRange,
  estimateTimeToTarget,
  getBmiCategory,
  validateCalculatorInput,
} from "./calculations";

/**
 * Builds a minimal AnalysisResult-like object with just the fields
 * `estimateTimeToTarget` reads, overridable per test.
 *
 * @param {Partial<import("./calculations").AnalysisResult>} overrides
 * @returns {import("./calculations").AnalysisResult}
 */
function makeResult(overrides) {
  return {
    weightKg: 90,
    dailyCalories: 2000,
    maintenanceCalories: 2500,
    idealWeightLowerKg: 60,
    idealWeightUpperKg: 80,
    bmiCategory: "overweight",
    ...overrides,
  };
}

describe("validateCalculatorInput", () => {
  it("returns null for valid input", () => {
    expect(
      validateCalculatorInput({
        heightCm: "170",
        weightKg: "68",
        age: "27",
        gender: "male",
        activityLevel: "moderately_active",
      })
    ).toBeNull();
  });

  it("returns message when a required field is missing", () => {
    expect(
      validateCalculatorInput({
        heightCm: "",
        weightKg: "68",
        age: "27",
        gender: "male",
        activityLevel: "moderately_active",
      })
    ).toMatch(/wajib/i);
  });
});

describe("getBmiCategory", () => {
  it("maps bmi to expected buckets", () => {
    expect(getBmiCategory(18.4)).toBe("underweight");
    expect(getBmiCategory(18.5)).toBe("normal");
    expect(getBmiCategory(24.9)).toBe("normal");
    expect(getBmiCategory(25)).toBe("overweight");
    expect(getBmiCategory(29.9)).toBe("overweight");
    expect(getBmiCategory(30)).toBe("obese");
  });
});

describe("ideal weight helpers", () => {
  it("calculateIdealWeight uses BMI 22 target", () => {
    const heightCm = 170;
    const expected = 22 * (1.7 * 1.7);
    expect(calculateIdealWeight(heightCm)).toBeCloseTo(expected, 10);
  });

  it("calculateIdealWeightRange returns normal BMI boundaries", () => {
    const heightCm = 170;
    const range = calculateIdealWeightRange(heightCm);
    expect(range.lower).toBeCloseTo(18.5 * (1.7 * 1.7), 10);
    expect(range.upper).toBeCloseTo(24.9 * (1.7 * 1.7), 10);
    expect(range.lower).toBeLessThan(range.upper);
  });
});

describe("calculateAnalysis", () => {
  it("computes BMI, BMR, and macro targets consistently", () => {
    const result = calculateAnalysis({
      heightCm: 170,
      weightKg: 68,
      age: 27,
      gender: "male",
      activityLevel: "moderately_active",
    });

    expect(result.heightM).toBeCloseTo(1.7, 10);
    expect(result.bmi).toBeCloseTo(68 / (1.7 * 1.7), 10);
    expect(result.bmiCategory).toBe(getBmiCategory(result.bmi));

    const expectedBmr = 10 * 68 + 6.25 * 170 - 5 * 27 + 5;
    expect(result.bmr).toBeCloseTo(expectedBmr, 10);

    expect(result.activityMultiplier).toBeCloseTo(1.55, 10);
    expect(result.maintenanceCalories).toBeCloseTo(result.bmr * 1.55, 10);

    expect(result.dailyCalories).toBeGreaterThanOrEqual(1500);
    expect(result.dailyProteinGrams).toBeGreaterThan(0);
    expect(result.dailyFatGrams).toBeGreaterThan(0);
    expect(result.dailyCarbGrams).toBeGreaterThan(0);
  });

  it("derives carbs from the calories left after protein and fat", () => {
    const result = calculateAnalysis({
      heightCm: 170,
      weightKg: 68,
      age: 27,
      gender: "male",
      activityLevel: "moderately_active",
    });

    const expectedCarbGrams =
      (result.dailyCalories -
        result.dailyProteinGrams * 4 -
        result.dailyFatGrams * 9) /
      4;

    expect(result.dailyCarbGrams).toBeCloseTo(expectedCarbGrams, 10);
  });

  it("never returns a negative carb target", () => {
    const result = calculateAnalysis({
      heightCm: 150,
      weightKg: 120,
      age: 27,
      gender: "male",
      activityLevel: "sedentary",
    });

    expect(result.dailyCarbGrams).toBeGreaterThanOrEqual(0);
  });

  it("applies BMI-category calorie adjustments (underweight adds calories)", () => {
    const result = calculateAnalysis({
      heightCm: 170,
      weightKg: 45,
      age: 27,
      gender: "male",
      activityLevel: "sedentary",
    });

    expect(result.bmiCategory).toBe("underweight");
    expect(result.calorieAdjustment).toBe(300);
    expect(result.dailyCalories).toBeGreaterThanOrEqual(1500);
  });

  it("applies BMI-category calorie adjustments (obese reduces calories)", () => {
    const result = calculateAnalysis({
      heightCm: 170,
      weightKg: 120,
      age: 27,
      gender: "male",
      activityLevel: "sedentary",
    });

    expect(result.bmiCategory).toBe("obese");
    expect(result.calorieAdjustment).toBe(-500);
    expect(result.dailyCalories).toBeGreaterThanOrEqual(1500);
  });
});

describe("estimateTimeToTarget", () => {
  it("returns in_range for the normal category with no personal target", () => {
    const estimate = estimateTimeToTarget(makeResult({ bmiCategory: "normal" }));
    expect(estimate.status).toBe("in_range");
    expect(estimate.targetWeightKg).toBeNull();
  });

  it("projects weight loss for overweight toward the upper normal boundary", () => {
    // 90kg -> 80kg = 10kg; deficit 2500-2000 = 500 kcal/day.
    const estimate = estimateTimeToTarget(
      makeResult({
        weightKg: 90,
        idealWeightUpperKg: 80,
        maintenanceCalories: 2500,
        dailyCalories: 2000,
      })
    );

    expect(estimate.status).toBe("ok");
    expect(estimate.direction).toBe("lose");
    expect(estimate.targetWeightKg).toBe(80);
    expect(estimate.weightDeltaKg).toBeCloseTo(-10, 10);
    expect(estimate.days).toBeCloseTo((10 * CALORIES_PER_KG) / 500, 10);
    expect(estimate.weeks).toBeCloseTo((10 * CALORIES_PER_KG) / 500 / 7, 10);
  });

  it("projects weight gain for underweight toward the lower normal boundary", () => {
    // 50kg -> 55kg = 5kg; surplus 2100-1800 = 300 kcal/day.
    const estimate = estimateTimeToTarget(
      makeResult({
        weightKg: 50,
        bmiCategory: "underweight",
        idealWeightLowerKg: 55,
        maintenanceCalories: 1800,
        dailyCalories: 2100,
      })
    );

    expect(estimate.status).toBe("ok");
    expect(estimate.direction).toBe("gain");
    expect(estimate.targetWeightKg).toBe(55);
    expect(estimate.days).toBeCloseTo((5 * CALORIES_PER_KG) / 300, 10);
  });

  it("returns no_timeline when daily calories equal maintenance", () => {
    const estimate = estimateTimeToTarget(
      makeResult({ dailyCalories: 2500, maintenanceCalories: 2500 })
    );
    expect(estimate.status).toBe("no_timeline");
    expect(estimate.targetWeightKg).toBe(80);
  });

  it("uses a personal target override even for the normal category", () => {
    // Normal-category user who wants to slim to 60kg from 70kg with a deficit.
    const estimate = estimateTimeToTarget(
      makeResult({
        weightKg: 70,
        bmiCategory: "normal",
        maintenanceCalories: 2400,
        dailyCalories: 1900,
      }),
      60
    );

    expect(estimate.status).toBe("ok");
    expect(estimate.direction).toBe("lose");
    expect(estimate.targetWeightKg).toBe(60);
    expect(estimate.days).toBeCloseTo((10 * CALORIES_PER_KG) / 500, 10);
  });

  it("flags a direction mismatch when the plan pushes the opposite way", () => {
    // Target is to lose (60 < 70) but the plan is a surplus.
    const estimate = estimateTimeToTarget(
      makeResult({
        weightKg: 70,
        bmiCategory: "normal",
        maintenanceCalories: 2000,
        dailyCalories: 2300,
      }),
      60
    );
    expect(estimate.status).toBe("direction_mismatch");
    expect(estimate.targetWeightKg).toBe(60);
  });

  it("treats a weight already at target as in_range", () => {
    const estimate = estimateTimeToTarget(
      makeResult({ weightKg: 80, idealWeightUpperKg: 80 })
    );
    expect(estimate.status).toBe("in_range");
  });
});

