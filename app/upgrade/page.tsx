"use client";

import type { FormEvent, ReactNode } from "react";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/components/auth-provider";
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
import {
  FREE_CHART_DAYS,
  FREE_SAVE_LIMIT,
  PREMIUM_FEATURES,
  PREMIUM_PRICE_LABEL,
} from "@/lib/tiers";
import { joinWaitlist } from "@/lib/waitlist";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UpgradePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const trimmed = email.trim();

    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await joinWaitlist(trimmed, user?.id ?? null);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setJoined(true);
      setMessage(
        result.status === "already"
          ? "Kamu sudah terdaftar di waitlist. Kami kabari saat premium siap."
          : "Terima kasih! Kamu masuk waitlist. Kami kabari saat premium siap."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-800">
          <Sparkles className="h-4 w-4" />
          HealthyMuch Premium
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Jadikan HealthyMuch tracker kesehatan penuh
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Fitur inti tetap gratis selamanya. Premium membuka riwayat tanpa
          batas, grafik penuh, estimasi target, dan export — dengan{" "}
          <span className="font-semibold text-slate-950">
            {PREMIUM_PRICE_LABEL}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Untuk mulai memantau BMI & nutrisi.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              <PlanItem>Hitung BMI & kebutuhan nutrisi tanpa batas</PlanItem>
              <PlanItem>Simpan sampai {FREE_SAVE_LIMIT} hasil</PlanItem>
              <PlanItem>Grafik tren {FREE_CHART_DAYS} hari terakhir</PlanItem>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-lg shadow-amber-100/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Premium
            </CardTitle>
            <CardDescription>{PREMIUM_PRICE_LABEL}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              {Object.entries(PREMIUM_FEATURES).map(([key, feature]) => (
                <PlanItem key={key}>
                  <span className="font-medium text-slate-950">
                    {feature.title}
                  </span>{" "}
                  — {feature.description}
                </PlanItem>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-sky-100">
        <CardHeader>
          <CardTitle>Gabung waitlist premium</CardTitle>
          <CardDescription>
            Pembayaran belum dibuka. Tinggalkan email — kami kabari begitu premium
            siap, dan pendaftar awal dapat prioritas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {joined ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email</Label>
                <Input
                  id="waitlist-email"
                  type="email"
                  inputMode="email"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Mendaftar..." : "Gabung waitlist"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-slate-500">
        Belum mau upgrade?{" "}
        <Link href="/" className="font-semibold text-sky-700 hover:underline">
          Kembali ke kalkulator
        </Link>
      </p>
    </div>
  );
}

function PlanItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}
