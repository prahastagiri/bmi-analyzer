"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActivitySquare, History, LogOut, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * Shared header used across all routes. It reflects auth state and exposes the
 * navigation paths that matter most for the current project.
 *
 * @returns {import("react").JSX.Element}
 */
export function AppHeader() {
  const router = useRouter();
  const { authEnabled, loading, user } = useAuth();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <ActivitySquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">HealthyMuch</p>
            <p className="text-xs text-slate-500">
              Hitung BMI, nutrisi, dan simpan hasilmu
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <History className="h-4 w-4" />
            Riwayat
          </Link>

          {!authEnabled ? (
            <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline-flex">
              Demo mode
            </span>
          ) : null}

          {loading ? (
            <span className="text-sm text-slate-500">Memuat sesi...</span>
          ) : user ? (
            <>
              <span className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 md:inline-flex">
                <UserRound className="h-4 w-4" />
                {user.email}
              </span>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
