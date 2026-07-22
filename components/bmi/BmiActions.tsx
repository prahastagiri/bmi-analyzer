"use client";

import Link from "next/link";
import { Download, Loader2, Lock, LogIn, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BmiActionsProps {
  actionError: string;
  actionStatus: string;
  busyAction: "" | "save" | "jpg" | "pdf";
  hasResult: boolean;
  loginHref: string;
  onExport: (type: "jpg" | "pdf") => void;
  onSave: () => void;
  pendingAction: string;
  premium: boolean;
  registerHref: string;
}

export function BmiActions({
  actionError,
  actionStatus,
  busyAction,
  hasResult,
  loginHref,
  onExport,
  onSave,
  pendingAction,
  premium,
  registerHref,
}: BmiActionsProps) {
  const isBusy = Boolean(busyAction);
  // Ikon export mengunci saat free; klik tetap menampilkan ajakan upgrade.
  const jpgIcon =
    busyAction === "jpg" ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : premium ? (
      <Download className="mr-2 h-4 w-4" />
    ) : (
      <Lock className="mr-2 h-4 w-4" />
    );
  const pdfIcon =
    busyAction === "pdf" ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : premium ? (
      <Download className="mr-2 h-4 w-4" />
    ) : (
      <Lock className="mr-2 h-4 w-4" />
    );

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
            {jpgIcon}
            {busyAction === "jpg" ? "Menyiapkan JPG..." : "Export JPG"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onExport("pdf")}
            disabled={!hasResult || isBusy}
          >
            {pdfIcon}
            {busyAction === "pdf" ? "Menyiapkan PDF..." : "Export PDF"}
          </Button>
        </div>

        {!premium ? (
          <Link
            href="/upgrade"
            className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 transition-colors hover:bg-amber-100"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Export JPG/PDF & estimasi target adalah fitur premium. Lihat premium →
          </Link>
        ) : null}

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
