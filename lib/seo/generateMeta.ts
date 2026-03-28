import type { Metadata } from "next";
import { defaultSEO, productionSiteUrl } from "./seoConfig";

/** Absolute URL for a site path (leading slash). Uses `defaultSEO.siteUrl` (env or production). */
export function absoluteUrl(path: string): string {
  const base = defaultSEO.siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/** Absolute URL on the public production domain (sitemap.xml entries, robots sitemap directive). */
export function absoluteProductionUrl(path: string): string {
  const base = productionSiteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Path-only value for `alternates.canonical` and `openGraph.url`.
 * Resolved to an absolute URL via root `metadataBase` (Next.js metadata composition).
 */
export function canonicalPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "" ? "/" : p;
}

function ogAssetPath(relativePath: string): string {
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
}

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Path only, e.g. `/text-tools` or `/tools/word-counter` */
  path: string;
  /** When true, title is emitted as absolute (no layout template suffix). */
  absoluteTitle?: boolean;
  /** Relative to site root, e.g. `/og/default.png` */
  ogImagePath?: string;
  noindex?: boolean;
  keywords?: string[];
};

/**
 * Full Next.js Metadata: canonical, Open Graph, Twitter, robots.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const path = canonicalPath(input.path);
  const ogImage = input.ogImagePath
    ? ogAssetPath(input.ogImagePath)
    : undefined;

  const titleField: Metadata["title"] = input.absoluteTitle
    ? { absolute: input.title }
    : input.title;

  const metadata: Metadata = {
    title: titleField,
    description: input.description,
    alternates: {
      canonical: path,
    },
    robots: input.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: defaultSEO.locale,
      url: path,
      siteName: defaultSEO.siteName,
      title: input.title,
      description: input.description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: input.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(defaultSEO.twitterSite
        ? { site: `@${defaultSEO.twitterSite.replace(/^@/, "")}` }
        : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  if (input.keywords?.length) {
    metadata.keywords = input.keywords;
  }

  return metadata;
}

/** Metadata for a tool route under `/tools/[slug]`. */
export function buildToolPageMetadata(
  slug: string,
  seo: { title: string; description: string },
  options?: { keywords?: string[] },
): Metadata {
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/tools/${slug}`,
    absoluteTitle: true,
    keywords: options?.keywords,
  });
}
