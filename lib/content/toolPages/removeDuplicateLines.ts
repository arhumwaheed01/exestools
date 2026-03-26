import type { TransformToolPageContent } from "../textToolPageTypes";

export const removeDuplicateLinesPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Remove Duplicate Lines — Free Online Dedupe Text | ExesTools",
    description:
      "Remove duplicate lines while preserving first-occurrence order. Clean logs, lists, and exports in your browser—copy the deduped output instantly.",
    pageHeading:
      "Remove Duplicate Lines — dedupe lists and logs while keeping order",
  },
  ui: {
    textareaPlaceholder: "Paste lines; duplicates will be removed in order…",
    outputHeading: "Deduped lines",
    outputEmptyHint: "Unique lines appear here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Remove Duplicate Lines Tool",
    paragraphs: [
      "Removing duplicate lines is a fundamental cleanup step when lists arrive from merged spreadsheets, log exports, or copy-pasted chat transcripts. Exact duplicates waste rows in databases, confuse analytics dashboards, and inflate file sizes mailed between teams. A dedupe utility scans line by line, keeps the first time a string appears, and drops later identical rows while preserving original order—critical when chronology encodes priority.",
      "Operations teams deduplicate transaction IDs before reconciling payouts. Support queues sometimes ingest multiple templates that repeat the same boilerplate line; stripping repeats clarifies actual user questions. Event planners merge RSVP exports from different forms where guests register twice with the same email; deduping reduces printed badges and seating errors.",
      "Engineers working with config diffs may paste environment dumps into a tool to verify uniqueness of keys before applying secrets managers. Marketing analysts combine influencer handles scraped from several tabs; exact duplicates skew follower rollups. Researchers cleaning survey free-text paths normalize redundant choices before coding themes.",
      "The algorithm here is intentionally straightforward: lines match using the entire string exactly, including internal spaces. Trim operations are not implied unless you preprocess with a whitespace tool. That predictability helps QA write test cases knowing identical lines with different trailing spaces remain distinct until you normalize separately.",
      "Browser-local processing means lists you paste are not automatically uploaded. Still avoid pasting regulated personal data on shared machines. Copy buttons help you snapshot before-and-after lists for tickets documenting what changed during cleanup.",
      "Pair deduplication with lowercase conversion when case differences should not define uniqueness. Merge those steps carefully—order matters. Often normalize case first, then dedupe, unless casing carries semantic meaning such as stock tickers.",
      "Internal links guide you to related utilities like text reversal for creative QA or word counting to estimate cleanup effort. A stable /tools/remove-duplicate-lines URL trains contractors on the approved workflow instead of ad hoc spreadsheet macros.",
      "Performance remains acceptable for typical list sizes in modern laptops; extremely large files might warrant streaming tools. For everyday office-scale batches, immediate feedback beats shell scripts new hires do not yet know how to run.",
      "Duplicate removal is boring infrastructure work that unlocks trustworthy downstream analytics. Treat it as a repeatable step in your data hygiene playbook and keep the bookmark handy whenever two exports collide.",
    ],
  },
  howToUse: {
    heading: "How to remove duplicate lines",
    steps: [
      {
        title: "Step 1: Paste lines",
        body: "Each line break defines a row; blank lines count as their own entries.",
      },
      {
        title: "Step 2: Review the output",
        body: "Unique lines appear on the right in first-seen order.",
      },
      {
        title: "Step 3: Normalize if needed",
        body: "Use trim or case tools first when differences are only whitespace or casing.",
      },
      {
        title: "Step 4: Export",
        body: "Copy output into spreadsheets, tickets, or scripts.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Is order preserved?",
        answer:
          "Yes. The first occurrence stays; later identical lines are removed.",
      },
      {
        question: "Case sensitive?",
        answer:
          "Yes. “Apple” and “apple” differ. Lowercase first if case should be ignored.",
      },
      {
        question: "Trailing spaces?",
        answer:
          "They count as part of the line. Remove extra spaces separately if needed.",
      },
      {
        question: "Server upload?",
        answer:
          "No. Deduping runs locally in your session.",
      },
      {
        question: "Blank lines?",
        answer:
          "Multiple blank lines dedupe each other; keep that in mind for paragraph spacing.",
      },
      {
        question: "Fuzzy duplicates?",
        answer:
          "This tool matches exact strings only, not near-duplicates with typos.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
