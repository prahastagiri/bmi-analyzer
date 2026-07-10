export const metadata = {
  title: "Riwayat",
  description: "Riwayat pengukuran BMI dan kebutuhan nutrisimu.",
  robots: { index: false },
};

/**
 * Metadata-only wrapper: the history page itself is a client component and
 * cannot export `metadata`. The page is account-only, so it is marked
 * noindex.
 *
 * @param {{ children: import("react").ReactNode }} props
 * @returns {import("react").ReactNode}
 */
export default function HistoryLayout({ children }) {
  return children;
}
