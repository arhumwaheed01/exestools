import type { MetadataRoute } from "next";
import { absoluteProductionUrl } from "@/lib/seo/generateMeta";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteProductionUrl("/sitemap.xml"),
  };
}
