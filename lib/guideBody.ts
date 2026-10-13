/** Preprocess guide/tool markdown bodies before react-markdown. */

const BYLINE_RE = /^By Arhum Waheed ·[^\n]*\n+/m;
const SCREENSHOT_LINE_RE = /^\[SCREENSHOT:[^\]]*\]\s*\n?/gm;
const LEADING_H1_RE = /^#\s+.+\n+/;

export function preprocessGuideBody(raw: string): string {
  return raw
    .replace(BYLINE_RE, "")
    .replace(SCREENSHOT_LINE_RE, "")
    .replace(LEADING_H1_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Strip FAQ section from body when FAQs are rendered separately (tool rewrites). */
export function stripMarkdownFaqSection(body: string): string {
  const idx = body.search(/^## Frequently asked questions\s*$/m);
  if (idx === -1) return body;
  return body.slice(0, idx).trim();
}

export type MarkdownFaq = { q: string; a: string };

/** Parse ### questions under ## Frequently asked questions. */
export function extractMarkdownFaqs(body: string): MarkdownFaq[] {
  const faqMatch = body.match(/^## Frequently asked questions\s*\n([\s\S]*)$/m);
  if (!faqMatch) return [];

  const section = faqMatch[1];
  const parts = section.split(/^### /m).filter(Boolean);
  const faqs: MarkdownFaq[] = [];

  for (const part of parts) {
    const nl = part.indexOf("\n");
    if (nl === -1) continue;
    const q = part.slice(0, nl).trim();
    const a = part
      .slice(nl + 1)
      .trim()
      .replace(/\n+/g, " ");
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

export function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isPublishedOnOrBefore(published: string, asOf: string): boolean {
  return published <= asOf;
}
