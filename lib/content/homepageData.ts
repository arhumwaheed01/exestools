import { getDeveloperToolsGridItems } from "@/lib/content/developerToolsData";
import { getImageToolsGridItems } from "@/lib/content/imageToolsData";
import { getToolBySlug, textTools } from "@/lib/content/textToolsData";

/** Homepage “Popular tools” — curated; expand without listing the full catalog. */
const POPULAR_TOOL_SLUGS = [
  "word-counter",
  "character-counter",
  "uppercase-converter",
  "lowercase-converter",
  "find-replace",
  "remove-extra-spaces",
  "text-diff-checker",
  "json-formatter",
  "base64-encoder",
  "md5-generator",
] as const;

export type HomeCategory = {
  title: string;
  description: string;
  link: string;
  badge?: string;
};

export type HomeQuickLink = {
  label: string;
  href: string;
  icon: "type" | "hash";
};

export type HeroContent = {
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
  quickLinks: HomeQuickLink[];
};

export type SeoRichSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string; href: string };

export type SeoBlock =
  | { type: "paragraph"; text: string }
  | { type: "rich"; segments: SeoRichSegment[] };

export const homepageData = {
  hero: {
    badge: "Free Tools · Fast Tools · Browser-based Tools",
    title: "Free Online Tools for Everyday Tasks",
    subtitle:
      "Simple, fast, and powerful tools for text, images, and developers.",
    cta: "Explore Tools",
    ctaHref: "/tools",
    quickLinks: [
      { label: "Text tools", href: "/text-tools", icon: "type" },
      { label: "Word counter", href: "/tools/word-counter", icon: "hash" },
      {
        label: "Uppercase converter",
        href: "/tools/uppercase-converter",
        icon: "type",
      },
    ],
  } satisfies HeroContent,

  categoriesSection: {
    title: "Featured categories",
    subtitle:
      "Pick a category to browse tools—live utilities today, more on the roadmap.",
    ctaLabel: "View category",
    categories: [
      {
        title: "Text Tools",
        description:
          "Count words, change case, reverse text, and clean duplicates—right in your browser.",
        link: "/text-tools",
      },
      {
        title: "Developer Tools",
        description:
          "JSON helpers, encoders, hash generators, formatters, JWT decode, and more—client-side and fast.",
        link: "/developer-tools",
      },
      {
        title: "Image Tools",
        description:
          "Resize, compress, and convert images without installing software.",
        link: "/image-tools",
        badge: "Live",
      },
    ] satisfies HomeCategory[],
  },

  popularSection: {
    title: "Popular tools",
    subtitle:
      "Jump into high-intent utilities—each opens on a dedicated, SEO-friendly URL under /tools/.",
  },

  popularToolSlugs: POPULAR_TOOL_SLUGS,

  popularTools: POPULAR_TOOL_SLUGS.flatMap((slug) => {
    const t = getToolBySlug(slug);
    return t ? [{ name: t.name, slug: t.slug }] : [];
  }),

  seoArticle: {
    heading: "Why use free online tools in your browser?",
    blocks: [
      {
        type: "paragraph",
        text: "Online tools are small web applications that help you complete everyday tasks without installing software. Instead of downloading another program or signing up for a heavy suite, you open a page, paste your content, and get a result in seconds. That simplicity is why millions of people rely on browser-based utilities for quick fixes at work, school, and home.",
      },
      {
        type: "paragraph",
        text: "Text tools are especially popular because writing is universal. Whether you are drafting an email, preparing a report, or posting on social media, you often need to measure length, adjust formatting, or clean up messy copy. A word counter helps you stay within limits; a character counter is essential when a form caps input; converters for case or spacing save time when you need consistency across sections. These utilities do one job well, so you can stay focused on your message instead of fighting your editor.",
      },
      {
        type: "paragraph",
        text: "Free browser-based tools also remove friction from collaboration. Teams can share a link instead of a license key, and students can use the same workflow on a library computer or a personal laptop. When the tool runs locally in the browser and avoids unnecessary uploads, you reduce exposure of sensitive drafts and keep your workflow fast. Many users choose lightweight utilities precisely because they feel more private and more immediate than bloated alternatives.",
      },
      {
        type: "paragraph",
        text: "Speed matters when you are in the middle of a deadline. Opening a dedicated app, waiting for updates, or navigating complex menus can break your concentration. A focused online tool loads quickly, shows a clear interface, and returns results you can copy right back into your document. That responsiveness is not just convenient—it helps you maintain momentum during editing sessions and reduces context switching between apps.",
      },
      {
        type: "paragraph",
        text: "Security-conscious users appreciate tools that minimize data transfer. When processing happens on your device and nothing leaves your browser, you can work with client names, product copy, or personal notes with greater peace of mind. ExesTools is built around that idea: practical utilities that respect your time and your content, with straightforward pages you can bookmark and return to whenever you need them.",
      },
      {
        type: "paragraph",
        text: "Accessibility is another reason browser tools remain popular. You do not need admin rights to install software on a shared computer, and you can often use keyboard shortcuts and screen readers with familiar web patterns. A well-structured tool page—clear headings, readable type, and predictable controls—helps people work faster regardless of device or assistive technology. That inclusivity matters for schools, libraries, and remote teams where environments vary widely.",
      },
      {
        type: "paragraph",
        text: "From an editorial perspective, repeatable workflows matter. When you can copy results back into your CMS, slide deck, or code editor without reformatting, you reduce mistakes and keep tone consistent. Small utilities complement larger suites: they fill gaps, automate micro-tasks, and keep you moving when a full application would be overkill. That balance between power and restraint is what makes online tools a staple for everyday digital work.",
      },
      {
        type: "rich",
        segments: [
          { kind: "text", value: "As you explore the site, try our " },
          {
            kind: "link",
            value: "Word Counter",
            href: "/tools/word-counter",
          },
          {
            kind: "text",
            value: " for quick totals on articles and essays, and the ",
          },
          {
            kind: "link",
            value: "Uppercase Converter",
            href: "/tools/uppercase-converter",
          },
          {
            kind: "text",
            value:
              " when you need uniform capitalization for headings or titles. These pages are designed for repeat visits—fast loads, clear typography, and internal links that help you jump between related utilities as your needs grow.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "In short, online tools succeed because they are simple, accessible, and respectful of your workflow. They turn repetitive chores into single-click actions, keep your work inside the browser when possible, and stay free of unnecessary clutter. ExesTools will continue to expand with the same principles: helpful utilities, honest descriptions, and a clean experience from the first visit to the hundredth.",
      },
    ] satisfies SeoBlock[],
  },
} as const;

/** Header + footer navigation — keep labels out of components */
export const navigationData = {
  footerSectionTitle: "Explore",
  header: [
    { href: "/", label: "Home", icon: "home" as const },
    { href: "/text-tools", label: "Text Tools", icon: "type" as const },
    {
      href: "/developer-tools",
      label: "Developer Tools",
      icon: "code" as const,
    },
    { href: "/image-tools", label: "Image Tools", icon: "image" as const },
  ],
  cta: { href: "/tools", label: "All Tools" },
  footer: [
    { href: "/text-tools", label: "Text Tools", icon: "type" as const },
    { href: "/developer-tools", label: "Developer Tools", icon: "code" as const },
    { href: "/tools", label: "All Tools", icon: "wrench" as const },
  ],
} as const;

export const allToolsPageContent = {
  title: "All Tools",
  intro:
    "Browse the full catalog. Use the links below to jump into a specific tool page with a stable URL for sharing and search.",
  textToolsHeading: "Text tools",
  developerToolsHeading: "Developer tools",
  imageToolsHeading: "Image tools",
  moreCategories: {
    title: "More categories",
    description:
      "All major categories are live, and more specialized tools are added continuously.",
    links: [
      {
        label: "Developer Tools",
        href: "/developer-tools",
        icon: "code" as const,
      },
      { label: "Image Tools", href: "/image-tools", icon: "image" as const },
    ],
  },
} as const;

/** Curated grid rows for /developer-tools and directory cards */
export const developerToolsGrid = getDeveloperToolsGridItems();
export const imageToolsGrid = getImageToolsGridItems();

export const developerToolsPageContent = {
  title: "Free Developer Tools Online",
  intro:
    "Encode, decode, format, and inspect data without leaving your browser. Each tool has a permanent URL for bookmarks, docs, and internal runbooks.",
} as const;

export const imageToolsPageContent = {
  title: "Free Image Tools Online",
  intro:
    "Compress, convert, resize, rotate, crop, and inspect images directly in your browser. Every tool has a stable URL for repeat workflows and internal linking.",
} as const;

export const notFoundPageContent = {
  title: "Page not found",
  description:
    "The page you are looking for does not exist or has moved.",
  actions: [
    { label: "Home", href: "/" },
    { label: "All Tools", href: "/tools" },
  ],
} as const;
