"use client";

import Link from "next/link";
import { useState } from "react";

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

/**
 * Forgot-password route: asks for an email address and sends the Supabase
 * password-recovery link that redirects back to `/reset-password`.
 *
 * @returns {import("react").JSX.Element}
 */
export default function ForgotPasswordPage() {
  const { authEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Requests a password-recovery email from Supabase.
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

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Supabase client tidak tersedia.");
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setStatus(
        "Jika email tersebut terdaftar, link reset password sudah dikirim. Cek inbox (dan folder spam), lalu buka link-nya."
      );
    } catch (resetError) {
      setError(translateAuthError(resetError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl px-4 py-10 sm:px-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Lupa password</CardTitle>
          <CardDescription>
            Masukkan email akunmu. Kami akan mengirim link untuk membuat
            password baru.
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {loading ? "Mengirim..." : "Kirim link reset"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-slate-500">
            Sudah ingat password-mu?{" "}
            <Link href="/login" className="font-medium text-sky-700">
              Kembali ke login
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
