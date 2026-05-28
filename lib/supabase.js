import { createClient } from "@supabase/supabase-js";

let browserClient;

/**
 * Checks whether the public Supabase credentials are available in the current
 * environment. The app uses this flag to switch between demo mode and live mode.
 *
 * @returns {boolean}
 */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Creates a singleton browser client so every component shares the same
 * Supabase connection and auth session state.
 *
 * @returns {import("@supabase/supabase-js").SupabaseClient | null}
 */
export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return browserClient;
}

/**
 * Converts the richer in-memory analysis object into a payload that matches the
 * SQL column names used by the `bmi_histories` table.
 *
 * @param {import("@/lib/calculations").AnalysisResult} result
 * @returns {{
 *   height_cm: number,
 *   weight_kg: number,
 *   age: number,
 *   gender: string,
 *   activity_level: string,
 *   bmi_value: number,
 *   bmi_category: string,
 *   ideal_weight_kg: number,
 *   daily_calories: number,
 *   daily_protein_g: number,
 *   daily_fat_g: number
 * }}
 */
export function mapAnalysisToInsertPayload(result) {
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

/**
 * Converts one database row from `bmi_histories` back into the calculator input
 * shape so the app can rebuild a full analysis detail view from saved data.
 *
 * @param {{
 *   age: number,
 *   activity_level: string,
 *   gender: string,
 *   height_cm: number,
 *   weight_kg: number
 * }} record
 * @returns {{
 *   age: string,
 *   activityLevel: string,
 *   gender: string,
 *   heightCm: string,
 *   weightKg: string
 * }}
 */
export function mapHistoryRecordToCalculatorInput(record) {
  return {
    heightCm: String(record.height_cm),
    weightKg: String(record.weight_kg),
    age: String(record.age),
    gender: record.gender,
    activityLevel: record.activity_level,
  };
}
