"use client";

import { Download, Save } from "lucide-react";

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
 *
 * @param {{
 *   hasResult: boolean,
 *   onExport: (type: "jpg" | "pdf") => void,
 *   onSave: () => void
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function BmiActions({ hasResult, onExport, onSave }) {
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
          <Button onClick={onSave} disabled={!hasResult}>
            <Save className="mr-2 h-4 w-4" />
            Simpan hasil
          </Button>
          <Button
            variant="secondary"
            onClick={() => onExport("jpg")}
            disabled={!hasResult}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JPG
          </Button>
          <Button
            variant="secondary"
            onClick={() => onExport("pdf")}
            disabled={!hasResult}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <p className="text-sm leading-6 text-slate-500">
          Perhitungan bisa dipakai tanpa login. Namun login wajib jika ingin
          menyimpan hasil atau export file.
        </p>
      </CardContent>
    </Card>
  );
}
