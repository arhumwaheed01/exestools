import type { TextToolFullPageContent } from "./textToolPageTypes";
import { characterCounterPageContent } from "./toolPages/characterCounter";
import { lowercaseConverterPageContent } from "./toolPages/lowercaseConverter";
import { removeDuplicateLinesPageContent } from "./toolPages/removeDuplicateLines";
import { removeExtraSpacesPageContent } from "./toolPages/removeExtraSpaces";
import { removeLineBreaksPageContent } from "./toolPages/removeLineBreaks";
import { sentenceCaseConverterPageContent } from "./toolPages/sentenceCaseConverter";
import { textReverserPageContent } from "./toolPages/textReverser";
import { titleCaseConverterPageContent } from "./toolPages/titleCaseConverter";
import { uppercaseConverterPageContent } from "./toolPages/uppercaseConverter";

/** All standard text tools except word-counter (see wordCounterPage). */
export const standardTextToolPages: Record<string, TextToolFullPageContent> = {
  "character-counter": characterCounterPageContent,
  "uppercase-converter": uppercaseConverterPageContent,
  "lowercase-converter": lowercaseConverterPageContent,
  "title-case-converter": titleCaseConverterPageContent,
  "sentence-case-converter": sentenceCaseConverterPageContent,
  "remove-duplicate-lines": removeDuplicateLinesPageContent,
  "remove-extra-spaces": removeExtraSpacesPageContent,
  "text-reverser": textReverserPageContent,
  "remove-line-breaks": removeLineBreaksPageContent,
};
