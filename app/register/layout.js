export const metadata = {
  title: "Daftar",
  description:
    "Buat akun BMI Analyzer gratis untuk menyimpan riwayat pengukuran dan export hasil analisis.",
};

/**
 * Metadata-only wrapper: the register page itself is a client component and
 * cannot export `metadata`.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").ReactNode}
 */
export default function RegisterLayout({ children }) {
  return children;
}
