"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Fallback UI ketika render error lolos sampai root layout. Halaman ini
 * menggantikan seluruh root layout, sehingga stylesheet global tidak tersedia
 * dan styling harus inline. Error-nya dilaporkan ke Sentry.
 *
 * @param {{ error: Error & { digest?: string }, reset: () => void }} props
 * @returns {import("react").JSX.Element}
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          alignItems: "center",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: "28rem", padding: "1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Terjadi kesalahan
          </h1>
          <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Maaf, ada masalah tak terduga di aplikasi. Kesalahan ini sudah
            terlaporkan otomatis. Coba muat ulang — jika masih gagal, kembali
            beberapa saat lagi.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: "#0284c7",
              border: "none",
              borderRadius: "0.75rem",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.6rem 1.5rem",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
