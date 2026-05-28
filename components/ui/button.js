import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-sky-600 text-white hover:bg-sky-700",
        secondary:
          "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
        ghost: "text-slate-700 hover:bg-slate-100",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Lightweight button primitive used across the app. Styling variants are kept
 * close to the component so new developers can inspect and extend them quickly.
 *
 * @param {import("react").ButtonHTMLAttributes<HTMLButtonElement> & {
 *   className?: string,
 *   variant?: "default" | "secondary" | "ghost" | "destructive",
 *   size?: "default" | "sm" | "lg"
 * }} props
 * @returns {import("react").JSX.Element}
 */
export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
