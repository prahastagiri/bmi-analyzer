"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

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
import { translateAuthError } from "@/lib/auth-errors";
import { createSupabaseBrowserClient } from "@/lib/supabase";

/** Never notifies: the recovery hash is read once at page load. */
function subscribeToNothing() {
  return () => {};
}

let capturedRecoveryHash;

/**
 * Captures `window.location.hash` once per page load so the value stays
 * stable even after supabase-js strips the hash while processing it.
 *
 * @returns {string}
 */
function getRecoveryHashSnapshot() {
  if (capturedRecoveryHash === undefined) {
    capturedRecoveryHash = window.location.hash;
  }

  return capturedRecoveryHash;
}

/**
 * Reset-password route. Supabase redirects the recovery link here with a
 * temporary session; the form then saves a new password for that session's
 * user. When the link is expired Supabase sends error details in the URL
 * hash instead, which this page surfaces in Indonesian.
 *
 * @returns {import("react").JSX.Element}
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { authEnabled, loading: authLoading, user } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const recoveryHash = useSyncExternalStore(
    subscribeToNothing,
    getRecoveryHashSnapshot,
    () => ""
  );

  // An expired/used recovery link never creates a session; Supabase reports
  // it via the URL hash (#error=...&error_code=otp_expired&...).
  const linkError = useMemo(() => {
    const params = new URLSearchParams(recoveryHash.replace(/^#/, ""));
    const errorCode = params.get("error_code");

    if (!errorCode) {
      return "";
    }

    return translateAuthError({
      code: errorCode,
      message: params.get("error_description") || "",
    });
  }, [recoveryHash]);

  /**
   * Saves the new password for the recovery session's user.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!authEnabled) {
      setError(
        "Supabase belum dikonfigurasi. Tambahkan env Supabase untuk mengaktifkan reset password."
      );
      return;
    }

    if (!form.password || !form.confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password belum sama.");
      return;
    }

    if (!user) {
      setError(
        "Sesi reset password tidak ditemukan. Buka halaman ini lewat link di email, atau minta link baru."
      );
      return;
    }

    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: form.password,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("Password berhasil diubah. Mengarahkan ke riwayatmu...");
      router.push("/history");
      router.refresh();
    } catch (updateError) {
      setError(translateAuthError(updateError));
    } finally {
      setLoading(false);
    }
  }

  const showMissingSessionNotice = !authLoading && !user && !linkError;

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Buat password baru</CardTitle>
          <CardDescription>
            Masukkan password baru untuk akunmu. Setelah tersimpan, kamu tetap
            login dan bisa langsung memakai aplikasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkError ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {linkError}
              </div>
              <p className="text-sm text-slate-500">
                <Link href="/forgot-password" className="font-medium text-sky-700">
                  Minta link reset baru
                </Link>
                .
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {showMissingSessionNotice ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Halaman ini hanya berfungsi jika dibuka lewat link reset
                  password di email. Belum menerima email-nya?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-sky-700"
                  >
                    Minta link reset
                  </Link>
                  .
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="password">Password baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi password baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password baru"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {status ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {status}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan password baru"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
