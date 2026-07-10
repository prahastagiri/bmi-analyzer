import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

// Tanpa SENTRY_AUTH_TOKEN source map tidak di-upload (stack trace di Sentry
// tampil ter-minify) tetapi penangkapan error tetap berjalan penuh. Jika nanti
// ingin stack trace terbaca, tambahkan org, project, dan authToken di sini.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
});
