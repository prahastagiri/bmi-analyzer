"use client";

import Link from "next/link";
import { Download, Loader2, LogIn, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Action panel for persistence and export. It stays separate from the form so
 * the responsibilities of "calculate" and "post-process result" remain clear.
 * Feedback for these actions renders right below the buttons so the user
 * always sees that their request is being processed.
 *
 * @param {{
 *   actionError: string,
 *   actionStatus: string,
 *   busyAction: "" | "save" | "jpg" | "pdf",
 *   hasResult: boolean,
 *   loginHref: string,
 *   onExport: (type: "jpg" | "pdf") => void,
 *   onSave: () => void,
 *   pendingAction: string,
 *   registerHref: string
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function BmiActions({
  actionError,
  actionStatus,
  busyAction,
  hasResult,
  loginHref,
  onExport,
  onSave,
  pendingAction,
  registerHref,
}) {
  const isBusy = Boolean(busyAction);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi lanjutan</CardTitle>
        <CardDescription>
          Simpan hasil ke akun atau export hasil ketika analisis sudah siap.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Button onClick={onSave} disabled={!hasResult || isBusy}>
            {busyAction === "save" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {busyAction === "save" ? "Menyimpan..." : "Simpan hasil"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onExport("jpg")}
            disabled={!hasResult || isBusy}
          >
            {busyAction === "jpg" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {busyAction === "jpg" ? "Menyiapkan JPG..." : "Export JPG"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onExport("pdf")}
            disabled={!hasResult || isBusy}
          >
            {busyAction === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {busyAction === "pdf" ? "Menyiapkan PDF..." : "Export PDF"}
          </Button>
        </div>

        {actionError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <p>{actionError}</p>
            {pendingAction ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={loginHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 font-medium text-rose-700 ring-1 ring-rose-200"
                >
                  <LogIn className="h-4 w-4" />
                  Login sekarang
                </Link>
                <Link
                  href={registerHref}
                  className="inline-flex items-center rounded-xl bg-rose-700 px-3 py-2 font-medium text-white"
                >
                  Buat akun
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {actionStatus ? (
          <div
            className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            role="status"
          >
            {isBusy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
            {actionStatus}
          </div>
        ) : null}

        <p className="text-sm leading-6 text-slate-500">
          Perhitungan bisa dipakai tanpa login. Namun login wajib jika ingin
          menyimpan hasil atau export file.
        </p>
      </CardContent>
    </Card>
  );
}
