/**
 * Per-URL lastmod for the sitemap (MA-11 / BK-03).
 * Update an entry ONLY when that page's visible copy, structured data, or links change.
 * Do not stamp every page with the build date.
 */
export const LASTMOD: Record<string, string> = {
  "/": "2026-10-07",
  "/random-name-picker": "2026-10-07",
  "/classroom-spinner": "2026-10-07",
  "/prize-wheel": "2026-10-07",
  "/yes-no-wheel": "2026-10-07",
  "/random-team-generator": "2026-10-07",
  "/secret-santa-generator": "2026-10-07",
  "/random-number-wheel": "2026-10-07",
  "/raffle-generator": "2026-10-07",
  "/about": "2026-10-06",
  "/contact": "2026-09-26",
  "/privacy-policy": "2026-10-06",
  "/terms": "2026-10-01",
  "/dmca": "2026-09-24",
};

/** IndexNow key (also served at /{key}.txt). */
export const INDEXNOW_KEY = "fa2039ab052c6167d1407c1dd1daa02d";

export function absoluteSitemapUrl(path: string): string {
  if (path === "/") return "https://www.exestools.com/";
  return `https://www.exestools.com${path}`;
}

/** Paths whose lastmod equals the given YYYY-MM-DD (for IndexNow after a ship). */
export function pathsWithLastmod(date: string): string[] {
  return Object.entries(LASTMOD)
    .filter(([, d]) => d === date)
    .map(([path]) => path);
}
