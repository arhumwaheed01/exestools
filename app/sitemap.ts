import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const routes = [
  "/",
  "/random-name-picker",
  "/classroom-spinner",
  "/prize-wheel",
  "/yes-no-wheel",
  "/about",
  "/privacy-policy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((path) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/random") || path.includes("wheel") || path.includes("spinner") ? 0.8 : 0.6,
  }));
}
