import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GENERIC_AUTH_ERROR_MESSAGE,
  translateAuthError,
} from "./auth-errors";

describe("translateAuthError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps known error codes to Indonesian messages", () => {
    expect(
      translateAuthError({ code: "invalid_credentials", message: "Invalid login credentials" })
    ).toMatch(/email atau password salah/i);
    expect(
      translateAuthError({ code: "email_not_confirmed", message: "Email not confirmed" })
    ).toMatch(/belum dikonfirmasi/i);
    expect(
      translateAuthError({ code: "user_already_exists", message: "User already registered" })
    ).toMatch(/sudah terdaftar/i);
    expect(
      translateAuthError({ code: "otp_expired", message: "Email link is invalid or has expired" })
    ).toMatch(/kedaluwarsa/i);
    expect(
      translateAuthError({
        code: "over_email_send_rate_limit",
        message: "Email rate limit exceeded",
      })
    ).toMatch(/terlalu banyak permintaan email/i);
  });

  it("falls back to message-pattern matching when code is missing", () => {
    expect(translateAuthError({ message: "Invalid login credentials" })).toMatch(
      /email atau password salah/i
    );
    expect(translateAuthError({ message: "Email not confirmed" })).toMatch(
      /belum dikonfirmasi/i
    );
    expect(
      translateAuthError({ message: "Password should be at least 6 characters" })
    ).toMatch(/minimal 6 karakter/i);
    expect(translateAuthError({ message: "Failed to fetch" })).toMatch(
      /koneksi internet/i
    );
  });

  it("returns the generic fallback for unknown errors", () => {
    expect(translateAuthError({ message: "Something exotic happened" })).toBe(
      GENERIC_AUTH_ERROR_MESSAGE
    );
    expect(translateAuthError(null)).toBe(GENERIC_AUTH_ERROR_MESSAGE);
    expect(translateAuthError(undefined)).toBe(GENERIC_AUTH_ERROR_MESSAGE);
    expect(translateAuthError("plain string")).toBe(GENERIC_AUTH_ERROR_MESSAGE);
  });

  it("uses the custom fallback when provided", () => {
    expect(
      translateAuthError({ message: "Something exotic" }, "Pendaftaran gagal. Coba lagi.")
    ).toBe("Pendaftaran gagal. Coba lagi.");
  });

  it("always logs the raw error", () => {
    const raw = { code: "invalid_credentials", message: "Invalid login credentials" };
    translateAuthError(raw);
    expect(console.error).toHaveBeenCalledWith("Supabase auth error:", raw);
  });
});
