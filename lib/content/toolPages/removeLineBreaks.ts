import type { TransformToolPageContent } from "../textToolPageTypes";

export const removeLineBreaksPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Remove Line Breaks - Free Online Join Lines | ExesTools",
    description:
      "Turn broken lines into continuous paragraphs by replacing newlines with spaces. Live browser preview and instant copy.",
    pageHeading:
      "Remove Line Breaks: join wrapped lines into smooth paragraphs instantly",
  },
  ui: {
    textareaPlaceholder: "Paste text with unwanted line breaks…",
    outputHeading: "Single-line paragraphs",
    outputEmptyHint: "Text with breaks removed appears here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Remove Line Breaks Tool",
    paragraphs: [
      "PDF and ebook excerpts often insert hard returns at fixed column widths. When pasted into email or CMS editors, those breaks create awkward mid-sentence gaps. Replacing newline runs with spaces reunites sentences while keeping words separated correctly. Writers finish faster than manual join operations across hundreds of lines.",
      "Legal analysts combining deposition snippets remove line numbers and stray breaks before full-text search. Journalists migrating archive stories decode print layouts preserved as plain text. Developers cleaning log excerpts want single-line JSON or stack traces for grep-friendly files.",
      "This utility collapses consecutive newlines into a single space and trims outer whitespace. Paragraph boundaries inferred only by single breaks will merge; if you need to keep intentional paragraph gaps, preprocess with placeholder markers or run remove-extra-spaces afterward with manual paragraph splits.",
      "Pair with duplicate-line removal only after deciding whether breaks carried meaning. Sometimes duplicates differ solely by wrap position; joining lines first clarifies uniqueness. Other times line order encodes steps you must preserve, so choose tooling order thoughtfully.",
      "Local processing keeps drafts inside your session. Copy buttons retain original and flattened variants for ticket histories. Accessibility improves when screen readers encounter continuous sentences instead of choppy fragments caused by PDF line endings.",
      "Localization engineers flatten vendor-provided strings before comparing lengths against English references. Marketing operations import influencer bios scraped with hard wraps into design tools expecting flowing paragraphs.",
      "Data-quality guides should list this step beside whitespace normalization in CRM hygiene playbooks. Contractors learning one canonical URL reduce variance in how cleanup is taught quarter to quarter.",
      "Very large pasted files may stress older devices; segment prudently. For typical articles and emails, feedback remains immediate.",
      "Line break removal is deterministic automation. Delegate it to software, proofread the merged prose, then continue with counting or casing tools as needed.",
      "When you must keep bullet lists, consider editing manually after flattening or isolate list blocks before processing body paragraphs.",
    ],
  },
  howToUse: {
    heading: "How to remove line breaks",
    steps: [
      {
        title: "Step 1: Paste wrapped text",
        body: "Include content where PDF or narrow columns inserted hard returns.",
      },
      {
        title: "Step 2: Check output",
        body: "Newlines become spaces; multiple breaks collapse.",
      },
      {
        title: "Step 3: Restore paragraphs if needed",
        body: "Insert blank lines manually where true paragraph gaps belong.",
      },
      {
        title: "Step 4: Export",
        body: "Copy output to your CMS or doc; Clear all when finished.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Double line breaks for paragraphs?",
        answer:
          "Runs of newlines collapse to a single space, so blank-line paragraphs merge. Add breaks manually after if required.",
      },
      {
        question: "Windows newlines?",
        answer:
          "CRLF and LF both normalize during processing.",
      },
      {
        question: "Upload?",
        answer:
          "No upload; runs locally in the browser.",
      },
      {
        question: "Vs remove extra spaces?",
        answer:
          "Use spacing tool to collapse spaces inside lines; this joins lines across breaks.",
      },
      {
        question: "Lists?",
        answer:
          "Flattening may blend list rows; edit list sections separately when structure matters.",
      },
      {
        question: "Mobile?",
        answer:
          "Stacked layout works the same on phones.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
