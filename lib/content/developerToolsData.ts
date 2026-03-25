/**
 * Developer tools category: grid order, specs for pages not in text toolCatalog, helpers.
 * Scales by appending entries — URLs stay /tools/[slug].
 */

import { toolCatalog } from "./toolCatalog";
import type { DevSpecialVariant } from "./textToolPageTypes";

const catalogBySlug = new Map(toolCatalog.map((t) => [t.slug, t]));

/** Top-level grid order (30 tools); four slugs reuse text catalog pages. */
export const DEVELOPER_CATEGORY_SLUGS = [
  "json-formatter",
  "json-validator",
  "json-viewer",
  "json-to-csv",
  "csv-to-json",
  "base64-encoder",
  "base64-decoder",
  "url-encoder",
  "url-decoder",
  "encode-html-entities",
  "decode-html-entities",
  "md5-generator",
  "sha1-generator",
  "sha256-generator",
  "password-generator",
  "html-formatter",
  "css-formatter",
  "js-formatter",
  "sql-formatter",
  "xml-formatter",
  "html-minifier",
  "css-minifier",
  "js-minifier",
  "jwt-decoder",
  "http-header-checker",
  "ip-lookup",
  "user-agent-parser",
  "unix-timestamp-converter",
  "uuid-generator",
  "cron-job-generator",
] as const;

export type DeveloperToolPageKind = "transform" | "dev-hash" | "dev-special";

export type DeveloperToolSpec = {
  name: string;
  slug: string;
  description: string;
  relatedTools: string[];
  pageKind: DeveloperToolPageKind;
  algorithm?: "md5" | "sha1" | "sha256";
  variant?: DevSpecialVariant;
};

const devSpecs: DeveloperToolSpec[] = [
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    description:
      "Beautify and indent JSON with stable sorting so payloads are readable in reviews, tickets, and docs.",
    relatedTools: ["json-validator", "json-viewer", "json-to-csv"],
    pageKind: "transform",
  },
  {
    name: "JSON Validator",
    slug: "json-validator",
    description:
      "Check whether text is valid JSON and surface parse errors before you commit configs or API fixtures.",
    relatedTools: ["json-formatter", "yaml-to-json", "json-to-yaml"],
    pageKind: "transform",
  },
  {
    name: "JSON Viewer",
    slug: "json-viewer",
    description:
      "Format JSON for quick inspection—useful when logs or responses arrive as a single long line.",
    relatedTools: ["json-formatter", "json-validator", "csv-to-json"],
    pageKind: "transform",
  },
  {
    name: "Base64 Encoder",
    slug: "base64-encoder",
    description:
      "Encode text to Base64 for tokens, data URLs, and quick transport-safe strings in the browser.",
    relatedTools: ["base64-decoder", "url-encoder", "text-to-binary"],
    pageKind: "transform",
  },
  {
    name: "Base64 Decoder",
    slug: "base64-decoder",
    description:
      "Decode Base64 back to UTF-8 text to inspect payloads, JWT pieces, or debug encoding issues.",
    relatedTools: ["base64-encoder", "jwt-decoder", "binary-to-text"],
    pageKind: "transform",
  },
  {
    name: "URL Encoder",
    slug: "url-encoder",
    description:
      "Percent-encode query values and paths for safe use in HTTP URLs and form data.",
    relatedTools: ["url-decoder", "text-to-url-slug", "base64-encoder"],
    pageKind: "transform",
  },
  {
    name: "URL Decoder",
    slug: "url-decoder",
    description:
      "Convert percent-encoded strings back to readable text for debugging links and redirects.",
    relatedTools: ["url-encoder", "encode-html-entities", "decode-html-entities"],
    pageKind: "transform",
  },
  {
    name: "MD5 Generator",
    slug: "md5-generator",
    description:
      "Compute MD5 hashes of arbitrary text for checksums, legacy integrations, and quick comparisons.",
    relatedTools: ["sha1-generator", "sha256-generator", "base64-encoder"],
    pageKind: "dev-hash",
    algorithm: "md5",
  },
  {
    name: "SHA1 Generator",
    slug: "sha1-generator",
    description:
      "Generate SHA-1 digests in the browser using Web Crypto—handy for Git-adjacent workflows and audits.",
    relatedTools: ["sha256-generator", "md5-generator", "text-to-hex"],
    pageKind: "dev-hash",
    algorithm: "sha1",
  },
  {
    name: "SHA256 Generator",
    slug: "sha256-generator",
    description:
      "Create SHA-256 hashes for integrity checks, configs, and security-minded comparisons.",
    relatedTools: ["sha1-generator", "md5-generator", "hex-to-text"],
    pageKind: "dev-hash",
    algorithm: "sha256",
  },
  {
    name: "Password Generator",
    slug: "password-generator",
    description:
      "Generate strong random passwords with adjustable length and character sets—client-side only.",
    relatedTools: ["uuid-generator", "sha256-generator", "base64-encoder"],
    pageKind: "dev-special",
    variant: "password",
  },
  {
    name: "HTML Formatter",
    slug: "html-formatter",
    description:
      "Insert line breaks between tags to make markup easier to scan during reviews and refactors.",
    relatedTools: ["html-minifier", "encode-html-entities", "remove-html-tags"],
    pageKind: "transform",
  },
  {
    name: "CSS Formatter",
    slug: "css-formatter",
    description:
      "Expand CSS blocks with simple line breaks so stylesheets are easier to read before minifying.",
    relatedTools: ["css-minifier", "js-formatter", "html-formatter"],
    pageKind: "transform",
  },
  {
    name: "JS Formatter",
    slug: "js-formatter",
    description:
      "Pretty-print JSON when valid; otherwise apply light brace-style formatting for snippets.",
    relatedTools: ["js-minifier", "json-formatter", "json-validator"],
    pageKind: "transform",
  },
  {
    name: "SQL Formatter",
    slug: "sql-formatter",
    description:
      "Normalize spacing and line breaks around common SQL clauses for readable ad-hoc queries.",
    relatedTools: ["xml-formatter", "js-formatter", "remove-comments"],
    pageKind: "transform",
  },
  {
    name: "XML Formatter",
    slug: "xml-formatter",
    description:
      "Pretty-print XML when the document parses; otherwise fall back to tag-aware spacing.",
    relatedTools: ["html-formatter", "json-to-yaml", "yaml-to-json"],
    pageKind: "transform",
  },
  {
    name: "HTML Minifier",
    slug: "html-minifier",
    description:
      "Remove comments and collapse whitespace between tags for lighter static snippets.",
    relatedTools: ["html-formatter", "css-minifier", "js-minifier"],
    pageKind: "transform",
  },
  {
    name: "CSS Minifier",
    slug: "css-minifier",
    description:
      "Strip comments and redundant whitespace from CSS for smaller paste-ready bundles.",
    relatedTools: ["css-formatter", "js-minifier", "html-minifier"],
    pageKind: "transform",
  },
  {
    name: "JS Minifier",
    slug: "js-minifier",
    description:
      "Lightweight minification: remove block comments, line comments, and compress whitespace.",
    relatedTools: ["js-formatter", "json-validator", "remove-comments"],
    pageKind: "transform",
  },
  {
    name: "JWT Decoder",
    slug: "jwt-decoder",
    description:
      "Decode JWT header and payload (Base64URL) for debugging—never replaces signature verification.",
    relatedTools: ["base64-decoder", "unix-timestamp-converter", "json-formatter"],
    pageKind: "dev-special",
    variant: "jwt",
  },
  {
    name: "HTTP Header Checker",
    slug: "http-header-checker",
    description:
      "Parse raw request or response headers into a clean key/value view for support and API work.",
    relatedTools: ["url-decoder", "user-agent-parser", "jwt-decoder"],
    pageKind: "dev-special",
    variant: "headers",
  },
  {
    name: "IP Lookup",
    slug: "ip-lookup",
    description:
      "Validate IPv4 addresses and normalize dotted-quad input for configs and allow lists.",
    relatedTools: ["http-header-checker", "user-agent-parser", "url-encoder"],
    pageKind: "dev-special",
    variant: "ip",
  },
  {
    name: "User-Agent Parser",
    slug: "user-agent-parser",
    description:
      "Extract browser, engine, and OS hints from a User-Agent string with heuristic parsing.",
    relatedTools: ["http-header-checker", "ip-lookup", "url-decoder"],
    pageKind: "dev-special",
    variant: "ua",
  },
  {
    name: "Unix Timestamp Converter",
    slug: "unix-timestamp-converter",
    description:
      "Convert Unix seconds or milliseconds to ISO strings and back—ideal for logs and JWT exp fields.",
    relatedTools: ["jwt-decoder", "json-formatter", "uuid-generator"],
    pageKind: "dev-special",
    variant: "timestamp",
  },
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    description:
      "Generate RFC 4122 v4 UUIDs instantly using cryptographically strong randomness when available.",
    relatedTools: ["password-generator", "cron-job-generator", "json-formatter"],
    pageKind: "dev-special",
    variant: "uuid",
  },
  {
    name: "Cron Job Generator",
    slug: "cron-job-generator",
    description:
      "Build five-field cron expressions from simple controls and copy a schedule for crontab or docs.",
    relatedTools: ["unix-timestamp-converter", "uuid-generator", "json-formatter"],
    pageKind: "dev-special",
    variant: "cron",
  },
];

export const developerToolSpecsBySlug: Record<string, DeveloperToolSpec> =
  Object.fromEntries(devSpecs.map((s) => [s.slug, s]));

export function getDeveloperToolsGridItems(): {
  slug: string;
  name: string;
  description: string;
}[] {
  return DEVELOPER_CATEGORY_SLUGS.map((slug) => {
    const fromCatalog = catalogBySlug.get(slug);
    if (fromCatalog) {
      return {
        slug,
        name: fromCatalog.name,
        description: fromCatalog.description,
      };
    }
    const spec = developerToolSpecsBySlug[slug];
    if (!spec) {
      throw new Error(`Developer grid missing spec for slug: ${slug}`);
    }
    return { slug, name: spec.name, description: spec.description };
  });
}

type ToolRow = {
  name: string;
  slug: string;
  description: string;
  howToUse: string[];
  faq: { question: string; answer: string }[];
  relatedTools: string[];
};

const defaultHowTo = [
  "Open the workspace and paste or type the input your task needs.",
  "Watch the output update live as you adjust the text or options.",
  "Copy the result into your editor, terminal, or ticket, then clear to start over.",
];

export function buildDeveloperTextTools(): ToolRow[] {
  return devSpecs.map((s) => ({
    name: s.name,
    slug: s.slug,
    description: s.description,
    howToUse: defaultHowTo,
    faq: [],
    relatedTools: s.relatedTools,
  }));
}
