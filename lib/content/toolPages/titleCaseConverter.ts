import type { TransformToolPageContent } from "../textToolPageTypes";

export const titleCaseConverterPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Title Case Converter — Free Online Headline Case | ExesTools",
    description:
      "Convert text to Title Case for headlines and product names. Live preview and copy in your browser.",
  },
  ui: {
    textareaPlaceholder: "Paste text to convert to Title Case.",
    outputHeading: "Title Case output",
    outputEmptyHint: "Title-cased text appears here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Title Case Converter Tool",
    paragraphs: [
      "Title case capitalizes the first letter of each word separated by whitespace. Readers associate the pattern with headlines, book titles, and branding. When CSV rows arrive in lowercase, fixing every cell by hand is slow; a converter applies a consistent rule in one pass while you keep editorial control.",
      "Style guides differ on small words such as articles and prepositions. This tool uses a simple rule: capitalize each token. Proofread against AP, Chicago, or internal standards before final publish. The goal is speed on drafts and lists, not replacing nuanced editorial judgment.",
      "Product and engineering teams often merge snake_case identifiers with marketing copy. Title case helps slides and changelog entries bridge both audiences. Support macros look cleaner before you paste them into ticketing tools.",
      "Processing runs locally in the browser so typical drafts are not uploaded for conversion. Copy buttons preserve originals and results for audits. Pair with duplicate-line removal after normalizing case so merges are easier.",
      "Localization teams compare English headline casing with target languages that use different rules. Designers preview how uppercase-heavy lines will look in narrow layouts. Each pass is immediate because the preview updates as you type.",
      "Bookmark this page in playbooks so contractors use the same approved tool. Stable URLs beat scattered instructions that reference unknown third parties.",
      "When body copy should feel conversational, switch to Sentence Case after headlines are set. Internal links between related utilities keep context.",
      "Irregular brand spelling still needs human review. Automated capitalization cannot know every trademark convention.",
      "Use the workspace until headings feel balanced, then paste results into your CMS or deck.",
      "Editors revising omnichannel campaigns often receive headline spreadsheets from analytics partners. Those exports may strip original casing. Title case conversion brings listicles, webinar titles, and SKU marketing names back to a presentable baseline before designers pull them into Figma tokens. The quicker that normalization happens, the sooner creative reviews focus on message rather than mechanical cleanup.",
      "Operations teams merging acquired brand names face subtle casing collisions in shared databases. A lightweight converter helps compare candidate titles side by side without opening enterprise DAM suites for trivial edits. Governance teams can distribute the same bookmark internally so contractors produce consistent casing evidence during audits.",
      "Researchers curating literature review matrices paste article titles from citation managers that vary in capitalization rules. Harmonizing to title case allows sorting and faceted search to behave predictably when imported into qualitative software. The step is small but reduces noise during coding passes.",
      "Engineers drafting internal RFC titles sometimes mirror repository folder conventions overnight, leaving README headings inconsistent with public docs. Running headings through title case before publication closes the gap between engineering tone and outward-facing polish without delaying the merge.",
      "Ultimately, headline casing communicates intention. A disciplined title case pass signals care before readers encounter the first paragraph. Pair this routine with character counts when banners must satisfy strict pixel widths so you never choose beauty at the expense of measurable limits.",
    ],
  },
  howToUse: {
    heading: "How to use this title case converter",
    steps: [
      {
        title: "Step 1: Paste your draft",
        body: "Add headlines or cells that need title casing.",
      },
      {
        title: "Step 2: Watch the preview",
        body: "Output updates live as you edit the left panel.",
      },
      {
        title: "Step 3: Copy",
        body: "Copy output for publishing; Copy input keeps the source.",
      },
      {
        title: "Step 4: Clear",
        body: "Clear all resets both panels for the next task.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Does this follow AP or Chicago style?",
        answer:
          "It uses capitalize-each-word. Adjust small words manually per your guide.",
      },
      {
        question: "Hyphenated words?",
        answer:
          "Each hyphenated chunk is one token; tweak if your guide differs.",
      },
      {
        question: "Uploads?",
        answer:
          "No server upload; conversion runs locally.",
      },
      {
        question: "Brand names?",
        answer:
          "Proofread special spellings after conversion.",
      },
      {
        question: "Mobile?",
        answer:
          "Panels stack on small screens with the same behavior.",
      },
      {
        question: "Sentence style instead?",
        answer:
          "Use the Sentence Case tool for body paragraphs.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
