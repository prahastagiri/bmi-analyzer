import type { AnalysisResult } from "@/lib/calculations";

const CALCULATOR_STATE_KEY = "bmi-analyzer:calculator-state";
const CONTINUATION_INTENT_KEY = "bmi-analyzer:continuation-intent";

interface CalculatorFormState {
  heightCm?: string;
  weightKg?: string;
  age?: string;
  gender?: string;
  activityLevel?: string;
}

export interface PersistedCalculatorState {
  form?: CalculatorFormState;
  result?: AnalysisResult | null;
}

export interface ContinuationIntent {
  action: "save" | "export";
  returnTo: string;
}

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the calculator still works normally.
  }
}

function removeKey(key: string): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures so the calculator still works normally.
  }
}

export function readPersistedCalculatorState(): PersistedCalculatorState | null {
  return readJson<PersistedCalculatorState>(CALCULATOR_STATE_KEY);
}

export function writePersistedCalculatorState(
  value: PersistedCalculatorState
): void {
  writeJson(CALCULATOR_STATE_KEY, value);
}

export function clearPersistedCalculatorState(): void {
  removeKey(CALCULATOR_STATE_KEY);
}

export function readContinuationIntent(): ContinuationIntent | null {
  return readJson<ContinuationIntent>(CONTINUATION_INTENT_KEY);
}

export function writeContinuationIntent(value: ContinuationIntent): void {
  writeJson(CONTINUATION_INTENT_KEY, value);
}

export function clearContinuationIntent(): void {
  removeKey(CONTINUATION_INTENT_KEY);
}

export function buildAuthContinuationHref(
  basePath: "/login" | "/register",
  action: "save" | "export" | ""
): string {
  if (!action) {
    return basePath;
  }

  const params = new URLSearchParams({
    next: "/",
    resumeAction: action,
  });

  return `${basePath}?${params.toString()}`;
}
