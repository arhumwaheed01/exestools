import type { MetadataRoute } from "next";
import { getPublishedGuides } from "@/lib/guides";
import { siteConfig } from "@/lib/seo";
import { LASTMOD } from "@/lib/seo/lastmod";

const routes = Object.keys(LASTMOD);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => {
    const isHome = path === "/";
    const isGuidesHub = path === "/guides";
    const isTool =
      path === "/" ||
      path.includes("wheel") ||
      path.includes("spinner") ||
      path.includes("picker") ||
      path.includes("team") ||
      path.includes("number") ||
      path.includes("secret-santa") ||
      path.includes("raffle") ||
      path.includes("bingo");
    const date = LASTMOD[path] ?? "2026-09-26";
    return {
      url: `${siteConfig.url}${isHome ? "" : path}`,
      lastModified: new Date(`${date}T00:00:00.000Z`),
      changeFrequency: isHome || isGuidesHub ? "weekly" : "monthly",
      priority: isHome ? 1 : isGuidesHub ? 0.8 : isTool ? 0.85 : 0.5,
    };
  });

  const publishedGuides = getPublishedGuides();
  // /guides is in LASTMOD; skip it when building guide article URLs
  const guideEntries: MetadataRoute.Sitemap = publishedGuides.map((g) => ({
    url: `${siteConfig.url}/guides/${g.slug}`,
    lastModified: new Date(`${g.frontmatter.updated}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...guideEntries];
}
