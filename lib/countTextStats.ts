/**
 * Pure counting helpers for text tools — same rules server/client.
 */

export type TextStats = {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
};

/** Words = non-empty tokens split on whitespace */
export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function countCharactersWithSpaces(text: string): number {
  return text.length;
}

export function countCharactersWithoutSpaces(text: string): number {
  return text.replace(/\s/g, "").length;
}

/** Sentences split on . ! ? */
export function countSentences(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const parts = t.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  return parts.length;
}

/** Paragraphs = non-empty blocks separated by line breaks */
export function countParagraphs(text: string): number {
  const blocks = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  return blocks.length;
}

export function computeTextStats(text: string): TextStats {
  return {
    words: countWords(text),
    charactersWithSpaces: countCharactersWithSpaces(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
  };
}
