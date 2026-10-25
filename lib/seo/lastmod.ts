/**
 * Per-URL lastmod for the sitemap (MA-11 / BK-03).
 * Update an entry ONLY when that page's visible copy, structured data, or links change.
 * Do not stamp every page with the build date.
 *
 * Guides (except the hub) are NOT listed here: each guide's sitemap lastmod comes from
 * its frontmatter `updated` in content/guides/*.md.
 */
export const LASTMOD: Record<string, string> = {
  // Homepage JSON-LD merged into one @graph (2026-10-20)
  "/": "2026-10-21",
  "/random-name-picker": "2026-10-25",
  "/classroom-spinner": "2026-10-23",
  "/prize-wheel": "2026-10-21",
  "/yes-no-wheel": "2026-10-19",
  "/random-team-generator": "2026-10-21",
  "/secret-santa-generator": "2026-10-25",
  "/random-number-wheel": "2026-10-19",
  "/raffle-generator": "2026-10-25",
  "/bingo-card-generator": "2026-10-25",
  "/wheel-gallery": "2026-10-25",
  // Trust / legal
  "/about": "2026-10-25",
  "/contact": "2026-10-19",
  "/privacy-policy": "2026-10-22",
  "/terms": "2026-10-19",
  "/dmca": "2026-10-12",
  // Guides hub
  "/guides": "2026-10-25",
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
