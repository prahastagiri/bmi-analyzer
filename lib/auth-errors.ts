export const GENERIC_AUTH_ERROR_MESSAGE =
  "Terjadi kesalahan. Coba lagi beberapa saat.";

const CODE_MESSAGES: Record<string, string> = {
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

const MESSAGE_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
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

export function translateAuthError(
  error: unknown,
  fallbackMessage?: string
): string {
  console.error("Supabase auth error:", error);

  const fallback = fallbackMessage || GENERIC_AUTH_ERROR_MESSAGE;

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const code = "code" in error ? (error as { code: unknown }).code : undefined;

  if (typeof code === "string" && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  const message =
    "message" in error
      ? (error as { message: unknown }).message
      : undefined;

  if (typeof message === "string" && message) {
    const match = MESSAGE_PATTERNS.find(({ pattern }) => pattern.test(message));

    if (match) {
      return match.message;
    }
  }

  return fallback;
}
