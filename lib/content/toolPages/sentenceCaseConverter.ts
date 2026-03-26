import type { TransformToolPageContent } from "../textToolPageTypes";

export const sentenceCaseConverterPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Sentence Case Converter — Free Online Fix Capitalization | ExesTools",
    description:
      "Convert text to sentence case: lowercase with capital letters after sentence endings. Live browser preview, copy output, privacy-friendly.",
    pageHeading:
      "Sentence Case Converter — fix capitalization with proper sentence starts",
  },
  ui: {
    textareaPlaceholder: "Paste paragraphs to convert to sentence case…",
    outputHeading: "Sentence case output",
    outputEmptyHint: "Sentence-cased text appears here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
  },
  seoArticle: {
    heading: "Sentence Case Converter Tool",
    paragraphs: [
      "Sentence case lowers overall casing and then capitalizes the beginning of sentences, typically after periods, question marks, and exclamation points, plus the very start of the passage. The style matches how most paragraphs read in essays, knowledge bases, and product descriptions. When drafts arrive in all caps or randomly mixed from OCR, sentence case restores readability faster than manual retyping.",
      "Content strategists migrating legacy PDF text into modern CMS fields use sentence case to align with accessibility guidance favoring readable body copy. Legal notices sometimes remain uppercase by requirement; narrative help articles beside them usually return to sentence rhythm. Having a converter at hand prevents inconsistent patches where half the article follows one convention and half another.",
      "Data imported from spreadsheets may capitalize every cell by default export settings. Bulk sentence casing before publishing avoids a robotic Title Case feel in long explanatory paragraphs. Support macros and chat snippets benefit when agents paste knowledge-base excerpts that must sound conversational rather than like billboard headlines.",
      "Developers writing human-readable error strings sometimes prototype in uppercase for visibility, then normalize to sentence case before shipping. Technical writers revising API guides can paste multi-sentence descriptions to enforce uniform casing without disturbing code fences if they process prose separately.",
      "The transformation runs locally, which suits teams handling drafts that should avoid unnecessary uploads. Always follow organizational policy; the utility is a formatting aid, not a security control. Copy buttons let you retain both raw and normalized versions for version history.",
      "Edge cases include abbreviations that end with periods mid-sentence and initials that should stay uppercase. Automated rules may require manual touch-up. Proofreading remains essential, especially for medical, legal, or regulated industries where a mis-cased term changes meaning.",
      "Pair sentence case with remove-extra-spaces when cleaning pasted emails where broken lines introduced odd capitals. Similarly, removing line breaks before casing can prevent stray mid-sentence capitals caused by hard wraps.",
      "Bookmark the sentence-case-converter page for onboarding checklists that teach writers a standard cleanup order: trim whitespace, normalize casing, verify facts. Repeatable URLs reduce confusion about which third-party site was used last quarter.",
      "Sentence case represents the calm default of long-form reading on screens. Tools that apply it quickly let creators spend energy on clarity and structure instead of fighting capitalization drift.",
      "When headlines need emphasis later, switch to Title Case or Uppercase after body copy stabilizes. Cross-linking between utilities keeps the workflow coherent.",
      "Corporate wikis accumulated over years mix voice from dozens of contributors. Some pages retain shouting caps from urgent incidents long resolved. Sentence case modernizes tone without rewriting facts, letting stewards schedule cosmetic sweeps separately from accuracy updates.",
      "Grant writers juggling character-limited bios alongside narrative sections often draft with temporary emphasis. Converting body paragraphs to sentence case after locking word budgets prevents rhetorical caps from fossilizing. Pair with the character counter to confirm bios still fit sponsor portals.",
      "Machine transcription imports frequently capitalize every clause because models mimic subtitle styling. Journalists clean interviews faster by sentence-casing transcripts before attributing quotations manually.",
      "Some communities use intentional mid-word capitals reflecting identity. Automated sentence case may harm that intent; reapply respectful capitalization after automation when guides require it.",
    ],
  },
  howToUse: {
    heading: "How to use this sentence case converter",
    steps: [
      {
        title: "Step 1: Paste your text",
        body: "Add paragraphs that need sentence-style capitalization.",
      },
      {
        title: "Step 2: Inspect the preview",
        body: "The output column updates live while you edit.",
      },
      {
        title: "Step 3: Correct edge cases",
        body: "Review abbreviations and proper nouns; tweak manually where rules differ.",
      },
      {
        title: "Step 4: Copy or clear",
        body: "Copy output into your CMS or Clear all to reset.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "How are sentences detected?",
        answer:
          "Capitalization restarts after ., ?, or ! followed by space, and at the beginning of the text.",
      },
      {
        question: "Will proper nouns stay correct?",
        answer:
          "The tool lowercases words generically. Re-capitalize product names after conversion.",
      },
      {
        question: "Upload required?",
        answer:
          "No. Everything processes in your browser tab.",
      },
      {
        question: "All caps input?",
        answer:
          "Yes: sentence case restores a more readable rhythm for body copy.",
      },
      {
        question: "Different from title case?",
        answer:
          "Title case capitalizes each word; sentence case only leads sentences and the first letter.",
      },
      {
        question: "Works offline?",
        answer:
          "After the page loads once, many browsers keep running the script without new network calls until refresh.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
