/**
 * Global SEO defaults — single source for brand, URLs, and fallbacks.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://exestools.com).
 */

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

const envUrl =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
    ? normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
    : null;

export const defaultSEO = {
  siteName: "ExesTools",
  /** Canonical origin for sitemaps, canonical tags, and OG URLs */
  siteUrl: envUrl ?? "https://yourdomain.com",
  defaultTitle: "Free Online Tools - ExesTools",
  defaultDescription:
    "Free online tools for text, developers, and images. Fast, secure, and easy to use.",
  /** Optional: set NEXT_PUBLIC_TWITTER_HANDLE without @ */
  twitterSite: process.env.NEXT_PUBLIC_TWITTER_SITE,
  locale: "en_US",
} as const;
