import { createSupabaseBrowserClient } from "@/lib/supabase";

export interface Profile {
  id: string;
  display_name: string | null;
  target_weight_kg: number | null;
  /** Tier langganan. Default 'free' di DB. Lihat lib/tiers.ts. */
  plan: "free" | "premium";
  /** Kapan premium berakhir; null = tanpa batas (atau tidak relevan untuk free). */
  valid_until: string | null;
  updated_at?: string;
}

/** Kolom profil yang selalu diambil, termasuk field entitlement (Fase 3). */
const PROFILE_COLUMNS = "id, display_name, target_weight_kg, plan, valid_until";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile | null) ?? null;
}

export async function saveProfile(
  userId: string,
  {
    displayName,
    targetWeightKg,
  }: { displayName: string | null; targetWeightKg: number | null }
): Promise<Profile> {
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
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}
