import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Suspense } from "react";

import { BmiAnalyzer } from "@/components/bmi-analyzer";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Public landing page that introduces the product and mounts the main BMI
 * calculator component.
 *
 * @returns {import("react").JSX.Element}
 */
export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="grid gap-6 rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <Badge className="bg-white/10 text-sky-100 hover:bg-white/10">
            Portfolio-ready BMI analyzer
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Hitung BMI, kebutuhan nutrisi, dan simpan hasil dalam satu
              aplikasi.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Aplikasi ini membantu pengguna menghitung BMI, berat badan ideal,
              kalori, protein, dan lemak harian. User boleh langsung menghitung
              tanpa login, lalu masuk hanya saat ingin menyimpan atau export
              hasil.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#calculator" className={cn(buttonVariants({ size: "lg" }))}>
              Mulai hitung sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "bg-white text-slate-950 hover:bg-slate-100"
              )}
            >
              Buat akun
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<Sparkles className="h-5 w-5 text-sky-300" />}
            title="Analisis mudah dibaca"
            description="Hasil BMI langsung diterjemahkan ke tips praktis yang relevan."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5 text-sky-300" />}
            title="Auth hanya saat perlu"
            description="Login dibutuhkan hanya untuk save history dan export hasil."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5 text-sky-300" />}
            title="Siap jadi portfolio"
            description="Dibangun dengan Next.js, Tailwind, Supabase, dan pola komponen reusable."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5 text-sky-300" />}
            title="Fokus pada pembelajaran"
            description="Formula, UI, auth, history, dan export dipisah agar mudah dipelajari."
          />
        </div>
      </section>

      <section
        id="calculator"
        className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Kalkulator utama
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Form BMI dan analisis nutrisi
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Formula menggunakan pendekatan BMI, target berat ideal berbasis BMI
            22, dan estimasi kalori dari Mifflin-St Jeor plus tingkat aktivitas.
          </p>
        </div>

        <Suspense>
          <BmiAnalyzer />
        </Suspense>
      </section>
    </div>
  );
}

/**
 * Reusable feature card shown in the hero section.
 *
 * @param {{ description: string, icon: import("react").ReactNode, title: string }} props
 * @returns {import("react").JSX.Element}
 */
function FeatureCard({ description, icon, title }) {
  return (
    <Card className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur">
      <CardContent className="space-y-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
