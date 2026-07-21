import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun HealthyMuch gratis untuk menyimpan riwayat pengukuran dan export hasil analisis.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
