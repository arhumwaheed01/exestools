import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { LASTMOD } from "@/lib/seo/lastmod";

const routes = Object.keys(LASTMOD);

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => {
    const isHome = path === "/";
    const isTool =
      path === "/" ||
      path.includes("wheel") ||
      path.includes("spinner") ||
      path.includes("picker") ||
      path.includes("team") ||
      path.includes("number");
    const date = LASTMOD[path] ?? "2026-09-26";
    return {
      url: `${siteConfig.url}${isHome ? "" : path}`,
      lastModified: new Date(`${date}T00:00:00.000Z`),
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : isTool ? 0.85 : 0.5,
    };
  });
}
