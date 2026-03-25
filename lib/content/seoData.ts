/**
 * Page-level SEO copy (paths + text). Per-tool rows are built from getTextToolFullPage.
 */

import type { Metadata } from "next";
import { buildPageMetadata, buildToolPageMetadata } from "@/lib/seo/generateMeta";
import { defaultSEO } from "@/lib/seo/seoConfig";
import { getTextToolFullPage } from "@/lib/content/getTextToolFullPage";
import { allTools } from "@/lib/content/textToolsData";

export type PageSeo = {
  title: string;
  description: string;
};

export type RoutedPageSeo = PageSeo & { path: string };

export const seoData = {
  home: {
    path: "/",
    title: defaultSEO.defaultTitle,
    description: defaultSEO.defaultDescription,
  },
  textTools: {
    path: "/text-tools",
    title: "Free Text Tools Online",
    description:
      "Browse free browser-based text tools: word counter, character counter, case converters, find and replace, and more. Fast, private, no signup.",
  },
  allTools: {
    path: "/tools",
    title: "All Free Online Tools",
    description:
      "Directory of text utilities, developer tools (JSON, encoding, hashes, JWT), and image tools—stable URLs, browser-based, easy to share.",
  },
  developerTools: {
    path: "/developer-tools",
    title: "Free Developer Tools Online",
    description:
      "JSON formatter, Base64, URL encode/decode, hash generators, formatters, minifiers, JWT decode, and more—free in your browser.",
  },
  imageTools: {
    path: "/image-tools",
    title: "Free Image Tools Online",
    description:
      "Compress, convert, resize, crop, rotate, and optimize images online. Client-side processing with preview and download.",
  },
} as const satisfies Record<string, RoutedPageSeo>;

const toolSeoEntries = Object.fromEntries(
  allTools.map((t) => {
    const full = getTextToolFullPage(t.slug);
    const meta = full?.meta ?? {
      title: `${t.name} | ${defaultSEO.siteName}`,
      description: t.description,
    };
    return [t.slug, meta];
  }),
) as Record<string, PageSeo>;

export const seoDataBySlug: Record<string, PageSeo> = {
  ...toolSeoEntries,
};

export function getSeoForTool(slug: string): PageSeo | undefined {
  return seoDataBySlug[slug];
}

/** Static hub pages — absolute titles, canonical + OG + Twitter */
export function toMetadata(seo: RoutedPageSeo): Metadata {
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    absoluteTitle: true,
  });
}

export function toolSlugMetadata(slug: string, seo: PageSeo): Metadata {
  return buildToolPageMetadata(slug, seo);
}
