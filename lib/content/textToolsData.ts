/**
 * Single source of truth for text tools; scale to 100+ entries for programmatic SEO.
 * `allTools` adds developer utilities without changing the text-tools-only listing.
 */

import { buildDeveloperTextTools } from "./developerToolsData";
import { buildImageTextTools } from "./imageToolsData";
import { buildPdfTextTools } from "./pdfToolsData";
import { toolCatalog } from "./toolCatalog";

export type TextToolFaq = { question: string; answer: string };

export type TextTool = {
  name: string;
  slug: string;
  /** Short hero / card blurb (long-form SEO lives in full page modules). */
  description: string;
  howToUse: string[];
  faq: TextToolFaq[];
  relatedTools: string[];
};

export const textTools: TextTool[] = toolCatalog.map((t) => ({
  name: t.name,
  slug: t.slug,
  description: t.description,
  howToUse: [
    "Paste or type your text into the input area.",
    "View live output and make edits in real time.",
    "Copy results or clear the workspace for a new task.",
  ],
  faq: [],
  relatedTools: t.relatedTools,
}));

/** Developer-only tool rows merged for /tools/[slug], SEO, and related links. */
export const developerTools: TextTool[] = buildDeveloperTextTools();
export const imageTools: TextTool[] = buildImageTextTools();
export const pdfTools: TextTool[] = buildPdfTextTools();

/** Full catalog for shared dynamic routes (text + developer + image + PDF). */
export const allTools: TextTool[] = [...textTools, ...developerTools, ...imageTools, ...pdfTools];

export function getToolBySlug(slug: string) {
  return allTools.find((t) => t.slug === slug);
}

/** Text-tool index only; keeps /text-tools unchanged. */
export function getTextToolBySlug(slug: string) {
  return textTools.find((t) => t.slug === slug);
}

export function toolPath(slug: string) {
  return `/tools/${slug}`;
}

/** Page-level copy for /text-tools */
export const textToolsPageContent = {
  title: "Free Text Tools Online",
  intro:
    "Pick a tool to open its dedicated page. Each utility shares the same clean layout so you can work quickly and link internally for SEO.",
  openToolLabel: "Open tool →",
  seoSection: {
    heading: "Free text tools online: what they do and when to use them",
    paragraphs: [
      "Text tools are small utilities that help you measure, transform, or clean written content without opening a heavy word processor. They are ideal when you need a fast answer: how many words are in this draft, how many characters fit this field, or how can I make this block uppercase without retyping it? Because they run in the browser, you can use them on any device with a modern web connection.",
      "Writers, students, and marketers reach for text tools to meet limits and reduce errors. Social posts, product descriptions, and application forms often impose strict counts; a reliable word or character counter keeps you inside those boundaries. Case converters and line deduplicators help you normalize messy lists from spreadsheets or logs. When the task is narrow, a focused tool beats a full document editor.",
      "Browser-based utilities also support privacy-minded workflows. When processing stays on your device and you avoid unnecessary uploads, you can work with drafts and notes more confidently. ExesTools text pages are built to load quickly, present a clear workspace, and link to related utilities so you can move from counting to formatting without hunting for new tabs.",
      "Educators and support teams also benefit from transparent tools. When a student can verify a word count before submitting a paper, or a specialist can normalize a ticket description without opening a heavyweight editor, everyone saves time. The same applies to cross-functional workflows: marketing can hand a list to engineering after a duplicate-line cleanup, and operations can reverse a snippet to double-check a log line. Lightweight utilities make those handoffs smoother because they are easy to explain and easy to repeat.",
    ],
    closing: {
      segments: [
        { kind: "text" as const, value: "Start with essentials like the " },
        {
          kind: "link" as const,
          value: "Word Counter",
          href: "/tools/word-counter",
        },
        { kind: "text" as const, value: " and " },
        {
          kind: "link" as const,
          value: "Character Counter",
          href: "/tools/character-counter",
        },
        {
          kind: "text" as const,
          value:
            ", then explore case converters and cleanup tools in the grid. Each tool uses a clean URL you can bookmark or share.",
        },
      ],
    },
  },
} as const;

/** Placeholder body for dynamic tool pages until UI ships */
export const toolPagePlaceholder = {
  paragraphs: [
    "This page is wired for a full in-browser experience. The URL is permanent and suitable for sitemaps, internal links, and future programmatic SEO for long-tail queries related to {toolName}.",
    "Paste or type your content in the workspace when the interactive editor ships; until then, bookmark this page and explore related utilities from the links below the panel.",
  ],
} as const;

export function fillToolPlaceholder(template: string, toolName: string) {
  return template.replace(/\{toolName\}/g, toolName);
}

export {
  wordCounterPageContent,
  type WordCounterPageContent,
} from "./wordCounterPage";

/** Shared chrome for all /tools/[slug] layouts */
export const toolPageUi = {
  breadcrumb: {
    home: "Home",
    allTools: "All Tools",
  },
  footerLinks: [
    { label: "← Back to Text Tools", href: "/text-tools" },
    { label: "Developer tools", href: "/developer-tools" },
    { label: "Image tools", href: "/image-tools" },
    { label: "PDF tools", href: "/pdf-tools" },
    { label: "Browse all tools", href: "/tools" },
  ],
} as const;
