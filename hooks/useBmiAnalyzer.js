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
 *   authEnabled: boolean,
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
      setError("Hitung BMI terlebih dahulu sebelum menyimpan hasil.");
      return;
    }

    if (!authEnabled || !hasSupabaseEnv()) {
      setError(
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
      setError("Login diperlukan untuk menyimpan hasil perhitungan.");
      return;
    }

    try {
      setError("");
      setStatus("Menyimpan hasil ke akunmu...");
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

      setStatus("Hasil berhasil disimpan.");
    } catch (saveError) {
      setError(
        saveError.message ||
          "Hasil gagal disimpan. Pastikan tabel bmi_histories sudah dibuat."
      );
      setStatus("");
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
      setError("Hitung BMI terlebih dahulu sebelum export hasil.");
      return;
    }

    if (!authEnabled || !hasSupabaseEnv()) {
      setError(
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
      setError("Login diperlukan untuk export hasil ke JPG atau PDF.");
      return;
    }

    try {
      setError("");
      setStatus(`Menyiapkan file ${type.toUpperCase()}...`);
      await exportElementAs(type, resultRef.current, "bmi-analysis");
      setStatus(`Export ${type.toUpperCase()} berhasil.`);
    } catch (exportError) {
      setError(exportError.message || "Export gagal dilakukan.");
      setStatus("");
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
      setStatus("Login berhasil. Melanjutkan proses simpan hasil...");
      handleSave().finally(() => {
        clearContinuationIntent();

        if (cameFromQueryParam) {
          router.replace("/");
        }
      });
      return;
    }

    setPendingAction("");
    setStatus(
      "Login berhasil. Hasil sebelumnya dipulihkan. Klik tombol export sekali lagi untuk melanjutkan."
    );
    clearContinuationIntent();

    if (cameFromQueryParam) {
      router.replace("/");
    }
  }, [handleSave, pendingResumeAction, result, router, user]);

  return {
    authEnabled,
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
