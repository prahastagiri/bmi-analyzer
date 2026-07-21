import * as Sentry from "@sentry/nextjs";

// Error monitoring untuk sisi browser. Sengaja hanya menangkap error (tanpa
// tracing/replay) agar kuota free tier Sentry awet dan bundle tetap ringan.
// Aktif hanya di production supaya error saat development tidak ikut terkirim.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  tracesSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
