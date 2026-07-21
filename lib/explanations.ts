import type { ActivityLevel, AnalysisResult, BmiCategory } from "@/lib/calculations";

interface CategoryCopy {
  label: string;
  summary: string;
  tips: string[];
}

const CATEGORY_COPY: Record<BmiCategory, CategoryCopy> = {
  underweight: {
    label: "Berat badan kurang",
    summary:
      "BMI menunjukkan bahwa berat badanmu masih di bawah rentang ideal. Fokus utamanya adalah meningkatkan asupan nutrisi dan menjaga rutinitas makan yang lebih konsisten.",
    tips: [
      "Tambah porsi makan secara bertahap dengan makanan padat nutrisi seperti telur, tahu, tempe, daging tanpa lemak, dan kacang-kacangan.",
      "Utamakan surplus kalori ringan agar berat badan naik lebih stabil.",
      "Lakukan latihan kekuatan ringan agar kenaikan berat badan tidak hanya berasal dari lemak.",
    ],
  },
  normal: {
    label: "Berat badan ideal",
    summary:
      "BMI berada di rentang ideal. Fokus utamanya adalah menjaga pola makan, aktivitas fisik, dan kualitas tidur agar berat badan tetap stabil.",
    tips: [
      "Pertahankan aktivitas fisik rutin minimal 3 sampai 5 kali per minggu.",
      "Jaga keseimbangan kalori harian agar berat badan tetap terkontrol.",
      "Pertahankan asupan protein yang cukup untuk mendukung massa otot dan pemulihan tubuh.",
    ],
  },
  overweight: {
    label: "Kelebihan berat badan",
    summary:
      "BMI berada di atas rentang ideal. Fokus utamanya adalah menurunkan berat badan secara bertahap lewat defisit kalori ringan dan kebiasaan hidup yang lebih aktif.",
    tips: [
      "Kurangi asupan kalori harian secara perlahan tanpa diet ekstrem.",
      "Perbanyak makanan tinggi protein dan serat agar kenyang lebih lama.",
      "Tambahkan aktivitas harian seperti jalan kaki, bersepeda, atau latihan beban ringan.",
    ],
  },
  obese: {
    label: "Obesitas",
    summary:
      "BMI menunjukkan obesitas. Fokus utamanya adalah penurunan berat badan yang aman dan konsisten dengan bantuan pola makan terarah, aktivitas fisik, dan bila perlu konsultasi profesional.",
    tips: [
      "Mulai dari target kecil yang realistis, misalnya mengurangi minuman manis atau camilan tinggi kalori.",
      "Prioritaskan protein, sayur, dan makanan minim proses untuk membantu kontrol kalori.",
      "Bangun rutinitas aktivitas harian yang mudah dijaga dalam jangka panjang.",
    ],
  },
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Jarang bergerak",
  lightly_active: "Aktivitas ringan",
  moderately_active: "Aktivitas sedang",
  very_active: "Aktivitas tinggi",
  extra_active: "Sangat aktif",
};

export function getCategoryContent(category: BmiCategory): CategoryCopy {
  return CATEGORY_COPY[category] ?? CATEGORY_COPY.normal;
}

export function getActivityLabel(value: ActivityLevel | string): string {
  return ACTIVITY_LABELS[value] ?? "Tidak diketahui";
}

export function formatTargetDuration(weeks: number): string {
  if (!Number.isFinite(weeks) || weeks <= 0) {
    return "kurang dari 1 minggu";
  }

  const roundedWeeks = Math.round(weeks);

  if (roundedWeeks < 1) {
    return "kurang dari 1 minggu";
  }

  if (roundedWeeks < 12) {
    return `sekitar ${roundedWeeks} minggu`;
  }

  const months = Math.round(weeks / 4.345);

  return `sekitar ${months} bulan`;
}

export function buildSummary(result: AnalysisResult): string {
  const content = getCategoryContent(result.bmiCategory);
  const caloriesDifference = result.dailyCalories - result.maintenanceCalories;

  let calorieDirection = "menjaga";

  if (caloriesDifference > 0) {
    calorieDirection = "menambah";
  } else if (caloriesDifference < 0) {
    calorieDirection = "mengurangi";
  }

  return `${content.summary} Target kalori harian disesuaikan untuk ${calorieDirection} berat badan secara bertahap.`;
}
