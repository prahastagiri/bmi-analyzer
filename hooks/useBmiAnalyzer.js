"use client";

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
import {
  calculateAnalysis,
  validateCalculatorInput,
} from "@/lib/calculations";
import { getCategoryContent } from "@/lib/explanations";
import { exportElementAs } from "@/lib/export";
import {
  createSupabaseBrowserClient,
  hasSupabaseEnv,
  mapAnalysisToInsertPayload,
} from "@/lib/supabase";

const initialForm = {
  heightCm: "",
  weightKg: "",
  age: "",
  gender: "male",
  activityLevel: "moderately_active",
};

/**
 * Central hook for the BMI feature. It keeps calculator state, validation,
 * analysis generation, save flow, export flow, and auth-gated behavior in one
 * place so the UI components can stay focused on presentation.
 *
 * @returns {{
 *   actionError: string,
 *   actionStatus: string,
 *   authEnabled: boolean,
 *   busyAction: "" | "save" | "jpg" | "pdf",
 *   categoryContent: { label: string, summary: string, tips: string[] } | null,
 *   error: string,
 *   form: {
 *     heightCm: string,
 *     weightKg: string,
 *     age: string,
 *     gender: string,
 *     activityLevel: string
 *   },
 *   handleCalculate: (event: import("react").FormEvent<HTMLFormElement>) => void,
 *   handleExport: (type: "jpg" | "pdf") => Promise<void>,
 *   handleReset: () => void,
 *   handleSave: () => Promise<void>,
 *   pendingAction: string,
 *   result: import("@/lib/calculations").AnalysisResult | null,
 *   resultRef: import("react").RefObject<HTMLDivElement | null>,
 *   status: string,
 *   updateField: (field: "heightCm" | "weightKg" | "age" | "gender" | "activityLevel", value: string) => void
 * }}
 */
export function useBmiAnalyzer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultRef = useRef(null);
  const hasRestoredState = useRef(false);
  const hasResumedAction = useRef(false);
  const { authEnabled, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  // Feedback for save/export lives in its own channel so it can be rendered
  // next to the action buttons instead of inside the form card.
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [pendingAction, setPendingAction] = useState("");

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

  /**
   * Updates a single field in the calculator form without replacing the full
   * form object.
   *
   * @param {"heightCm" | "weightKg" | "age" | "gender" | "activityLevel"} field
   * @param {string} value
   */
  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /**
   * Validates the form and creates a fresh analysis result.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event
   */
  function handleCalculate(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    setActionError("");
    setActionStatus("");
    setPendingAction("");

    const validationMessage = validateCalculatorInput(form);

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setResult(calculateAnalysis(form));
    setStatus("Hasil analisis berhasil dibuat.");
  }

  /**
   * Restores the form and result state to the initial values.
   */
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

  /**
   * Saves the current analysis to the `bmi_histories` table for the logged-in user.
   * Memoized so the post-login continuation effect can depend on it safely.
   *
   * @returns {Promise<void>}
   */
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
      setActionStatus("Menyimpan hasil ke akunmu...");
      setBusyAction("save");
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

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
      setActionError(
        "Hasil gagal disimpan. Coba lagi beberapa saat lagi — jika masih gagal, muat ulang halaman."
      );
      setActionStatus("");
    } finally {
      setBusyAction("");
    }
  }, [authEnabled, result, user]);

  /**
   * Exports the rendered result section after enforcing the member-only rule
   * for export actions.
   *
   * @param {"jpg" | "pdf"} type
   * @returns {Promise<void>}
   */
  async function handleExport(type) {
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
      setActionError(exportError.message || "Export gagal dilakukan.");
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
    result,
    resultRef,
    registerHref,
    status,
    updateField,
  };
}
