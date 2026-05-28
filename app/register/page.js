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
import { writeContinuationIntent } from "@/lib/bmi-session";
import { createSupabaseBrowserClient } from "@/lib/supabase";

/**
 * Registration route for creating a Supabase auth account with basic client
 * validation before the request is sent.
 *
 * @returns {import("react").JSX.Element}
 */
export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}

/**
 * Inner register component that uses `useSearchParams`.
 *
 * @returns {import("react").JSX.Element}
 */
function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authEnabled, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const nextPath = searchParams.get("next") || "/history";
  const resumeAction = searchParams.get("resumeAction") || "";
  const loginHref = resumeAction
    ? `/login?next=${encodeURIComponent(nextPath)}&resumeAction=${encodeURIComponent(
        resumeAction
      )}`
    : "/login";

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [nextPath, router, user]);

  /**
   * Creates a new Supabase user, then redirects the user to the login page.
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
        "Supabase belum dikonfigurasi. Tambahkan env Supabase untuk mengaktifkan register."
      );
      return;
    }

    if (!form.email || !form.password || !form.confirmPassword) {
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

    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (resumeAction === "save" || resumeAction === "export") {
        writeContinuationIntent({
          action: resumeAction,
          returnTo: nextPath,
        });
      }

      setStatus(
        resumeAction
          ? "Akun berhasil dibuat. Lanjut login untuk kembali ke kalkulator dan menyelesaikan aksi sebelumnya."
          : "Akun berhasil dibuat. Jika email confirmation aktif, cek inbox-mu lalu login."
      );
      router.push(loginHref);
    } catch (signUpError) {
      setError(signUpError.message || "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Buat akun baru</CardTitle>
          <CardDescription>
            Akun dipakai untuk menyimpan history dan membuka fitur export hasil.
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
              <Label htmlFor="confirmPassword">Konfirmasi password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
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
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href={loginHref} className="font-medium text-sky-700">
              Login di sini
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
