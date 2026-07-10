import { SITE_URL } from "@/lib/site";

/**
 * Robots rules: everything public is crawlable; account-only and
 * recovery-session pages are excluded.
 *
 * @returns {import("next").MetadataRoute.Robots}
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/history", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
