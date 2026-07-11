import { createSupabaseBrowserClient } from "@/lib/supabase";

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string | null} display_name
 * @property {number | null} target_weight_kg
 * @property {string} [updated_at]
 */

/**
 * Loads the current user's profile row. Returns `null` when no row exists yet
 * (the user has never saved a profile) so callers can fall back to defaults.
 *
 * @param {string} userId
 * @returns {Promise<Profile | null>}
 */
export async function fetchProfile(userId) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, target_weight_kg")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

/**
 * Creates or updates the current user's profile.
 *
 * @param {string} userId
 * @param {{ displayName: string | null, targetWeightKg: number | null }} values
 * @returns {Promise<Profile>}
 */
export async function saveProfile(userId, { displayName, targetWeightKg }) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase client tidak tersedia.");
  }

  const payload = {
    id: userId,
    display_name: displayName,
    target_weight_kg: targetWeightKg,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload)
    .select("id, display_name, target_weight_kg")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
