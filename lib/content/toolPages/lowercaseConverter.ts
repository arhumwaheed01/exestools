import type { TransformToolPageContent } from "../textToolPageTypes";

export const lowercaseConverterPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Lowercase Converter — Free Online lowercase text | ExesTools",
    description:
      "Convert any text to lowercase in one step. Fast browser-based normalization for slugs, emails, identifiers, and drafts—copy or clear instantly.",
    pageHeading:
      "Lowercase Converter — normalize text to lowercase for slugs, emails, and data",
  },
  ui: {
    textareaPlaceholder: "Paste text to convert to lowercase…",
    outputHeading: "Lowercase output",
    outputEmptyHint: "Lowercase text appears here as you type.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Lowercase Converter Tool",
    paragraphs: [
      "A lowercase converter standardizes alphabetic characters to their small forms, which is useful whenever consistency matters more than emphasis. URLs, slug fields, and tag systems often expect lowercase tokens to avoid duplicate entries that differ only by case. Data pipelines comparing customer emails regularly normalize addresses to lowercase before deduplicating. Even prose editors sometimes temporarily lowercase a noisy paragraph to reapply capitalization thoughtfully with a subsequent tool.",
      "Software teams lowercase branch names, environment variables, and configuration keys according to team conventions. When a spreadsheet exports Title Case product names but the API expects lowercase identifiers, bulk conversion prevents manual errors. QA specialists paste failing payloads into the converter to mirror the shape engineers see in logs. The operation is simple, but the errors it prevents—subtle casing mismatches—can waste hours.",
      "Writers applying house style may lowercase headlines or poetry drafts during early passes, then rebuild emphasis manually. Localization teams sometimes compare source and target strings in lowercase to ignore capitalization differences while focusing on word choice. Teachers demonstrate how case changes perception before asking students to rewrite in sentence style. Each scenario benefits from an immediate preview rather than a word processor dialog buried three menus deep.",
      "Privacy-sensitive workflows still appreciate browser-local tools. Lowercasing does not inherently anonymize content, but it can be one step in preparing samples for tickets where mixed-case identifiers should not leak internal branding. Always follow policy; the utility simply performs deterministic editing inside your session.",
      "Pair lowercase conversion with duplicate-line removal when cleaning vendor lists exported from CRM systems. Vendor names that only differ by case collapse visually once normalized, making deduplication more reliable before you merge rows. Similarly, after removing extra spaces, cases align for better sorting in analytics.",
      "ExesTools exposes copy buttons for both panels so you can retain originals for audit trails. Clear resets everything when you rotate to unrelated tasks. Responsive layout keeps the workflow comfortable on tablets during meetings where laptops stay closed.",
      "Locale-aware lowercasing follows English defaults suitable for typical Latin-script English drafts. Specialized linguistic cases may need expert review. When standards demand Turkish dotted dotless distinctions or other locale rules, validate against authoritative references after conversion.",
      "Bookmarking a stable lowercase tool URL trains newcomers on a sanctioned workflow. Documentation linking internally reduces scatter across random online utilities whose privacy posture may be unclear. A consistent layout across ExesTools text pages reinforces that predictability.",
      "Lowercase conversion exemplifies boring automation done well: predictable, fast, and transparent. Let the machine handle mechanical casing while humans focus on meaning, structure, and tone—then reach for uppercase or title case utilities when the brief changes.",
    ],
  },
  howToUse: {
    heading: "How to use this lowercase converter",
    steps: [
      {
        title: "Step 1: Paste or type",
        body: "Add the text you want normalized to lowercase.",
      },
      {
        title: "Step 2: Check the preview",
        body: "The output panel mirrors every change live.",
      },
      {
        title: "Step 3: Copy results",
        body: "Copy output for slugs, emails, or code-friendly strings; Copy input keeps the source.",
      },
      {
        title: "Step 4: Reset",
        body: "Clear all removes both fields when you start a new batch.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Will punctuation be removed?",
        answer:
          "No. Punctuation and digits remain; alphabetic characters become lowercase.",
      },
      {
        question: "Is the original lost?",
        answer:
          "The input stays editable until you clear it. Copy input if you need a snapshot before further edits.",
      },
      {
        question: "Server uploads?",
        answer:
          "Processing stays in your browser; drafts are not transmitted for conversion.",
      },
      {
        question: "Can I use this for email addresses?",
        answer:
          "Yes. Lowercasing is a common normalization step, but always confirm behavior with your mail provider’s rules.",
      },
      {
        question: "Does it change Unicode letters?",
        answer:
          "Letters supported by the Unicode lowercase mapping in your browser update accordingly.",
      },
      {
        question: "What if I need Title Case instead?",
        answer:
          "Open the Title Case converter for headline-style capitalization after drafting in lowercase.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
