export const siteConfig = {
  name: "ExesTools",
  domain: "https://exestools.com",
  /** Alias used by robots/sitemap helpers */
  url: "https://exestools.com",
  tagline: "Free online tools for everyday decisions",
  defaultTitle: "Free Spinner Wheel — Random Name & Prize Picker | ExesTools",
  defaultDescription:
    "Create a custom spinner wheel online. Add names or prizes, spin for a fair random result, save your list locally, and share a link. Free on ExesTools.",
} as const;

export function absoluteUrl(path: string): string {
  const base = siteConfig.domain.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
