import { defaultSEO } from "./seoConfig";

/** Programmatic title pattern for text / shared catalog tools */
export function buildTextToolMetaTitle(toolName: string): string {
  return `${toolName} Tool - Free Online ${toolName} | ${defaultSEO.siteName}`;
}

export function buildDeveloperToolMetaTitle(toolName: string): string {
  return `${toolName} - Free Online Developer Tool | ${defaultSEO.siteName}`;
}

export function buildImageToolMetaTitle(toolName: string): string {
  return `${toolName} - Free Online Image Tool | ${defaultSEO.siteName}`;
}

export function buildTextToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  return `${shortDescription} Use our free online ${n} tool: fast, browser-based text utility with no signup—ideal for writing, SEO, and editing workflows.`;
}

export function buildDeveloperToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  return `${shortDescription} Free ${n} for developers—runs in your browser with no account. JSON, encoding, formatting, and debugging workflows.`;
}

export function buildImageToolMetaDescription(
  toolName: string,
  shortDescription: string,
): string {
  const n = toolName.toLowerCase();
  return `${shortDescription} Free online ${n} with client-side processing, preview, and download—compress, convert, and optimize images in your browser.`;
}
