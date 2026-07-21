/**
 * Sumber kebenaran tunggal untuk tier free vs premium HealthyMuch (Fase 3).
 * Batas & fitur didefinisikan di sini agar UI dan (nanti) enforcement DB
 * merujuk angka yang sama. Belum ada pembayaran — premium diset manual sampai
 * Fase 4.
 */

import type { Profile } from "@/lib/profile";

export type Plan = "free" | "premium";

/** Jumlah maksimum hasil BMI yang bisa disimpan pengguna free. */
export const FREE_SAVE_LIMIT = 10;

/** Rentang hari grafik tren untuk pengguna free (premium: tanpa batas). */
export const FREE_CHART_DAYS = 30;

/** Harga premium untuk ditampilkan di halaman /upgrade (belum ada checkout). */
export const PREMIUM_PRICE_IDR = 15000;
export const PREMIUM_PRICE_LABEL = "Rp 15.000 / bulan";

/**
 * Fitur yang hanya terbuka untuk premium. Dipakai UI untuk mengunci tombol dan
 * (opsional) sebagai kunci analytics.
 */
export type PremiumFeature =
  | "export"
  | "target_estimate"
  | "unlimited_history"
  | "unlimited_chart";

export const PREMIUM_FEATURES: Record<
  PremiumFeature,
  { title: string; description: string }
> = {
  export: {
    title: "Export JPG & PDF",
    description: "Unduh kartu hasil sebagai gambar atau PDF untuk dibagikan.",
  },
  target_estimate: {
    title: "Estimasi waktu ke target",
    description:
      "Perkiraan berapa lama mencapai berat target dari pola kalorimu.",
  },
  unlimited_history: {
    title: "Riwayat tanpa batas",
    description: `Simpan lebih dari ${FREE_SAVE_LIMIT} hasil tanpa perlu menghapus yang lama.`,
  },
  unlimited_chart: {
    title: "Grafik tren penuh",
    description: `Lihat seluruh riwayat, bukan hanya ${FREE_CHART_DAYS} hari terakhir.`,
  },
};

/**
 * Menentukan apakah sebuah profil berstatus premium aktif. Premium berlaku bila
 * `plan === "premium"` DAN belum kedaluwarsa (`valid_until` kosong = selamanya,
 * atau masih di masa depan). Profil `null` (belum ada baris) dianggap free.
 */
export function isPremium(profile: Profile | null | undefined): boolean {
  if (!profile || profile.plan !== "premium") {
    return false;
  }

  if (!profile.valid_until) {
    return true;
  }

  return new Date(profile.valid_until).getTime() > Date.now();
}

/**
 * Batas simpan efektif untuk sebuah profil: premium tidak dibatasi
 * (`Infinity`), free dibatasi `FREE_SAVE_LIMIT`.
 */
export function saveLimitFor(profile: Profile | null | undefined): number {
  return isPremium(profile) ? Infinity : FREE_SAVE_LIMIT;
}
