import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook: memuat konfigurasi Sentry sesuai runtime yang
 * sedang berjalan (Node.js atau edge).
 *
 * @returns {Promise<void>}
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
