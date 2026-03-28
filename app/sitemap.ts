import type { MetadataRoute } from "next";
import { absoluteProductionUrl } from "@/lib/seo/generateMeta";
import { allTools } from "@/lib/content/textToolsData";

const STATIC_PATHS = [
  "/",
  "/text-tools",
  "/developer-tools",
  "/image-tools",
  "/pdf-tools",
  "/tools",
  "/privacy-policy",
  "/terms-of-service",
  "/contact",
  "/about",
  "/disclaimer",
  "/dmca",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteProductionUrl(path),
    lastModified,
  }));

  const allToolSlugs = Array.from(new Set(allTools.map((t) => t.slug)));

  const toolEntries: MetadataRoute.Sitemap = allToolSlugs.map((slug) => ({
    url: absoluteProductionUrl(`/tools/${slug}`),
    lastModified,
  }));

  return [...staticEntries, ...toolEntries];
}
