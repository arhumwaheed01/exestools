export const siteConfig = {
  name: "ExesTools",
  /** Preferred host — matches live Vercel apex→www redirect */
  domain: "https://www.exestools.com",
  url: "https://www.exestools.com",
  tagline: "Free online tools for everyday decisions",
  defaultTitle: "Free Spinner Wheel Online — Spin & Decide | ExesTools",
  defaultDescription:
    "Free online spinner wheel. Add your options, hit SPIN, and get a fair result. Save in your browser or share a link—no signup on ExesTools.",
  contactEmail: "hello@exestools.com",
  ogImagePath: "/og.png",
} as const;

export function absoluteUrl(path: string): string {
  const base = siteConfig.domain.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
