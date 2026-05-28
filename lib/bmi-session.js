const CALCULATOR_STATE_KEY = "bmi-analyzer:calculator-state";
const CONTINUATION_INTENT_KEY = "bmi-analyzer:continuation-intent";

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readJson(key) {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the calculator still works normally.
  }
}

function removeKey(key) {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures so the calculator still works normally.
  }
}

/**
 * Reads the last calculator snapshot stored in session storage.
 *
 * @returns {{
 *   form?: {
 *     heightCm?: string,
 *     weightKg?: string,
 *     age?: string,
 *     gender?: string,
 *     activityLevel?: string
 *   },
 *   result?: import("@/lib/calculations").AnalysisResult | null
 * } | null}
 */
export function readPersistedCalculatorState() {
  return readJson(CALCULATOR_STATE_KEY);
}

/**
 * Persists the current calculator form and analysis so the user can come back
 * after navigating to login/register.
 *
 * @param {{
 *   form: {
 *     heightCm: string,
 *     weightKg: string,
 *     age: string,
 *     gender: string,
 *     activityLevel: string
 *   },
 *   result: import("@/lib/calculations").AnalysisResult | null
 * }} value
 */
export function writePersistedCalculatorState(value) {
  writeJson(CALCULATOR_STATE_KEY, value);
}

/**
 * Removes the stored calculator snapshot.
 */
export function clearPersistedCalculatorState() {
  removeKey(CALCULATOR_STATE_KEY);
}

/**
 * Reads the pending post-auth action, if any.
 *
 * @returns {{ action: "save" | "export", returnTo: string } | null}
 */
export function readContinuationIntent() {
  return readJson(CONTINUATION_INTENT_KEY);
}

/**
 * Stores the action the user wanted to continue after authentication.
 *
 * @param {{ action: "save" | "export", returnTo: string }} value
 */
export function writeContinuationIntent(value) {
  writeJson(CONTINUATION_INTENT_KEY, value);
}

/**
 * Removes the pending continuation intent.
 */
export function clearContinuationIntent() {
  removeKey(CONTINUATION_INTENT_KEY);
}

/**
 * Builds a login or register URL that preserves the post-auth destination and
 * action type through query parameters.
 *
 * @param {"/login" | "/register"} basePath
 * @param {"save" | "export" | ""} action
 * @returns {string}
 */
export function buildAuthContinuationHref(basePath, action) {
  if (!action) {
    return basePath;
  }

  const params = new URLSearchParams({
    next: "/",
    resumeAction: action,
  });

  return `${basePath}?${params.toString()}`;
}
