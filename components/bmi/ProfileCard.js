"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveProfile } from "@/lib/profile";

/**
 * Editor for the user's display name and optional personal target weight. The
 * target overrides the default (nearest normal-BMI boundary) in the time-to-
 * target estimate. Leaving the target empty keeps the default behaviour.
 *
 * @param {{
 *   userId: string,
 *   initialProfile: import("@/lib/profile").Profile | null,
 *   onSaved: (profile: import("@/lib/profile").Profile) => void
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function ProfileCard({ userId, initialProfile, onSaved }) {
  const [displayName, setDisplayName] = useState(
    initialProfile?.display_name ?? ""
  );
  const [targetWeight, setTargetWeight] = useState(
    initialProfile?.target_weight_kg != null
      ? String(initialProfile.target_weight_kg)
      : ""
  );
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  /**
   * Validates and persists the profile.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    const trimmedName = displayName.trim();
    const rawTarget = targetWeight.trim();
    let targetWeightKg = null;

    if (rawTarget !== "") {
      const parsed = Number(rawTarget);

      if (Number.isNaN(parsed) || parsed <= 0) {
        setError("Target berat harus berupa angka positif, atau kosongkan.");
        return;
      }

      if (parsed < 20 || parsed > 400) {
        setError("Target berat sebaiknya berada di rentang 20 sampai 400 kg.");
        return;
      }

      targetWeightKg = parsed;
    }

    try {
      setSaving(true);
      const saved = await saveProfile(userId, {
        displayName: trimmedName || null,
        targetWeightKg,
      });
      setStatus("Profil tersimpan.");
      onSaved(saved);
    } catch (saveError) {
      console.error("Gagal menyimpan profil:", saveError);
      setError(
        "Profil gagal disimpan. Coba lagi beberapa saat — jika masih gagal, muat ulang halaman."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil & target</CardTitle>
        <CardDescription>
          Nama tampilan dan target berat pribadi. Target dipakai untuk
          memperkirakan waktu menuju berat itu — kosongkan untuk memakai batas
          zona BMI normal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nama tampilan</Label>
              <Input
                id="displayName"
                placeholder="Misal: Giri"
                value={displayName}
                maxLength={60}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target berat (kg, opsional)</Label>
              <Input
                id="targetWeight"
                inputMode="decimal"
                placeholder="Misal: 68"
                value={targetWeight}
                onChange={(event) => setTargetWeight(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {status ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </div>
          ) : null}

          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan profil"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
