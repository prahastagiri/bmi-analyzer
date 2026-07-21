import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kalkulator BMI & Kebutuhan Nutrisi Harian — HealthyMuch",
    template: "%s — HealthyMuch",
  },
  description:
    "Kalkulator BMI gratis: hitung BMI, berat badan ideal, dan kebutuhan kalori, protein, lemak, serta karbohidrat harianmu. Tanpa login, lengkap dengan riwayat dan export hasil.",
  openGraph: {
    title: "Kalkulator BMI & Kebutuhan Nutrisi Harian — HealthyMuch",
    description:
      "Hitung BMI, berat badan ideal, dan kebutuhan nutrisi harianmu secara gratis, langsung tanpa login.",
    url: SITE_URL,
    siteName: "HealthyMuch",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  HealthyMuch — panduan umum, bukan pengganti konsultasi
                  medis.
                </p>
                <nav className="flex gap-4">
                  <Link href="/privacy" className="hover:text-slate-700">
                    Kebijakan Privasi
                  </Link>
                  <Link href="/terms" className="hover:text-slate-700">
                    Ketentuan Layanan
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
