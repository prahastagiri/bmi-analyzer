import * as Sentry from "@sentry/nextjs";

// Error monitoring untuk runtime Node.js (SSR/prerender). Konfigurasi sengaja
// disamakan dengan sisi client: hanya error, aktif hanya di production.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0,
});
