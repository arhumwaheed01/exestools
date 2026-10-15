import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  extractMarkdownFaqs,
  isPublishedOnOrBefore,
  preprocessGuideBody,
  todayUtcDateString,
  type MarkdownFaq,
} from "@/lib/guideBody";

const GUIDES_DIR = path.join(process.cwd(), "content/guides");

export type GuideFrontmatter = {
  slug?: string;
  meta_title: string;
  meta_description: string;
  published: string;
  updated: string;
  related_tools?: string[];
  author?: string;
  author_url?: string;
  /** When true, the guide stays unpublished even if published <= today. */
  draft?: boolean;
};

export type Guide = {
  slug: string;
  frontmatter: GuideFrontmatter;
  title: string;
  body: string;
  /** Body with H1, byline, and screenshot lines removed. */
  content: string;
  faqs: MarkdownFaq[];
};

function normalizeDateField(val: unknown): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val ?? "");
}

function normalizeSlug(slugOrPath: string, filename: string): string {
  const base = filename.replace(/\.mdx?$/, "");
  if (!slugOrPath) return base;
  const trimmed = slugOrPath.replace(/^\/guides\//, "").replace(/^\//, "");
  return trimmed || base;
}

function titleFromMarkdown(rawBody: string, metaTitle: string): string {
  const h1 = rawBody.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return metaTitle.split("|")[0].trim();
}

function readGuideFile(filename: string): Guide {
  const filePath = path.join(GUIDES_DIR, filename);
  const file = fs.readFileSync(filePath, "utf8");
  const { data, content: rawBody } = matter(file);
  const raw = data as GuideFrontmatter;
  const fm: GuideFrontmatter = {
    ...raw,
    published: normalizeDateField(raw.published),
    updated: normalizeDateField(raw.updated),
  };
  const slug = normalizeSlug(fm.slug ?? "", filename);
  const body = rawBody.trim();
  const content = preprocessGuideBody(body);

  return {
    slug,
    frontmatter: fm,
    title: titleFromMarkdown(body, fm.meta_title),
    body,
    content,
    faqs: extractMarkdownFaqs(body),
  };
}

function listGuideFilenames(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

export function getAllGuides(): Guide[] {
  return listGuideFilenames()
    .map(readGuideFile)
    .sort((a, b) => b.frontmatter.published.localeCompare(a.frontmatter.published));
}

export function getPublishedGuides(asOf: string = todayUtcDateString()): Guide[] {
  return getAllGuides().filter(
    (g) => !g.frontmatter.draft && isPublishedOnOrBefore(g.frontmatter.published, asOf),
  );
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return getAllGuides().find((g) => g.slug === slug);
}

export function getGuideSlugs(): string[] {
  return listGuideFilenames().map((filename) => {
    const filePath = path.join(GUIDES_DIR, filename);
    const file = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(file);
    const fm = data as GuideFrontmatter;
    return normalizeSlug(fm.slug ?? "", filename);
  });
}

export function isGuidePublished(slug: string, asOf: string = todayUtcDateString()): boolean {
  const guide = getGuideBySlug(slug);
  if (!guide || guide.frontmatter.draft) return false;
  return isPublishedOnOrBefore(guide.frontmatter.published, asOf);
}
