import { createSupabaseBrowserClient } from "@/lib/supabase";

export interface Profile {
  id: string;
  display_name: string | null;
  target_weight_kg: number | null;
  updated_at?: string;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
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
    .select("id, display_name, target_weight_kg")
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}
