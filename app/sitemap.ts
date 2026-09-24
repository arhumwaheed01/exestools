import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

const routes = [
  "/",
  "/random-name-picker",
  "/classroom-spinner",
  "/prize-wheel",
  "/yes-no-wheel",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/dmca",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-24");
  return routes.map((path) => {
    const isHome = path === "/";
    const isTool =
      path === "/" ||
      path.includes("wheel") ||
      path.includes("spinner") ||
      path.includes("picker");
    return {
      url: `${siteConfig.url}${isHome ? "" : path}`,
      lastModified,
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : isTool ? 0.85 : 0.5,
    };
  });
}
