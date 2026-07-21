"use client";

import { ChevronDown, Sigma } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/calculations";

interface FormulaItem {
  title: string;
  formula: string;
  calculation: string;
  result: string;
  description: string;
}

function formatFormulaNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatSignedNumber(value: number, digits = 0): string {
  if (value === 0) {
    return "0";
  }

  const absolute = formatFormulaNumber(Math.abs(value), digits);

  return value > 0 ? `+ ${absolute}` : `- ${absolute}`;
}

function buildFormulaItems(result: AnalysisResult): FormulaItem[] {
  const isFemale = result.gender === "female";

  return [
    {
      title: "BMI",
      description: "Menunjukkan posisi berat badan terhadap tinggi badan.",
      formula:
        "BMI = berat badan (kg) / (tinggi badan dalam meter x tinggi badan dalam meter)",
      calculation: `${formatFormulaNumber(result.weightKg)} / (${formatFormulaNumber(result.heightM)} x ${formatFormulaNumber(result.heightM)})`,
      result: `${formatFormulaNumber(result.bmi)} (${result.bmiCategory})`,
    },
    {
      title: "Batas bawah berat ideal",
      description: "Berat minimum yang masih termasuk kategori BMI normal.",
      formula: "Batas bawah = 18,5 x tinggi(m)^2",
      calculation: `18,5 x ${formatFormulaNumber(result.heightM)} x ${formatFormulaNumber(result.heightM)}`,
      result: `${formatFormulaNumber(result.idealWeightLowerKg)} kg`,
    },
    {
      title: "Batas atas berat ideal",
      description: "Berat maksimum yang masih termasuk kategori BMI normal.",
      formula: "Batas atas = 24,9 x tinggi(m)^2",
      calculation: `24,9 x ${formatFormulaNumber(result.heightM)} x ${formatFormulaNumber(result.heightM)}`,
      result: `${formatFormulaNumber(result.idealWeightUpperKg)} kg`,
    },
    {
      title: "Target berat ideal tengah",
      description: "Acuan target tengah memakai BMI 22.",
      formula: "Target ideal = 22 x tinggi(m)^2",
      calculation: `22 x ${formatFormulaNumber(result.heightM)} x ${formatFormulaNumber(result.heightM)}`,
      result: `${formatFormulaNumber(result.idealWeightKg)} kg`,
    },
    {
      title: "BMR",
      description: "Kalori dasar yang dibutuhkan tubuh saat istirahat.",
      formula: isFemale
        ? "BMR wanita = (10 x berat) + (6,25 x tinggi cm) - (5 x usia) - 161"
        : "BMR pria = (10 x berat) + (6,25 x tinggi cm) - (5 x usia) + 5",
      calculation: `(10 x ${formatFormulaNumber(result.weightKg)}) + (6,25 x ${formatFormulaNumber(result.heightCm, 0)}) - (5 x ${formatFormulaNumber(result.age, 0)}) ${isFemale ? "- 161" : "+ 5"}`,
      result: `${formatFormulaNumber(result.bmr)} kkal`,
    },
    {
      title: "Kalori harian target",
      description:
        "Kalori akhir disesuaikan dari BMR, aktivitas, dan tujuan berat badan.",
      formula:
        "Kalori target = (BMR x activity multiplier) + penyesuaian kategori BMI",
      calculation: `(${formatFormulaNumber(result.bmr)} x ${formatFormulaNumber(result.activityMultiplier, 3)}) ${formatSignedNumber(result.calorieAdjustment)}`,
      result: `${formatFormulaNumber(result.dailyCalories)} kkal`,
    },
    {
      title: "Protein harian",
      description: "Protein dihitung dari target berat ideal dan faktor kategori BMI.",
      formula: "Protein = target berat ideal x multiplier protein",
      calculation: `${formatFormulaNumber(result.idealWeightKg)} x ${formatFormulaNumber(result.proteinMultiplier, 1)}`,
      result: `${formatFormulaNumber(result.dailyProteinGrams)} gram`,
    },
    {
      title: "Lemak harian",
      description: "Lemak dihitung dari sebagian target kalori harian.",
      formula: "Lemak = (kalori target x rasio lemak) / 9",
      calculation: `(${formatFormulaNumber(result.dailyCalories)} x ${formatFormulaNumber(result.fatRatio, 2)}) / 9`,
      result: `${formatFormulaNumber(result.dailyFatGrams)} gram`,
    },
    {
      title: "Karbohidrat harian",
      description: "Karbohidrat memakai sisa kalori setelah protein dan lemak.",
      formula: "Karbohidrat = (kalori target - protein x 4 - lemak x 9) / 4",
      calculation: `(${formatFormulaNumber(result.dailyCalories)} - ${formatFormulaNumber(result.dailyProteinGrams)} x 4 - ${formatFormulaNumber(result.dailyFatGrams)} x 9) / 4`,
      result: `${formatFormulaNumber(result.dailyCarbGrams)} gram`,
    },
  ];
}

interface BmiFormulaSectionProps {
  result: AnalysisResult;
}

export function BmiFormulaSection({ result }: BmiFormulaSectionProps) {
  const formulaItems = buildFormulaItems(result);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-slate-950">
            <Sigma className="h-4 w-4 text-sky-600" />
            Rumus dan hitungannya
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Setiap bagian di bawah memakai angka dari inputmu, jadi kamu bisa
            melihat dari mana hasil BMI dan nutrisimu berasal.
          </p>
        </div>
        <Badge variant="default">{formulaItems.length} rumus</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {formulaItems.map((item, index) => (
          <details
            key={item.title}
            open={index === 0}
            className="group rounded-2xl border border-slate-200 bg-slate-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {item.result}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="border-t border-slate-200 px-4 py-4 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Rumus:</span>{" "}
                {item.formula}
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-800">Hitungan:</span>{" "}
                {item.calculation}
              </p>
              <p className="mt-2">
                <span className="font-medium text-slate-800">Hasil:</span>{" "}
                {item.result}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
