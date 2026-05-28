import { cn } from "@/lib/utils";

/**
 * Styled label primitive paired with input fields.
 *
 * @param {import("react").LabelHTMLAttributes<HTMLLabelElement> & {
 *   className?: string
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function Label({ className, ...props }) {
  return (
    <label
      className={cn("text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}
