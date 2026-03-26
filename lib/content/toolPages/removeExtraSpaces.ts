import type { TransformToolPageContent } from "../textToolPageTypes";

export const removeExtraSpacesPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Remove Extra Spaces — Free Online Whitespace Cleaner | ExesTools",
    description:
      "Collapse extra spaces and clean line ends in pasted text. Live preview, browser-based, copy output in one click.",
    pageHeading:
      "Remove Extra Spaces — clean double spaces and messy whitespace fast",
  },
  ui: {
    textareaPlaceholder: "Paste messy text with double spaces or stray tabs…",
    outputHeading: "Cleaned text",
    outputEmptyHint: "Normalized spacing appears here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Remove Extra Spaces Tool",
    paragraphs: [
      "Extra spaces sneak into text from PDF copies, chat exports, or merged cells that padded values for alignment. They break exact duplicate detection, skew CSV imports, and make search indexes treat visually similar strings as different keys. Collapsing consecutive spaces inside each line restores predictable formatting without rewriting the entire document.",
      "This tool trims trailing spaces per line and replaces runs of whitespace with a single ordinary space. Newline characters are preserved so paragraph structure remains intact unless you combine this step with a line-break remover later. That composition pattern mirrors how editors think: first stabilize horizontal spacing, then address vertical breaks if needed.",
      "Legal and finance teams cleaning client-supplied tables reduce mismatches when reconciling account names that only differ by invisible padding. Developers normalizing user agent strings before hashing remove noise introduced by copy from browser devtools. Writers preparing manuscripts for typesetters avoid double spaces left over from typewriter-era habits.",
      "Because processing is local, you can iterate quickly on confidential drafts that still should not traverse unapproved services. Pair the tool with lowercase or title case normalization when preparing master data for CRM deduplication routines.",
      "Accessibility-focused teams know screen readers may announce odd pauses when double spaces sit mid-sentence. Cleaning spacing is a small but real readability win. Similarly, localization engineers comparing source and target files spot diff noise from stray tabs faster after normalization.",
      "Performance expectations stay modest: typical memos and article-length excerpts run instantly. Extremely large logs may need chunked processing. For classroom-scale assignments or quarterly reports, immediate feedback beats shell one-liners some authors do not know yet.",
      "Bookmark the utility in data-quality checklists placed next to duplicate-line removal. Order matters: normalize spaces before deduping if whitespace was the only difference, or afterward if dedupe should treat space variants separately first for auditing.",
      "Stable URLs document the approved method for interns rotating through operations teams. Screenshots age; links to ExesTools stay current as layouts refine.",
      "Spacing cleanup is mechanical labor best delegated to software. Finish faster, review meaning, then move on to counting or casing tasks using sibling tools linked from this page.",
      "When single newlines should become paragraph breaks in a CMS, keep them here; when they should become spaces, follow with the Remove Line Breaks tool in your pipeline.",
    ],
  },
  howToUse: {
    heading: "How to remove extra spaces",
    steps: [
      {
        title: "Step 1: Paste text",
        body: "Include the messy content with double spaces or tabs.",
      },
      {
        title: "Step 2: Review output",
        body: "Each line trims trailing spaces; internal runs collapse to one space.",
      },
      {
        title: "Step 3: Chain other tools",
        body: "Optionally dedupe lines or remove breaks after spacing looks good.",
      },
      {
        title: "Step 4: Copy result",
        body: "Copy output into your editor or sheet; Clear all when done.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Are newlines removed?",
        answer:
          "No. Only horizontal spacing per line is normalized; line breaks stay.",
      },
      {
        question: "Non-breaking spaces?",
        answer:
          "Standard runs collapse; unusual Unicode spaces may need manual review.",
      },
      {
        question: "Upload?",
        answer:
          "Processing stays in your browser.",
      },
      {
        question: "Leading spaces on lines?",
        answer:
          "Trailing spaces trim; leading internal spacing collapses after the first non-space.",
      },
      {
        question: "Difference from remove line breaks?",
        answer:
          "That tool joins lines into paragraphs; this keeps line structure.",
      },
      {
        question: "Tabs?",
        answer:
          "Tabs count as whitespace and collapse into a single space.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
