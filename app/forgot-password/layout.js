export const metadata = {
  title: "Lupa Password",
  description: "Minta link reset password untuk akun HealthyMuch-mu.",
};

/**
 * Metadata-only wrapper: the forgot-password page itself is a client
 * component and cannot export `metadata`.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").ReactNode}
 */
export default function ForgotPasswordLayout({ children }) {
  return children;
}
