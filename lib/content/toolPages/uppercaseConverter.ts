import type { TransformToolPageContent } from "../textToolPageTypes";

export const uppercaseConverterPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Uppercase Converter — Free Online ALL CAPS Text | ExesTools",
    description:
      "Convert text to UPPERCASE instantly. Free in-browser title styling, emphasis, and normalization—copy the result in one click.",
    pageHeading:
      "Uppercase Converter — turn any text into ALL CAPS in one step",
  },
  ui: {
    textareaPlaceholder: "Type or paste text to convert to uppercase…",
    outputHeading: "Uppercase output",
    outputEmptyHint: "Converted text will appear here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Uppercase Converter Tool",
    paragraphs: [
      "An uppercase converter transforms alphabetic characters into capital letters while leaving digits and punctuation largely unchanged. That simple automation saves time whenever mixed-case exports must become uniform headlines, labels, or disclaimer lines. Instead of retyping, writers paste once, review the preview, and copy the finished string into a CMS, slide, or spreadsheet cell.",
      "Teams use all caps selectively because the style changes tone and accessibility characteristics. Interface designers might prototype banner microcopy in uppercase before developers translate the look into CSS. Marketers test how acronyms or product codes read when emphasized uniformly. Data stewards normalize codes before matching against legacy tables that only store uppercase keys.",
      "Developers appreciate a browser tool when a quick transform beats opening an IDE for a one-off paste. Technical authors align glossary tokens with specification requirements. Support agents format ticket subjects for queues that expect uppercase prefixes. The workflow stays local in your tab, which helps when drafts should not traverse unnecessary cloud upload paths.",
      "Accessibility guidance reminds us that long passages in all caps can be harder to read and may affect screen reader pronunciation. Reserve uppercase for short phrases when possible, and pair with design review for longer content. The converter executes the mechanical part; editorial judgment remains yours.",
      "International text may include characters whose uppercase mapping depends on locale. This utility applies English-locale casing suitable for typical Latin-script English drafts. Validate specialized orthographies against linguistic references when compliance demands nuance beyond generic casing.",
      "Combine uppercase conversion with whitespace or duplicate-line cleanup when prepping messy CSV extracts. Stable URLs such as /tools/uppercase-converter become handy bookmarks for onboarding docs that teach repeatable cleanup pipelines.",
      "Training materials linking internally reduce dependence on unknown third-party sites. A predictable layout across ExesTools reinforces muscle memory: paste left, read right, copy, clear. That rhythm compounds across dozens of related utilities you might chain in a single afternoon.",
      "Ultimately uppercase conversion removes friction from deterministic edits. Humans focus on strategy and messaging while a focused tool handles repetitive casing at the speed of keystrokes.",
      "When tone shifts mid-project, switch to the lowercase, title case, or sentence case pages without losing context thanks to internal linking between complementary utilities.",
    ],
  },
  howToUse: {
    heading: "How to use this uppercase converter",
    steps: [
      {
        title: "Step 1: Enter text",
        body: "Paste or type the passage you want in ALL CAPS.",
      },
      {
        title: "Step 2: Review output",
        body: "The right panel updates live with the uppercase version.",
      },
      {
        title: "Step 3: Copy what you need",
        body: "Use Copy output for the transformed text or Copy input to preserve the original.",
      },
      {
        title: "Step 4: Clear when finished",
        body: "Clear all resets both panels for the next task.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Does this change numbers or punctuation?",
        answer:
          "Numbers and most punctuation stay as typed; letters become uppercase using English locale rules.",
      },
      {
        question: "Is upload required?",
        answer:
          "No. Conversion runs in your browser without sending text to a server.",
      },
      {
        question: "Very long documents?",
        answer:
          "Modern browsers handle typical article lengths; split extremely large files if the page slows.",
      },
      {
        question: "Mobile support?",
        answer:
          "Yes. Panels stack vertically with the same live updates.",
      },
      {
        question: "Difference from Caps Lock?",
        answer:
          "Caps Lock affects new typing; this tool converts existing pasted content instantly.",
      },
      {
        question: "Need another style?",
        answer:
          "Try Lowercase, Title Case, or Sentence Case tools for different editorial patterns.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
