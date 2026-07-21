import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Minta link reset password untuk akun HealthyMuch-mu.",
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
