import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Riwayat",
  description: "Riwayat pengukuran BMI dan kebutuhan nutrisimu.",
  robots: { index: false },
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
