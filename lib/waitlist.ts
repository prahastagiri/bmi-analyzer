import { createSupabaseBrowserClient } from "@/lib/supabase";

/** Hasil pendaftaran waitlist premium. */
export type JoinWaitlistResult =
  | { status: "ok" }
  | { status: "already" }
  | { status: "error"; message: string };

/**
 * Mendaftarkan email ke waitlist premium (Fase 3 — belum ada pembayaran).
 * Tidak membaca kembali baris (tabel waitlist tidak punya policy SELECT untuk
 * client). Email duplikat ditangani sebagai `already`, bukan error.
 *
 * @param email Email yang ingin didaftarkan.
 * @param userId Id user bila sedang login (opsional).
 */
export async function joinWaitlist(
  email: string,
  userId?: string | null
): Promise<JoinWaitlistResult> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Layanan belum siap. Coba lagi beberapa saat.",
    };
  }

  const { error } = await supabase.from("waitlist").insert({
    email: email.trim().toLowerCase(),
    user_id: userId ?? null,
  });

  if (error) {
    // 23505 = unique_violation → email sudah terdaftar sebelumnya.
    if (error.code === "23505") {
      return { status: "already" };
    }

    console.error("Gagal mendaftar waitlist:", error);
    return {
      status: "error",
      message: "Gagal mendaftar. Coba lagi beberapa saat.",
    };
  }

  return { status: "ok" };
}
