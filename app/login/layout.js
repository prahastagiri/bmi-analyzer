export const metadata = {
  title: "Login",
  description:
    "Login ke akun BMI Analyzer untuk menyimpan hasil, membuka riwayat, dan export analisis.",
};

/**
 * Metadata-only wrapper: the login page itself is a client component and
 * cannot export `metadata`.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").ReactNode}
 */
export default function LoginLayout({ children }) {
  return children;
}
