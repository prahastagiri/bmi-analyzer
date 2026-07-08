"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

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
import { Select } from "@/components/ui/select";

/**
 * Form section for collecting the user's body metrics and showing inline form
 * feedback such as validation errors, auth gating messages, and success state.
 *
 * @param {{
 *   authEnabled: boolean,
 *   error: string,
 *   form: {
 *     heightCm: string,
 *     weightKg: string,
 *     age: string,
 *     gender: string,
 *     activityLevel: string
 *   },
 *   loginHref: string,
 *   onCalculate: (event: import("react").FormEvent<HTMLFormElement>) => void,
 *   onReset: () => void,
 *   pendingAction: string,
 *   registerHref: string,
 *   status: string,
 *   updateField: (field: "heightCm" | "weightKg" | "age" | "gender" | "activityLevel", value: string) => void
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function BmiForm({
  authEnabled,
  error,
  form,
  loginHref,
  onCalculate,
  onReset,
  pendingAction,
  registerHref,
  status,
  updateField,
}) {
  return (
    <Card className="border-sky-100 shadow-lg shadow-sky-100/40">
      <CardHeader>
        <CardTitle>Input data tubuh</CardTitle>
        <CardDescription>
          Kamu bisa langsung menghitung tanpa login. Login hanya diperlukan
          saat ingin menyimpan atau mengekspor hasil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onCalculate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heightCm">Tinggi badan (cm)</Label>
              <Input
                id="heightCm"
                inputMode="decimal"
                placeholder="Contoh: 170"
                value={form.heightCm}
                onChange={(event) => updateField("heightCm", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightKg">Berat badan (kg)</Label>
              <Input
                id="weightKg"
                inputMode="decimal"
                placeholder="Contoh: 68"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Usia</Label>
              <Input
                id="age"
                inputMode="numeric"
                placeholder="Contoh: 27"
                value={form.age}
                onChange={(event) => updateField("age", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Jenis kelamin</Label>
              <Select
                id="gender"
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
              >
                <option value="male">Pria</option>
                <option value="female">Wanita</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityLevel">Tingkat aktivitas</Label>
            <Select
              id="activityLevel"
              value={form.activityLevel}
              onChange={(event) => updateField("activityLevel", event.target.value)}
            >
              <option value="sedentary">Jarang bergerak</option>
              <option value="lightly_active">Aktivitas ringan</option>
              <option value="moderately_active">Aktivitas sedang</option>
              <option value="very_active">Aktivitas tinggi</option>
              <option value="extra_active">Sangat aktif</option>
            </Select>
          </div>

          {!authEnabled ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Mode demo aktif. Fitur hitung tetap bisa dipakai, tetapi login,
              simpan hasil, history, dan export baru aktif setelah env Supabase
              diisi.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p>{error}</p>
              {pendingAction ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={loginHref}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-medium text-rose-700 ring-1 ring-rose-200"
                  >
                    <LogIn className="h-4 w-4" />
                    Login sekarang
                  </Link>
                  <Link
                    href={registerHref}
                    className="inline-flex items-center rounded-xl bg-rose-700 px-3 py-2 font-medium text-white"
                  >
                    Buat akun
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {status ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {status}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" className="sm:flex-1">
              Hitung BMI sekarang
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              onClick={onReset}
              className="sm:flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
