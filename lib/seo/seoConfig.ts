/**
 * Global SEO defaults: single source for brand, URLs, and fallbacks.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.exestools.com).
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
  siteUrl: envUrl ?? "https://www.exestools.com",
  defaultTitle: "Free Online Tools - ExesTools",
  defaultDescription:
    "Free online tools for text, developers, and images. Fast, secure, and easy to use.",
  /** Optional: set NEXT_PUBLIC_TWITTER_HANDLE without @ */
  twitterSite: process.env.NEXT_PUBLIC_TWITTER_SITE,
  locale: "en_US",
} as const;

/** GA4 Measurement ID. Override with NEXT_PUBLIC_GA_MEASUREMENT_ID (set empty to disable in dev). */
export const ga4MeasurementId =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID !== undefined
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : "G-JBGC5KFMLG";
