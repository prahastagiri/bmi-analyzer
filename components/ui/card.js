import { cn } from "@/lib/utils";

/**
 * Base card container used to keep layout styling consistent across pages.
 *
 * @param {import("react").HTMLAttributes<HTMLDivElement>} props
 * @returns {import("react").JSX.Element}
 */
export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Shared header wrapper for card titles and descriptions.
 *
 * @param {import("react").HTMLAttributes<HTMLDivElement>} props
 * @returns {import("react").JSX.Element}
 */
export function CardHeader({ className, ...props }) {
  return <div className={cn("space-y-1.5 p-6", className)} {...props} />;
}

/**
 * Shared title text for cards.
 *
 * @param {import("react").HTMLAttributes<HTMLHeadingElement>} props
 * @returns {import("react").JSX.Element}
 */
export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-slate-950", className)}
      {...props}
    />
  );
}

/**
 * Shared descriptive text for cards.
 *
 * @param {import("react").HTMLAttributes<HTMLParagraphElement>} props
 * @returns {import("react").JSX.Element}
 */
export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-slate-600", className)} {...props} />;
}

/**
 * Main content wrapper for a card body.
 *
 * @param {import("react").HTMLAttributes<HTMLDivElement>} props
 * @returns {import("react").JSX.Element}
 */
export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

/**
 * Footer row for card actions.
 *
 * @param {import("react").HTMLAttributes<HTMLDivElement>} props
 * @returns {import("react").JSX.Element}
 */
export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center gap-3 p-6 pt-0", className)}
      {...props}
    />
  );
}
