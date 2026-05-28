import { cn } from "@/lib/utils";

/**
 * Styled native select used for simple option lists such as gender and
 * activity level.
 *
 * @param {import("react").SelectHTMLAttributes<HTMLSelectElement> & {
 *   className?: string,
 *   children?: import("react").ReactNode
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
