"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

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
import { clearContinuationIntent, writeContinuationIntent } from "@/lib/bmi-session";
import { createSupabaseBrowserClient } from "@/lib/supabase";

/**
 * Login route for Supabase email/password authentication.
 *
 * @returns {import("react").JSX.Element}
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

/**
 * Inner login component that uses `useSearchParams`.
 *
 * @returns {import("react").JSX.Element}
 */
function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authEnabled, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get("next") || "/history";
  const resumeAction = searchParams.get("resumeAction") || "";
  const registerHref = resumeAction
    ? `/register?next=${encodeURIComponent(nextPath)}&resumeAction=${encodeURIComponent(
        resumeAction
      )}`
    : "/register";

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  /**
   * Attempts to sign the user in with Supabase and redirects to the history
   * page when the login succeeds.
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
        "Supabase belum dikonfigurasi. Tambahkan env Supabase untuk mengaktifkan login."
      );
      return;
    }

    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (resumeAction === "save" || resumeAction === "export") {
        writeContinuationIntent({
          action: resumeAction,
          returnTo: nextPath,
        });
      } else {
        clearContinuationIntent();
      }

      setStatus(
        resumeAction
          ? "Login berhasil. Mengembalikanmu ke kalkulator untuk melanjutkan aksi sebelumnya..."
          : "Login berhasil. Mengarahkan ke halaman berikutnya..."
      );
      router.push(
        resumeAction
          ? `${nextPath}?resumeAction=${encodeURIComponent(resumeAction)}`
          : nextPath
      );
      router.refresh();
    } catch (signInError) {
      setError(signInError.message || "Login gagal. Periksa kembali akunmu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Login ke akunmu</CardTitle>
          <CardDescription>
            Login diperlukan untuk menyimpan hasil, membuka riwayat, dan export
            analisis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
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
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href={registerHref} className="font-medium text-sky-700">
              Daftar di sini
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
