import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Premium",
  description:
    "Buka riwayat tanpa batas, grafik penuh, estimasi target, dan export dengan HealthyMuch Premium. Gabung waitlist.",
};

export default function UpgradeLayout({ children }: { children: ReactNode }) {
  return children;
}
