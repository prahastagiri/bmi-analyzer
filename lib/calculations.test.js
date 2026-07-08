import { describe, expect, it } from "vitest";

import {
  calculateAnalysis,
  calculateIdealWeight,
  calculateIdealWeightRange,
  getBmiCategory,
  validateCalculatorInput,
} from "./calculations";

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

