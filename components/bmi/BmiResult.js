"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BmiFormulaSection } from "@/components/bmi/BmiFormulaSection";
import { buildSummary, getActivityLabel } from "@/lib/explanations";
import { formatNumber } from "@/lib/utils";

const badgeVariantByCategory = {
  underweight: "warning",
  normal: "success",
  overweight: "warning",
  obese: "danger",
};

/**
 * Displays the computed BMI analysis, narrative summary, and practical tips.
 * The outer wrapper receives a DOM ref so the current result can be exported.
 *
 * @param {{
 *   categoryContent: { label: string, summary: string, tips: string[] } | null,
 *   result: import("@/lib/calculations").AnalysisResult | null,
 *   resultRef: import("react").RefObject<HTMLDivElement | null>
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function BmiResult({ categoryContent, result, resultRef }) {
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

/**
 * Small presentational card used to display one metric from the analysis.
 *
 * @param {{ label: string, value: string }} props
 * @returns {import("react").JSX.Element}
 */
function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
