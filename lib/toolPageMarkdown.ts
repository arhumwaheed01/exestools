import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  extractMarkdownFaqs,
  preprocessGuideBody,
  stripMarkdownFaqSection,
} from "@/lib/guideBody";

const TOOL_PAGES_DIR = path.join(process.cwd(), "public/content/tool-pages");

export function loadToolPageMarkdown(filename: string): {
  content: string;
  faqs: ReturnType<typeof extractMarkdownFaqs>;
} {
  const raw = fs.readFileSync(path.join(TOOL_PAGES_DIR, filename), "utf8");
  const { content: body } = matter(raw);
  const preprocessed = preprocessGuideBody(body);
  const faqs = extractMarkdownFaqs(preprocessed);
  const content = stripMarkdownFaqSection(preprocessed);
  return { content, faqs };
}
