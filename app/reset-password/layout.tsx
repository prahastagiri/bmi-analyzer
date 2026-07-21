import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Buat password baru untuk akun HealthyMuch-mu.",
  robots: { index: false },
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
