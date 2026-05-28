import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 *
 * @param {...string} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number using Indonesian locale so metric values are easier to read.
 *
 * @param {number} value
 * @param {number} [digits=1]
 * @returns {string}
 */
export function formatNumber(value, digits = 1) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Formats a timestamp into a compact date + time string for history cards.
 *
 * @param {string | number | Date} value
 * @returns {string}
 */
export function formatCompactDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
