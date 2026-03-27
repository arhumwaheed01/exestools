import type { TransformToolPageContent } from "../textToolPageTypes";

export const textReverserPageContent: TransformToolPageContent = {
  kind: "transform",
  meta: {
    title: "Text Reverser - Reverse Characters or Lines Free Online | ExesTools",
    description:
      "Reverse text character-by-character or flip line order. Creative testing, puzzles, and QA with live preview in your browser.",
    pageHeading:
      "Text Reverser: flip characters or whole lines with live preview",
  },
  ui: {
    textareaPlaceholder: "Enter text to reverse.",
    outputHeading: "Reversed text",
    outputEmptyHint: "Reversed output shows here.",
    copyInput: "Copy input",
    copyOutput: "Copy output",
    clearButton: "Clear all",
    copySuccess: "Copied!",
    reverseModeCharacters: "Reverse characters",
    reverseModeLines: "Reverse lines",
  },
  seoArticle: {
    heading: "Text Reverser Tool",
    paragraphs: [
      "Reversing text supports teaching, puzzles, and QA spot checks. Trainers show palindrome concepts; developers compare mirrored serializer output; puzzle authors hide clues. A browser reverser avoids throwaway scripts for quick tests.",
      "Character mode mirrors the full string order by Unicode code units. Line mode keeps characters inside rows but reverses top-to-bottom order, useful when you want last log lines first without altering tokens within each line.",
      "Local processing keeps drafts in your tab. Copy input before experimenting if you need an easy rollback. Clear resets everything between classroom demos.",
      "Pair with whitespace or dedupe tools when comparing mirrored list anomalies during forensics. Order tools thoughtfully so meaningful line breaks are not lost unintentionally.",
      "Screen readers struggle with reversed paragraphs; keep user-facing reversed strings rare and clearly labeled. Creative drafts for private review are fine.",
      "Performance is fine for typical notes; split huge logs if the browser slows.",
      "Bookmark next to case tools to teach full string pipelines in one syllabus link.",
      "Emoji-heavy strings may split unpredictably; verify visually for lessons.",
      "Stable URLs help onboarding docs stay accurate as themes update.",
      "Use deterministic reversal when the task is mechanical and your focus should stay on interpretation, not busywork.",
      "Security awareness programs sometimes demonstrate how reversible encodings mislead people who assume obscurity equals protection. Showing a reversed payload decoded live helps teams internalize why real cryptography matters. Trainers can snapshot before-and-after strings quickly from a browser tab without installing specialty software on locked-down machines.",
      "Journalists comparing leaked document excerpts occasionally need to verify whether line order was altered when sources provide fragments. Reversing line order temporarily highlights whether context changes when read backward. The technique is forensic-adjacent and should complement, not replace, legal review, yet it costs little to attempt during early triage.",
      "Musicians and poets experimenting with mirror forms explore palindrome constraints for rhythm games. Reversing characters reveals accidental symmetry or tension in a lyric draft. Because feedback is instant, creators iterate faster than toggling between notebooks and command-line toys.",
      "Customer support macros sometimes concatenate canned steps differently depending on channel. QA teams reverse sample transcripts to ensure macros remain coherent no matter assembly order. That behavioral check catches edge cases where pronouns flip awkwardly when blocks merge.",
      "Accessibility advocates caution that reversed strings should not appear as final UX copy. Reserve heavy reversal for staging, testing, or clearly labeled demos. Keeping the tool in an editor-first workflow respects end users who rely on predictable reading order.",
    ],
  },
  howToUse: {
    heading: "How to use this text reverser",
    steps: [
      {
        title: "Step 1: Choose a mode",
        body: "Pick characters for full mirroring or lines for row order flips.",
      },
      {
        title: "Step 2: Enter text",
        body: "Paste or type; output updates immediately.",
      },
      {
        title: "Step 3: Verify Unicode",
        body: "Check complex clusters if your use case depends on grapheme boundaries.",
      },
      {
        title: "Step 4: Copy or clear",
        body: "Copy output for exercises; Clear all for the next sample.",
      },
    ],
  },
  faq: {
    heading: "Frequently asked questions",
    items: [
      {
        question: "Grapheme clusters?",
        answer:
          "Reversal uses JS string units; verify emoji-heavy strings by eye.",
      },
      {
        question: "Blank lines in line mode?",
        answer:
          "Blank lines participate in order reversal.",
      },
      {
        question: "Upload?",
        answer:
          "No server upload; runs locally.",
      },
      {
        question: "Undo?",
        answer:
          "Copy input first to keep a snapshot.",
      },
      {
        question: "Large files?",
        answer:
          "Chunk very large logs if performance dips.",
      },
      {
        question: "Related utilities?",
        answer:
          "Use duplicate-line removal or whitespace cleanup when prepping text first.",
      },
    ],
  },
  relatedTools: { heading: "Related tools" },
};
