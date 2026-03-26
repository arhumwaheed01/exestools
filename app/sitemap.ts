import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/generateMeta";
import { allTools } from "@/lib/content/textToolsData";

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

  const toolEntries: MetadataRoute.Sitemap = allTools.map((t) => ({
    url: absoluteUrl(`/tools/${t.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...toolEntries];
}
