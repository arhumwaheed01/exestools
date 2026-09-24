export const siteConfig = {
  name: "ExesTools",
  /** Preferred host — matches live Vercel apex→www redirect */
  domain: "https://www.exestools.com",
  url: "https://www.exestools.com",
  tagline: "Free online tools for everyday decisions",
  defaultTitle: "Free Spinner Wheel — Random Name & Prize Picker | ExesTools",
  defaultDescription:
    "Create a custom spinner wheel online. Add names or prizes, spin for a fair random result, save your list locally, and share a link. Free on ExesTools.",
  contactEmail: "hello@exestools.com",
  ogImagePath: "/og.png",
} as const;

export function absoluteUrl(path: string): string {
  const base = siteConfig.domain.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
