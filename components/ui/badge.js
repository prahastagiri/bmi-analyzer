import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-sky-100 text-sky-700",
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-700",
        danger: "bg-rose-100 text-rose-700",
        outline: "border border-slate-200 bg-white text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Small status badge used for BMI and activity labels.
 *
 * @param {import("react").HTMLAttributes<HTMLSpanElement> & {
 *   className?: string,
 *   variant?: "default" | "success" | "warning" | "danger" | "outline"
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
