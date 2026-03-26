import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/generateMeta";
import { getDeveloperToolsGridItems } from "@/lib/content/developerToolsData";
import { getImageToolsGridItems } from "@/lib/content/imageToolsData";
import { textTools } from "@/lib/content/textToolsData";

const STATIC_PATHS = [
  "/",
  "/text-tools",
  "/developer-tools",
  "/image-tools",
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
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority:
      path === "/"
        ? 1
        : path === "/privacy-policy" ||
            path === "/terms-of-service" ||
            path === "/contact" ||
            path === "/about" ||
            path === "/disclaimer" ||
            path === "/dmca"
          ? 0.5
          : 0.85,
  }));

  const allToolSlugs = Array.from(
    new Set([
      ...textTools.map((t) => t.slug),
      ...getDeveloperToolsGridItems().map((t) => t.slug),
      ...getImageToolsGridItems().map((t) => t.slug),
    ]),
  );

  const toolEntries: MetadataRoute.Sitemap = allToolSlugs.map((slug) => ({
    url: absoluteUrl(`/tools/${slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...toolEntries];
}
