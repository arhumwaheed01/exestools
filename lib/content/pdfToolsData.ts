import type { PdfToolVariant } from "./textToolPageTypes";

export const PDF_CATEGORY_SLUGS = [
  "pdf-to-word",
  "word-to-pdf",
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-editor-free",
] as const;

export type PdfToolSpec = {
  name: string;
  slug: string;
  description: string;
  relatedTools: string[];
  variant: PdfToolVariant;
};

const pdfSpecs: PdfToolSpec[] = [
  {
    name: "PDF to Word",
    slug: "pdf-to-word",
    description:
      "Extract text from PDF into an editable .docx. Best for text-heavy documents; layout may simplify.",
    relatedTools: ["word-to-pdf", "compress-pdf", "merge-pdf"],
    variant: "pdf-to-word",
  },
  {
    name: "Word to PDF",
    slug: "word-to-pdf",
    description: "Convert .docx to PDF with clean text flow (simplified formatting).",
    relatedTools: ["pdf-to-word", "compress-pdf", "merge-pdf"],
    variant: "word-to-pdf",
  },
  {
    name: "Merge PDF",
    slug: "merge-pdf",
    description: "Combine multiple PDFs in upload order into one file.",
    relatedTools: ["split-pdf", "compress-pdf", "pdf-to-word"],
    variant: "merge-pdf",
  },
  {
    name: "Split PDF",
    slug: "split-pdf",
    description: "Export every page as its own PDF (ZIP) or extract a page range to one PDF.",
    relatedTools: ["merge-pdf", "compress-pdf", "pdf-editor-free"],
    variant: "split-pdf",
  },
  {
    name: "Compress PDF",
    slug: "compress-pdf",
    description: "Rebuild PDF to reduce size when possible. Results vary by source.",
    relatedTools: ["merge-pdf", "split-pdf", "pdf-to-word"],
    variant: "compress-pdf",
  },
  {
    name: "PDF Editor Free",
    slug: "pdf-editor-free",
    description:
      "Visual editor: preview pages, add text, watermark, rotate, delete and reorder pages, then download.",
    relatedTools: ["compress-pdf", "merge-pdf", "split-pdf"],
    variant: "pdf-editor-free",
  },
];

export const pdfToolSpecsBySlug: Record<string, PdfToolSpec> = Object.fromEntries(
  pdfSpecs.map((s) => [s.slug, s]),
);

export function getPdfToolsGridItems(): { slug: string; name: string; description: string }[] {
  return PDF_CATEGORY_SLUGS.map((slug) => {
    const spec = pdfToolSpecsBySlug[slug];
    if (!spec) throw new Error(`Missing PDF spec: ${slug}`);
    return { slug, name: spec.name, description: spec.description };
  });
}

export function buildPdfTextTools() {
  return pdfSpecs.map((s) => ({
    name: s.name,
    slug: s.slug,
    description: s.description,
    howToUse: [
      "Upload your file(s) or drag them into the tool.",
      "Adjust options and use Process (or the visual editor for PDF Editor).",
      "Download the result when ready.",
    ],
    faq: [],
    relatedTools: s.relatedTools,
  }));
}
