"use client";

import type { FormEvent, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import {
  buildAuthContinuationHref,
  clearContinuationIntent,
  readContinuationIntent,
  readPersistedCalculatorState,
  writeContinuationIntent,
  writePersistedCalculatorState,
} from "@/lib/bmi-session";
import type { AnalysisResult, CalculatorInput } from "@/lib/calculations";
import {
  calculateAnalysis,
  validateCalculatorInput,
} from "@/lib/calculations";
import { getCategoryContent } from "@/lib/explanations";
import { exportElementAs } from "@/lib/export";
import { fetchProfile, type Profile } from "@/lib/profile";
import { FREE_SAVE_LIMIT, isPremium } from "@/lib/tiers";
import {
  createSupabaseBrowserClient,
  hasSupabaseEnv,
  mapAnalysisToInsertPayload,
} from "@/lib/supabase";

type FormFieldKey = "heightCm" | "weightKg" | "age" | "gender" | "activityLevel";

interface CalculatorForm {
  heightCm: string;
  weightKg: string;
  age: string;
  gender: string;
  activityLevel: string;
}

interface CategoryContent {
  label: string;
  summary: string;
  tips: string[];
}

type BusyAction = "" | "save" | "jpg" | "pdf";

interface UseBmiAnalyzerReturn {
  actionError: string;
  actionStatus: string;
  authEnabled: boolean;
  busyAction: BusyAction;
  categoryContent: CategoryContent | null;
  error: string;
  form: CalculatorForm;
  handleCalculate: (event: FormEvent<HTMLFormElement>) => void;
  handleExport: (type: "jpg" | "pdf") => Promise<void>;
  handleReset: () => void;
  handleSave: () => Promise<void>;
  loginHref: string;
  pendingAction: string;
  premium: boolean;
  result: AnalysisResult | null;
  resultRef: RefObject<HTMLDivElement | null>;
  registerHref: string;
  status: string;
  targetWeightKg: number | null;
  updateField: (field: FormFieldKey, value: string) => void;
}

const initialForm: CalculatorForm = {
  heightCm: "",
  weightKg: "",
  age: "",
  gender: "male",
  activityLevel: "moderately_active",
};

export function useBmiAnalyzer(): UseBmiAnalyzerReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement | null>(null);
  const hasRestoredState = useRef(false);
  const hasResumedAction = useRef(false);
  const { authEnabled, user } = useAuth();
  const [form, setForm] = useState<CalculatorForm>(initialForm);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  // Feedback for save/export lives in its own channel so it can be rendered
  // next to the action buttons instead of inside the form card.
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>("");
  const [pendingAction, setPendingAction] = useState<"" | "save" | "export">("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const targetWeightKg = profile?.target_weight_kg ?? null;
  const premium = isPremium(profile);

  const categoryContent = useMemo(
    () => (result ? getCategoryContent(result.bmiCategory) : null),
    [result]
  );
  const pendingResumeAction = searchParams.get("resumeAction");
  const loginHref = buildAuthContinuationHref("/login", pendingAction);
  const registerHref = buildAuthContinuationHref("/register", pendingAction);

  useEffect(() => {
    if (hasRestoredState.current) {
      return;
    }

    const savedState = readPersistedCalculatorState();

    /* eslint-disable react-hooks/set-state-in-effect --
       sessionStorage hanya ada di client, jadi restore harus terjadi setelah
       hydration; lazy useState initializer menyebabkan hydration mismatch. */
    if (savedState?.form) {
      setForm((current) => ({
        ...current,
        ...savedState.form,
      }));
    }

    if (savedState?.result) {
      setResult(savedState.result);
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    hasRestoredState.current = true;
  }, []);

  useEffect(() => {
    if (!hasRestoredState.current) {
      return;
    }

    writePersistedCalculatorState({
      form,
      result,
    });
  }, [form, result]);

  useEffect(() => {
    let active = true;

    // Logged-out resolves to null so target & tier reset between sessions; the
    // setState always runs in a Promise callback, never synchronously here.
    const load =
      authEnabled && user ? fetchProfile(user.id) : Promise.resolve(null);

    load
      .then((loaded) => {
        if (active) {
          setProfile(loaded);
        }
      })
      .catch((profileError) => {
        // A missing/failed profile just means default target + free tier.
        console.error("Gagal memuat profil:", profileError);
      });

    return () => {
      active = false;
    };
  }, [authEnabled, user]);

  function updateField(field: FormFieldKey, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setActionError("");
    setActionStatus("");
    setPendingAction("");

    // gender & activityLevel selalu berasal dari <select> dengan opsi tetap,
    // jadi nilainya dijamin cocok dengan Gender / ActivityLevel saat runtime.
    const input = form as CalculatorInput;
    const validationMessage = validateCalculatorInput(input);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setResult(calculateAnalysis(input));
    setStatus("Hasil analisis berhasil dibuat.");
  }

  function handleReset() {
    setForm(initialForm);
    setResult(null);
    setError("");
    setStatus("");
    setActionError("");
    setActionStatus("");
    setPendingAction("");
    clearContinuationIntent();
  }

  const handleSave = useCallback(async () => {
    if (!result) {
      setActionStatus("");
      setActionError("Hitung BMI terlebih dahulu sebelum menyimpan hasil.");
      return;
    }

    if (!authEnabled || !hasSupabaseEnv()) {
      setActionStatus("");
      setActionError(
        "Supabase belum dikonfigurasi. Tambahkan env Supabase agar fitur simpan aktif."
      );
      return;
    }

    if (!user) {
      setPendingAction("save");
      writeContinuationIntent({
        action: "save",
        returnTo: "/",
      });
      setActionStatus("");
      setActionError("Login diperlukan untuk menyimpan hasil perhitungan.");
      return;
    }

    try {
      setActionError("");
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      // Cegah duplikat wajar: jika sudah ada entri hari ini, minta konfirmasi
      // sebelum menyimpan lagi (mencegah simpan ganda tak sengaja).
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data: todaysEntries, error: dupError } = await supabase
        .from("bmi_histories")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", startOfToday.toISOString())
        .limit(1);

      if (dupError) {
        throw dupError;
      }

      if (
        todaysEntries &&
        todaysEntries.length > 0 &&
        typeof window !== "undefined" &&
        !window.confirm(
          "Kamu sudah menyimpan hasil hari ini. Simpan lagi sebagai entri baru?"
        )
      ) {
        setActionStatus("");
        return;
      }

      setActionStatus("Menyimpan hasil ke akunmu...");
      setBusyAction("save");

      const { error: insertError } = await supabase.from("bmi_histories").insert({
        user_id: user.id,
        ...mapAnalysisToInsertPayload(result),
      });

      if (insertError) {
        throw insertError;
      }

      setActionStatus("Hasil berhasil disimpan. Lihat di halaman riwayat kapan saja.");
    } catch (saveError) {
      console.error("Gagal menyimpan hasil BMI:", saveError);

      // Backstop batas free (trigger DB) — tampilkan ajakan upgrade, bukan
      // pesan gagal generik.
      const message =
        saveError && typeof saveError === "object" && "message" in saveError
          ? String((saveError as { message: unknown }).message)
          : "";

      if (message.includes("FREE_SAVE_LIMIT_REACHED")) {
        setActionError(
          `Batas ${FREE_SAVE_LIMIT} hasil tersimpan untuk akun free sudah tercapai. Hapus salah satu hasil lama, atau upgrade ke premium untuk riwayat tanpa batas.`
        );
      } else {
        setActionError(
          "Hasil gagal disimpan. Coba lagi beberapa saat lagi — jika masih gagal, muat ulang halaman."
        );
      }
      setActionStatus("");
    } finally {
      setBusyAction("");
    }
  }, [authEnabled, result, user]);

  async function handleExport(type: "jpg" | "pdf") {
    if (!result) {
      setActionStatus("");
      setActionError("Hitung BMI terlebih dahulu sebelum export hasil.");
      return;
    }

    if (!authEnabled || !hasSupabaseEnv()) {
      setActionStatus("");
      setActionError(
        "Supabase belum dikonfigurasi. Login diperlukan untuk memakai fitur export."
      );
      return;
    }

    if (!user) {
      setPendingAction("export");
      writeContinuationIntent({
        action: "export",
        returnTo: "/",
      });
      setActionStatus("");
      setActionError("Login diperlukan untuk export hasil ke JPG atau PDF.");
      return;
    }

    // Export adalah fitur premium. Free diarahkan ke /upgrade (BmiActions
    // menampilkan tautannya saat premium=false).
    if (!premium) {
      setActionStatus("");
      setActionError(
        "Export JPG & PDF adalah fitur premium. Upgrade untuk membukanya."
      );
      return;
    }

    try {
      setActionError("");
      setActionStatus(`Menyiapkan file ${type.toUpperCase()}...`);
      setBusyAction(type);
      await exportElementAs(type, resultRef.current, "bmi-analysis");
      setActionStatus(
        type === "pdf"
          ? "Export PDF berhasil. Jika dialog print muncul, pilih \"Save as PDF\"."
          : "Export JPG berhasil. File tersimpan di folder unduhan."
      );
    } catch (exportError) {
      setActionError((exportError as Error).message || "Export gagal dilakukan.");
      setActionStatus("");
    } finally {
      setBusyAction("");
    }
  }

  useEffect(() => {
    if (!user || !result || hasResumedAction.current) {
      return;
    }

    // The pending action can arrive through the login redirect query param or,
    // when the query param is lost, through the intent stored in session
    // storage before the user left the calculator.
    let action = pendingResumeAction;
    const cameFromQueryParam = Boolean(pendingResumeAction);

    if (!action) {
      const storedIntent = readContinuationIntent();

      if (!storedIntent || storedIntent.returnTo !== "/") {
        return;
      }

      action = storedIntent.action;
    }

    if (action !== "save" && action !== "export") {
      return;
    }

    hasResumedAction.current = true;

    if (action === "save") {
      setActionStatus("Login berhasil. Melanjutkan proses simpan hasil...");
      handleSave().finally(() => {
        clearContinuationIntent();

        if (cameFromQueryParam) {
          router.replace("/");
        }
      });
      return;
    }

    setPendingAction("");
    setActionStatus(
      "Login berhasil. Hasil sebelumnya dipulihkan. Klik tombol export sekali lagi untuk melanjutkan."
    );
    clearContinuationIntent();

    if (cameFromQueryParam) {
      router.replace("/");
    }
  }, [handleSave, pendingResumeAction, result, router, user]);

  return {
    actionError,
    actionStatus,
    authEnabled,
    busyAction,
    categoryContent,
    error,
    form,
    handleCalculate,
    handleExport,
    handleReset,
    handleSave,
    loginHref,
    pendingAction,
    premium,
    result,
    resultRef,
    registerHref,
    status,
    targetWeightKg,
    updateField,
  };
}
