/**
 * Maps raw Supabase auth errors (English) to friendly Indonesian messages so
 * users never see untranslated backend text. Unknown errors fall back to a
 * generic message while the raw error is logged for debugging.
 */

/** Generic fallback shown when an error is not recognized. */
export const GENERIC_AUTH_ERROR_MESSAGE =
  "Terjadi kesalahan. Coba lagi beberapa saat.";

/**
 * Known Supabase error codes mapped to Indonesian messages. Codes are the
 * stable identifiers sent by GoTrue (`error.code` on supabase-js v2).
 *
 * @type {Record<string, string>}
 */
const CODE_MESSAGES = {
  invalid_credentials:
    "Email atau password salah. Periksa kembali lalu coba lagi.",
  email_not_confirmed:
    "Email belum dikonfirmasi. Cek inbox (dan folder spam) untuk link konfirmasinya.",
  user_already_exists:
    "Email ini sudah terdaftar. Silakan login, atau reset password jika lupa.",
  email_exists:
    "Email ini sudah terdaftar. Silakan login, atau reset password jika lupa.",
  weak_password: "Password terlalu lemah. Gunakan minimal 6 karakter.",
  same_password: "Password baru harus berbeda dari password lama.",
  otp_expired:
    "Link sudah kedaluwarsa atau tidak berlaku. Minta link baru lalu coba lagi.",
  over_email_send_rate_limit:
    "Terlalu banyak permintaan email. Tunggu beberapa menit lalu coba lagi.",
  over_request_rate_limit:
    "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
  validation_failed: "Format email tidak valid. Periksa kembali penulisannya.",
  session_expired: "Sesi kamu sudah berakhir. Silakan login ulang.",
};

/**
 * Fallback matching on the raw English message for errors that arrive without
 * a machine-readable code (older responses, network failures). Checked in
 * order; the first pattern that matches wins.
 *
 * @type {Array<{ pattern: RegExp, message: string }>}
 */
const MESSAGE_PATTERNS = [
  {
    pattern: /invalid login credentials/i,
    message: CODE_MESSAGES.invalid_credentials,
  },
  {
    pattern: /email not confirmed/i,
    message: CODE_MESSAGES.email_not_confirmed,
  },
  {
    pattern: /already registered|already exists/i,
    message: CODE_MESSAGES.user_already_exists,
  },
  {
    pattern: /password should be at least/i,
    message: CODE_MESSAGES.weak_password,
  },
  {
    pattern: /new password should be different/i,
    message: CODE_MESSAGES.same_password,
  },
  {
    pattern: /link is invalid or has expired|token has expired/i,
    message: CODE_MESSAGES.otp_expired,
  },
  {
    pattern: /rate limit/i,
    message: CODE_MESSAGES.over_request_rate_limit,
  },
  {
    pattern: /unable to validate email|invalid format/i,
    message: CODE_MESSAGES.validation_failed,
  },
  {
    pattern: /failed to fetch|network|fetch failed/i,
    message: "Tidak bisa terhubung ke server. Periksa koneksi internetmu.",
  },
];

/**
 * Translates a Supabase auth error into a friendly Indonesian message. The raw
 * error is always logged via `console.error` so the original detail is not
 * lost when the user only sees the translated text.
 *
 * @param {unknown} error Error thrown by a supabase.auth call.
 * @param {string} [fallbackMessage] Message used when the error is unknown.
 * @returns {string}
 */
export function translateAuthError(error, fallbackMessage) {
  console.error("Supabase auth error:", error);

  const fallback = fallbackMessage || GENERIC_AUTH_ERROR_MESSAGE;

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const code = "code" in error ? error.code : undefined;

  if (typeof code === "string" && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  const message = "message" in error ? error.message : undefined;

  if (typeof message === "string" && message) {
    const match = MESSAGE_PATTERNS.find(({ pattern }) => pattern.test(message));

    if (match) {
      return match.message;
    }
  }

  return fallback;
}
