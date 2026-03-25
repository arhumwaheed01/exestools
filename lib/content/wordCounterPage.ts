/**
 * Word Counter — full page copy, UI strings, and SEO (programmatic SEO source).
 * Re-exported from textToolsData for a single import path.
 */

export type WordCounterPageContent = {
  meta: {
    title: string;
    description: string;
  };
  ui: {
    textareaPlaceholder: string;
    copyButton: string;
    clearButton: string;
    copySuccess: string;
    liveCountsHeading: string;
    stats: {
      words: string;
      characters: string;
      charactersNoSpaces: string;
      sentences: string;
      paragraphs: string;
    };
  };
  seoArticle: {
    heading: string;
    paragraphs: string[];
  };
  howToUse: {
    heading: string;
    steps: { title: string; body: string }[];
  };
  faq: {
    heading: string;
    items: { question: string; answer: string }[];
  };
  relatedTools: {
    heading: string;
  };
};

export const wordCounterPageContent: WordCounterPageContent = {
  meta: {
    title: "Word Counter — Free Online Word, Character & Sentence Count",
    description:
      "Free word counter for essays, social posts, and SEO. Live counts for words, characters (with and without spaces), sentences, and paragraphs—no upload, works in your browser.",
  },
  ui: {
    textareaPlaceholder:
      "Paste or type your text here. Counts update as you type…",
    copyButton: "Copy text",
    clearButton: "Clear",
    copySuccess: "Copied!",
    liveCountsHeading: "Live counts",
    stats: {
      words: "Words",
      characters: "Characters (with spaces)",
      charactersNoSpaces: "Characters (no spaces)",
      sentences: "Sentences",
      paragraphs: "Paragraphs",
    },
  },
  seoArticle: {
    heading: "Word Counter Tool",
    paragraphs: [
      "A word counter is a lightweight utility that measures how many words appear in a piece of text. At its core, it answers a simple question that comes up constantly in writing workflows: how long is this draft? Beyond words, a capable counter also reports characters, sentences, and paragraphs so you can align with platform rules, assignment briefs, and editorial standards without guessing.",
      "Word counts matter because many systems still use length as a proxy for scope and readability. Academic papers, grant applications, and newsroom pieces often specify minimum or maximum words. Social networks, ad platforms, and product UIs cap characters to keep layouts stable. Even when a limit is not published, teams still compare drafts by length when estimating review time and translation cost. Having an accurate count removes friction from those conversations.",
      "Character counts add another layer of precision. Some forms count every keystroke including spaces; others exclude spaces to approximate “density” of letters and symbols. SEO titles and meta descriptions, SMS segments, and API fields frequently use character limits rather than word limits. Showing both with-space and without-space totals helps writers tune copy for the rule that actually applies, whether they are trimming a headline or padding a short description.",
      "Sentence and paragraph counts support structure and accessibility reviews. Long sentences can signal complexity; uneven paragraphing can make mobile reading harder. Editors and educators use these signals alongside word totals when giving feedback. Support teams use quick counts when normalizing tickets, and marketers use them when comparing variants of landing copy. None of these tasks require a full word processor—just a fast, trustworthy counter.",
      "Browser-based word counters are useful because they load quickly and work across devices. You can paste notes from a phone, polish an email on a laptop, or check a blog section on a shared computer without installing software. When processing stays local and nothing is uploaded unnecessarily, you can move faster with fewer concerns about where a draft might be stored. That speed is especially valuable under deadlines when context switching is costly.",
      "Writers and students rely on word counters to meet page or word minimums, stay inside essay limits, and verify that revisions actually shortened or expanded a section as intended. Content strategists use counts to compare drafts against briefs. Developers and technical writers use them when filling README sections, release notes, or UI strings that must stay within fixed layouts. Translators estimate effort from source length. The use cases are broad because text is everywhere.",
      "A practical word counter should feel immediate: type or paste, see numbers update, copy or edit, repeat. It should present the metrics that match real-world rules—words for editorial limits, characters for form fields, sentences and paragraphs for structure. It should stay visually clear so you can scan results in seconds. ExesTools aims to deliver that experience in a clean interface so counting never gets in the way of writing.",
      "Whether you are polishing a cover letter, tightening a product description, or checking a social thread before posting, a dependable word counter helps you ship with confidence. Use the tool above to measure your text live, then explore related utilities on ExesTools when you need case changes, character-only limits, or other text transformations in the same workflow.",
    ],
  },
  howToUse: {
    heading: "How to use this word counter",
    steps: [
      {
        title: "Step 1: Paste your text",
        body: "Paste or type your content into the text area. Counts update live as you edit.",
      },
      {
        title: "Step 2: View results",
        body: "Review words, characters (with and without spaces), sentences, and paragraphs in the summary grid.",
      },
      {
        title: "Step 3: Copy or edit",
        body: "Use Copy to grab your text, or Clear to reset the workspace and start a new count.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "What is a word counter?",
        answer:
          "A word counter measures how many words are in your text. Advanced counters also show characters, sentences, and paragraphs so you can match limits used by schools, publishers, and apps.",
      },
      {
        question: "Is this tool free?",
        answer:
          "Yes. This page is offered as a free utility so you can measure text quickly without a subscription.",
      },
      {
        question: "Does it store my data?",
        answer:
          "Your text is processed in the browser for counting. Do not paste confidential content on shared devices; follow your organization’s policies for sensitive material.",
      },
      {
        question: "How are words counted?",
        answer:
          "Words are split on whitespace after trimming empty edges, so spacing between tokens determines word boundaries.",
      },
      {
        question: "Why do character counts with and without spaces differ?",
        answer:
          "Some limits include every character including spaces; others measure only letters and symbols. Showing both helps you match the rule your form or style guide uses.",
      },
    ],
  },
  relatedTools: {
    heading: "Related tools",
  },
};
