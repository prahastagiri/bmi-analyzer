"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { Download, ExternalLink, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { BmiResult } from "@/components/bmi/BmiResult";
import { BmiTrendChart } from "@/components/bmi/BmiTrendChart";
import { ProfileCard } from "@/components/bmi/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalculatorInput } from "@/lib/calculations";
import { calculateAnalysis } from "@/lib/calculations";
import { getCategoryContent, getActivityLabel } from "@/lib/explanations";
import { clearContinuationIntent, writePersistedCalculatorState } from "@/lib/bmi-session";
import { exportElementAs } from "@/lib/export";
import type { Profile } from "@/lib/profile";
import { fetchProfile } from "@/lib/profile";
import {
  createSupabaseBrowserClient,
  mapHistoryRecordToCalculatorInput,
} from "@/lib/supabase";
import type { BmiHistoryRecord } from "@/lib/supabase";
import { cn, formatCompactDate, formatNumber } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const { authEnabled, loading, user } = useAuth();
  const [items, setItems] = useState<BmiHistoryRecord[]>([]);
  const [status, setStatus] = useState("Memuat riwayat...");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detailStatus, setDetailStatus] = useState("");
  const [detailError, setDetailError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!authEnabled || !user) {
        return;
      }

      try {
        setError("");
        setStatus("Memuat riwayat...");
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
          throw new Error("Supabase client tidak tersedia.");
        }

        const { data, error: queryError } = await supabase
          .from("bmi_histories")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) {
          throw queryError;
        }

        setItems((data as BmiHistoryRecord[]) ?? []);
        setSelectedId((current) => current || data?.[0]?.id || "");
        setStatus("");
      } catch (loadError) {
        console.error("Gagal memuat riwayat BMI:", loadError);
        setError(
          "Riwayat tidak bisa dimuat. Periksa koneksimu lalu muat ulang halaman."
        );
        setStatus("");
      }
    }

    if (!loading) {
      loadHistory();
    }
  }, [authEnabled, loading, user]);

  useEffect(() => {
    async function loadProfile() {
      if (!authEnabled || !user) {
        return;
      }

      try {
        setProfile(await fetchProfile(user.id));
      } catch (profileError) {
        console.error("Gagal memuat profil:", profileError);
      }
    }

    if (!loading) {
      loadProfile();
    }
  }, [authEnabled, loading, user]);

  function handleSelectItem(id: string) {
    setSelectedId(id);
    setDetailError("");
    setDetailStatus("");
  }

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId]
  );

  const selectedInput = useMemo(
    () => (selectedItem ? mapHistoryRecordToCalculatorInput(selectedItem) : null),
    [selectedItem]
  );

  const selectedResult = useMemo(
    () => (selectedInput ? calculateAnalysis(selectedInput as CalculatorInput) : null),
    [selectedInput]
  );

  const categoryContent = useMemo(
    () => (selectedResult ? getCategoryContent(selectedResult.bmiCategory) : null),
    [selectedResult]
  );

  async function handleDetailExport(type: "jpg" | "pdf") {
    if (!selectedResult) {
      setDetailError("Pilih history yang ingin diexport terlebih dahulu.");
      return;
    }

    try {
      setDetailError("");
      setDetailStatus(`Menyiapkan file ${type.toUpperCase()} dari history...`);
      await exportElementAs(type, detailRef.current, "bmi-history-detail");
      setDetailStatus(`Export ${type.toUpperCase()} dari history berhasil.`);
    } catch (exportError) {
      setDetailError(
        exportError instanceof Error ? exportError.message : "Export history gagal dilakukan."
      );
      setDetailStatus("");
    }
  }

  function handleReuseInCalculator() {
    if (!selectedInput || !selectedResult) {
      setDetailError("Pilih history yang ingin dipakai ulang.");
      return;
    }

    clearContinuationIntent();
    writePersistedCalculatorState({
      form: selectedInput,
      result: selectedResult,
    });
    router.push("/");
  }

  async function handleDeleteItem(id: string): Promise<void> {
    if (deletingId) {
      return;
    }

    if (typeof window !== "undefined" && !window.confirm("Hapus hasil ini dari riwayat? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }

    try {
      setError("");
      setNotice("");
      setDetailError("");
      setDeletingId(id);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      const { error: deleteError } = await supabase
        .from("bmi_histories")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);

      if (deleteError) {
        throw deleteError;
      }

      const remaining = items.filter((item) => item.id !== id);

      setItems(remaining);

      if (selectedId === id) {
        setSelectedId(remaining[0]?.id ?? "");
      }

      setNotice("Riwayat berhasil dihapus.");
    } catch (deleteError) {
      console.error("Gagal menghapus riwayat BMI:", deleteError);
      setError("Riwayat gagal dihapus. Coba lagi beberapa saat.");
    } finally {
      setDeletingId("");
    }
  }

  if (!authEnabled) {
    return (
      <CenterCard
        title="History belum aktif"
        description="Tambahkan env Supabase lebih dulu agar login dan riwayat hasil bisa dipakai."
      />
    );
  }

  if (loading) {
    return <CenterCard title="Memuat sesi..." description="Menyiapkan akunmu." />;
  }

  if (!user) {
    return (
      <CenterCard
        title="Login diperlukan"
        description="Halaman riwayat hanya bisa dibuka oleh user yang sudah login."
        action={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={cn(buttonVariants())}>
              Login
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              Buat akun
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
          Riwayat akun
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {profile?.display_name
            ? `Progres ${profile.display_name}`
            : "Hasil BMI yang pernah kamu simpan"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Halaman ini menampilkan semua hasil BMI yang tersimpan di akunmu.
        </p>
      </div>

      {user ? (
        <ProfileCard
          userId={user.id}
          initialProfile={profile}
          onSaved={setProfile}
        />
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {status}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {!status && items.length > 0 ? <BmiTrendChart items={items} /> : null}

      {selectedItem && selectedResult && categoryContent ? (
        <Card className="overflow-hidden border-sky-100 shadow-lg shadow-sky-100/30">
          <CardHeader className="gap-4 border-b border-sky-100 bg-sky-50/60">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Detail history terpilih</CardTitle>
                <CardDescription className="mt-2 max-w-2xl">
                  Data ini dihitung ulang dari input yang kamu simpan, sehingga
                  kamu bisa membuka interpretasi, tips, range berat ideal, dan
                  rumus lengkap seperti di halaman kalkulator.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{categoryContent.label}</Badge>
                <Badge variant="outline">
                  Disimpan {formatCompactDate(selectedItem.created_at)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <HistoryMetric
                label="Input tersimpan"
                value={`${selectedItem.weight_kg} kg • ${selectedItem.height_cm} cm`}
              />
              <HistoryMetric
                label="Aktivitas"
                value={getActivityLabel(selectedItem.activity_level)}
              />
              <HistoryMetric
                label="Kalori tersimpan"
                value={`${selectedItem.daily_calories} kkal`}
              />
              <HistoryMetric
                label="Protein / Lemak"
                value={`${selectedItem.daily_protein_g} g / ${selectedItem.daily_fat_g} g`}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReuseInCalculator}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Gunakan lagi di kalkulator
              </Button>
              <Button variant="secondary" onClick={() => handleDetailExport("jpg")}>
                <Download className="mr-2 h-4 w-4" />
                Export JPG
              </Button>
              <Button variant="secondary" onClick={() => handleDetailExport("pdf")}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {detailError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detailError}
              </div>
            ) : null}

            {detailStatus ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {detailStatus}
              </div>
            ) : null}

            <BmiResult
              categoryContent={categoryContent}
              result={selectedResult}
              resultRef={detailRef}
              targetWeightKg={profile?.target_weight_kg ?? undefined}
            />
          </CardContent>
        </Card>
      ) : null}

      {!status && items.length === 0 ? (
        <CenterCard
          title="Belum ada history"
          description="Simpan hasil dari halaman utama agar riwayat BMI muncul di sini."
          action={
            <Link href="/" className={cn(buttonVariants())}>
              Lihat kalkulator
            </Link>
          }
        />
      ) : null}

      <div className="grid gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={cn(
              selectedItem?.id === item.id ? "border-sky-300 shadow-sm shadow-sky-100" : ""
            )}
          >
            <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-xl">
                  BMI {formatNumber(item.bmi_value, 2)} • {item.bmi_category}
                </CardTitle>
                <CardDescription>
                  Disimpan pada {formatCompactDate(item.created_at)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{getActivityLabel(item.activity_level)}</Badge>
                {selectedItem?.id === item.id ? (
                  <Badge variant="outline">Sedang dilihat</Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <HistoryMetric label="Berat badan" value={`${item.weight_kg} kg`} />
                <HistoryMetric
                  label="Berat ideal"
                  value={`${item.ideal_weight_kg} kg`}
                />
                <HistoryMetric
                  label="Kalori harian"
                  value={`${item.daily_calories} kkal`}
                />
                <HistoryMetric
                  label="Protein / Lemak"
                  value={`${item.daily_protein_g} g / ${item.daily_fat_g} g`}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => handleSelectItem(item.id)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {selectedItem?.id === item.id ? "Detail sedang dibuka" : "Lihat detail"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    handleSelectItem(item.id);
                    setTimeout(() => {
                      detailRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  }}
                >
                  Buka detail lengkap
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteItem(item.id)}
                  disabled={deletingId === item.id}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deletingId === item.id ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface CenterCardProps {
  action?: ReactNode;
  description: string;
  title: string;
}

function CenterCard({ action, description, title }: CenterCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {action ? <CardContent>{action}</CardContent> : null}
      </Card>
    </div>
  );
}

interface HistoryMetricProps {
  label: string;
  value: string;
}

function HistoryMetric({ label, value }: HistoryMetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
