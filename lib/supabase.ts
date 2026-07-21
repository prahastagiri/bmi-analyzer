import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { AnalysisResult } from "@/lib/calculations";

let browserClient: SupabaseClient | null = null;

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}

export interface BmiHistoryInsertPayload {
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  activity_level: string;
  bmi_value: number;
  bmi_category: string;
  ideal_weight_kg: number;
  daily_calories: number;
  daily_protein_g: number;
  daily_fat_g: number;
}

export function mapAnalysisToInsertPayload(
  result: AnalysisResult
): BmiHistoryInsertPayload {
  return {
    height_cm: result.heightCm,
    weight_kg: result.weightKg,
    age: result.age,
    gender: result.gender,
    activity_level: result.activityLevel,
    bmi_value: Number(result.bmi.toFixed(2)),
    bmi_category: result.bmiCategory,
    ideal_weight_kg: Number(result.idealWeightKg.toFixed(2)),
    daily_calories: Math.round(result.dailyCalories),
    daily_protein_g: Number(result.dailyProteinGrams.toFixed(1)),
    daily_fat_g: Number(result.dailyFatGrams.toFixed(1)),
  };
}

export interface BmiHistoryRecord {
  id: string;
  user_id: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: string;
  activity_level: string;
  bmi_value: number;
  bmi_category: string;
  ideal_weight_kg: number;
  daily_calories: number;
  daily_protein_g: number;
  daily_fat_g: number;
  created_at: string;
}

export function mapHistoryRecordToCalculatorInput(record: BmiHistoryRecord): {
  age: string;
  activityLevel: string;
  gender: string;
  heightCm: string;
  weightKg: string;
} {
  return {
    heightCm: String(record.height_cm),
    weightKg: String(record.weight_kg),
    age: String(record.age),
    gender: record.gender,
    activityLevel: record.activity_level,
  };
}
