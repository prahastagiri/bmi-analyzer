export const metadata = {
  title: "Reset Password",
  description: "Buat password baru untuk akun BMI Analyzer-mu.",
  robots: { index: false },
};

/**
 * Metadata-only wrapper: the reset-password page itself is a client
 * component and cannot export `metadata`. The page only works from a
 * recovery link, so it is marked noindex.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").ReactNode}
 */
export default function ResetPasswordLayout({ children }) {
  return children;
}
