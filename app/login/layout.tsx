import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login ke akun HealthyMuch untuk menyimpan hasil, membuka riwayat, dan export analisis.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
