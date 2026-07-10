import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BMI Analyzer",
  description:
    "Hitung BMI, berat badan ideal, dan kebutuhan kalori, protein, lemak, serta karbohidrat harianmu. Gratis tanpa login, lengkap dengan riwayat dan export hasil.",
};

/**
 * Root app shell that injects global styles, auth context, and the shared
 * header for every route in the App Router tree.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").JSX.Element}
 */
export default function RootLayout({ children }) {
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
                  BMI Analyzer — panduan umum, bukan pengganti konsultasi
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
