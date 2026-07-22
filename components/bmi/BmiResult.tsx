"use client";

import type { RefObject } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { BmiFormulaSection } from "@/components/bmi/BmiFormulaSection";
import type { AnalysisResult, TargetEstimate } from "@/lib/calculations";
import { estimateTimeToTarget } from "@/lib/calculations";
import {
  buildSummary,
  formatTargetDuration,
  getActivityLabel,
} from "@/lib/explanations";
import { formatNumber } from "@/lib/utils";

const badgeVariantByCategory: Record<
  string,
  "warning" | "success" | "danger"
> = {
  underweight: "warning",
  normal: "success",
  overweight: "warning",
  obese: "danger",
};

interface CategoryContent {
  label: string;
  summary: string;
  tips: string[];
}

interface BmiResultProps {
  categoryContent: CategoryContent | null;
  premium?: boolean;
  result: AnalysisResult | null;
  resultRef: RefObject<HTMLDivElement | null>;
  targetWeightKg?: number;
}

export function BmiResult({
  categoryContent,
  premium = false,
  result,
  resultRef,
  targetWeightKg,
}: BmiResultProps) {
  const estimate = result
    ? estimateTimeToTarget(result, targetWeightKg)
    : null;
  return (
    <div ref={resultRef}>
      <Card className="overflow-hidden shadow-lg shadow-slate-200/70">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80">
          <CardTitle>Ringkasan hasil</CardTitle>
          <CardDescription>
            {result
              ? `Aktivitas ${getActivityLabel(result.activityLevel)} dengan target nutrisi harian yang bisa langsung dipakai sebagai panduan.`
              : "Hasil analisis akan muncul di sini setelah kamu mengisi form."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {result && categoryContent ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Nilai BMI</p>
                  <p className="text-4xl font-bold tracking-tight text-slate-950">
                    {formatNumber(result.bmi)}
                  </p>
                </div>
                <Badge variant={badgeVariantByCategory[result.bmiCategory]}>
                  {categoryContent.label}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Target berat ideal"
                  value={`${formatNumber(result.idealWeightKg)} kg`}
                />
                <MetricCard
                  label="Range berat ideal"
                  value={`${formatNumber(result.idealWeightLowerKg)} - ${formatNumber(result.idealWeightUpperKg)} kg`}
                />
                <MetricCard
                  label="Kalori harian"
                  value={`${Math.round(result.dailyCalories)} kkal`}
                />
                <MetricCard
                  label="Protein harian"
                  value={`${formatNumber(result.dailyProteinGrams)} gram`}
                />
                <MetricCard
                  label="Lemak harian"
                  value={`${formatNumber(result.dailyFatGrams)} gram`}
                />
                <MetricCard
                  label="Karbohidrat harian"
                  value={`${formatNumber(result.dailyCarbGrams)} gram`}
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-950">Interpretasi</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {buildSummary(result)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Untuk tinggi badanmu, rentang berat yang masih masuk kategori
                  BMI normal adalah sekitar{" "}
                  <span className="font-semibold text-slate-950">
                    {formatNumber(result.idealWeightLowerKg)} kg sampai{" "}
                    {formatNumber(result.idealWeightUpperKg)} kg
                  </span>
                  .
                </p>
              </div>

              {estimate && premium ? (
                <TargetEstimateSection
                  estimate={estimate}
                  result={result}
                  isOverride={Boolean(targetWeightKg)}
                />
              ) : null}

              {estimate && !premium ? <TargetEstimateLocked /> : null}

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <h3 className="font-semibold text-slate-950">
                  Tips untuk langkah berikutnya
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  {categoryContent.tips.map((tip) => (
                    <li key={tip} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-sky-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <BmiFormulaSection result={result} />

              <p className="text-xs leading-5 text-slate-500">
                Semua hasil bersifat estimasi untuk kebutuhan edukasi awal.
                Gunakan sebagai panduan umum, bukan pengganti konsultasi medis.
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
              Isi data tubuh lalu klik tombol hitung untuk melihat hasil BMI,
              target kalori, protein, dan lemak harianmu.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TargetEstimateSectionProps {
  estimate: TargetEstimate;
  result: AnalysisResult;
  isOverride: boolean;
}

function TargetEstimateSection({ estimate, result, isOverride }: TargetEstimateSectionProps) {
  if (estimate.status === "in_range") {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <h3 className="font-semibold text-slate-950">Estimasi menuju target</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isOverride
            ? "Beratmu sudah berada di target yang kamu tetapkan. Fokus menjaga pola makan dan aktivitas agar tetap stabil."
            : "Beratmu sudah berada di zona BMI sehat. Fokus mempertahankannya lewat pola makan dan aktivitas yang konsisten."}
        </p>
      </div>
    );
  }

  if (estimate.status === "no_timeline") {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <h3 className="font-semibold text-slate-950">Estimasi menuju target</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kalori harianmu saat ini setara kebutuhan pemeliharaan, jadi berat
          cenderung stabil. Sesuaikan target kalori bila ingin menaikkan atau
          menurunkan berat menuju{" "}
          <span className="font-semibold text-slate-950">
            {formatNumber(estimate.targetWeightKg!)} kg
          </span>
          .
        </p>
      </div>
    );
  }

  if (estimate.status === "direction_mismatch") {
    const wantsToLose = estimate.targetWeightKg! < result.weightKg;

    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <h3 className="font-semibold text-slate-950">Estimasi menuju target</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Target beratmu ({formatNumber(estimate.targetWeightKg!)} kg) mengarah ke{" "}
          {wantsToLose ? "penurunan" : "kenaikan"} berat, tetapi kalori harianmu
          saat ini justru {wantsToLose ? "di atas" : "di bawah"} kebutuhan
          pemeliharaan. Sesuaikan asupan agar sejalan dengan target.
        </p>
      </div>
    );
  }

  const verb = estimate.direction === "lose" ? "menurunkan" : "menaikkan";
  const absDelta = Math.abs(estimate.weightDeltaKg!);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4">
      <h3 className="font-semibold text-slate-950">Estimasi menuju target</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Dengan pola kalori ini, perkiraan{" "}
        <span className="font-semibold text-slate-950">
          {formatTargetDuration(estimate.weeks!)}
        </span>{" "}
        untuk {verb} berat dari {formatNumber(result.weightKg)} kg ke{" "}
        <span className="font-semibold text-slate-950">
          {formatNumber(estimate.targetWeightKg!)} kg
        </span>{" "}
        (sekitar {formatNumber(absDelta)} kg).
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Estimasi kasar berbasis 7.700 kkal/kg dan mengasumsikan pola kalori
        dijaga konsisten. Perubahan berat nyata bisa berbeda.
      </p>
    </div>
  );
}

/**
 * Teaser premium untuk estimasi waktu ke target. Ditampilkan ke pengguna free
 * di posisi yang sama dengan estimasi asli, mengajak upgrade tanpa membocorkan
 * angkanya.
 */
function TargetEstimateLocked() {
  return (
    <Link
      href="/upgrade"
      className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
    >
      <h3 className="flex items-center gap-2 font-semibold text-slate-950">
        <Sparkles className="h-4 w-4 text-amber-600" />
        Estimasi menuju target
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Perkiraan berapa lama mencapai berat target dari pola kalorimu adalah
        fitur premium.{" "}
        <span className="font-semibold text-amber-800">Lihat premium →</span>
      </p>
    </Link>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
