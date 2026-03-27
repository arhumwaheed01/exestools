import type { ToolKind } from "@/lib/content/toolCatalog";
import { defaultSEO } from "./seoConfig";

const SITE = defaultSEO.siteName;

/** Keep meta descriptions in Google’s recommended range (≈140–160 chars). */
export function clampMetaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 110 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function ensureMetaLength(text: string, min = 140, max = 158): string {
  let s = clampMetaDescription(text, max);
  const suffix = ` Fast, free ${SITE} tool. No signup.`;
  if (s.length < min) {
    s = clampMetaDescription(s + suffix, max);
  }
  if (s.length < min) {
    s = clampMetaDescription(s + " Browser-based, instant results.", max);
  }
  return s;
}

export function textKindToUseCase(kind: ToolKind): string {
  switch (kind) {
    case "stats":
      return "Text Analysis";
    case "transform":
      return "Text Conversion";
    case "find-replace":
      return "Find & Replace";
    case "compare":
      return "Text Comparison";
    case "speech-tts":
      return "Text-to-Speech";
    case "speech-stt":
      return "Speech-to-Text";
    default:
      return "Text";
  }
}

function developerSlugToUseCase(slug: string): string {
  if (slug.includes("json") || slug.includes("csv")) return "JSON & Data";
  if (slug.includes("base64")) return "Encoding";
  if (slug.includes("url-encoder") || slug.includes("url-decoder")) return "URL Encoding";
  if (slug.includes("html-entities")) return "Encoding";
  if (slug.includes("md5") || slug.includes("sha") || slug.includes("hash")) return "Hashing";
  if (slug.includes("password")) return "Security";
  if (
    slug.includes("html-formatter") ||
    slug.includes("css-formatter") ||
    slug.includes("js-formatter") ||
    slug.includes("sql-formatter") ||
    slug.includes("xml-formatter")
  ) {
    return "Code Formatting";
  }
  if (slug.includes("minifier")) return "Code Minification";
  if (slug.includes("jwt")) return "JWT";
  if (slug.includes("header") || slug.includes("user-agent") || slug.includes("ip-lookup")) {
    return "Network Debugging";
  }
  if (slug.includes("timestamp")) return "Date & Time";
  if (slug.includes("uuid") || slug.includes("cron")) return "Developer Utilities";
  return "Developer";
}

function imageSlugToUseCase(slug: string): string {
  if (slug.includes("compress")) return "Image Compression";
  if (slug.includes("-to-") || slug.startsWith("jpg-") || slug.startsWith("png-") || slug.startsWith("webp-")) {
    return "Image Conversion";
  }
  if (slug.includes("resizer")) return "Image Resizing";
  if (slug.includes("cropper")) return "Image Cropping";
  if (slug.includes("rotator") || slug.includes("flipper")) return "Image Editing";
  if (slug.includes("base64")) return "Image Encoding";
  if (slug.includes("metadata")) return "Image Metadata";
  return "Image Editing";
}

/** Title pattern: [Tool Name] - Free Online [Use Case] Tool | ExesTools */
export function buildTextToolMetaTitle(toolName: string, kind: ToolKind): string {
  const useCase = textKindToUseCase(kind);
  return `${toolName} - Free Online ${useCase} Tool | ${SITE}`;
}

export function buildDeveloperToolMetaTitle(toolName: string, slug: string): string {
  const useCase = developerSlugToUseCase(slug);
  return `${toolName} - Free Online ${useCase} Tool | ${SITE}`;
}

export function buildImageToolMetaTitle(toolName: string, slug: string): string {
  const useCase = imageSlugToUseCase(slug);
  return `${toolName} - Free Online ${useCase} Tool | ${SITE}`;
}

export function buildTextToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  const base = `Use our free online ${n} tool: ${shortDescription} Fast, accurate, and easy to use in your browser. No signup.`;
  return ensureMetaLength(base);
}

export function buildDeveloperToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  const base = `Free ${n} for developers: ${shortDescription} Runs in your browser. No install, no account.`;
  return ensureMetaLength(base);
}

export function buildImageToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  const base = `Free online ${n}: ${shortDescription} Client-side image processing with preview and download. No upload to our servers.`;
  return ensureMetaLength(base);
}

/** H1-style line: tool name + primary benefit (first sentence of description). */
export function buildToolPageHeading(
  toolName: string,
  shortDescription: string,
  useCaseFallback: string,
): string {
  const first =
    shortDescription.split(/(?<=[.!?])\s+/)[0]?.trim() ?? shortDescription.trim();
  const benefit = first.length > 120 ? `${first.slice(0, 117)}…` : first;
  return `${toolName}: ${benefit || `Free online ${useCaseFallback} tool`}`;
}

export function buildTextToolPageHeading(
  toolName: string,
  description: string,
  kind: ToolKind,
): string {
  return buildToolPageHeading(toolName, description, textKindToUseCase(kind));
}

export function buildDeveloperToolPageHeading(
  toolName: string,
  description: string,
  slug: string,
): string {
  return buildToolPageHeading(toolName, description, developerSlugToUseCase(slug));
}

export function buildImageToolPageHeading(
  toolName: string,
  description: string,
  slug: string,
): string {
  return buildToolPageHeading(toolName, description, imageSlugToUseCase(slug));
}
