/**
 * Shared shapes for full text-tool pages (SEO + UI); scale to 100+ slugs.
 */

export type TextToolSeoSections = {
  seoArticle: {
    heading: string;
    paragraphs: string[];
  };
  howToUse: {
    heading: string;
    steps: { title: string; body: string }[];
  };
  /** Optional “Features” block for SEO structure (H2). */
  features?: {
    heading: string;
    items: string[];
  };
  faq: {
    heading: string;
    items: { question: string; answer: string }[];
  };
  relatedTools: {
    heading: string;
  };
};

/** Per-tool document meta + visible page heading. */
export type ToolPageMeta = {
  title: string;
  description: string;
  /** Accessible H1: tool name + benefit */
  pageHeading: string;
};

export type StatKey =
  | "words"
  | "characters"
  | "charactersNoSpaces"
  | "sentences"
  | "paragraphs";

export type StatsToolUi = {
  textareaPlaceholder: string;
  copyButton: string;
  clearButton: string;
  copySuccess: string;
  liveCountsHeading: string;
  stats: Record<StatKey, string>;
  /** Display order for the live stats grid */
  statOrder?: StatKey[];
};

export type StatsToolPageContent = TextToolSeoSections & {
  kind: "stats";
  meta: ToolPageMeta;
  ui: StatsToolUi;
};

export type TransformToolUi = {
  textareaPlaceholder: string;
  outputHeading: string;
  outputEmptyHint: string;
  copyInput: string;
  copyOutput: string;
  clearButton: string;
  copySuccess: string;
  reverseModeCharacters?: string;
  reverseModeLines?: string;
};

export type TransformToolPageContent = TextToolSeoSections & {
  kind: "transform";
  meta: ToolPageMeta;
  ui: TransformToolUi;
};

export type CompareToolPageContent = TextToolSeoSections & {
  kind: "compare";
  meta: ToolPageMeta;
  ui: {
    leftPlaceholder: string;
    rightPlaceholder: string;
    resultHeading: string;
    copyButton: string;
    clearButton: string;
    copySuccess: string;
  };
};

export type FindReplaceToolPageContent = TextToolSeoSections & {
  kind: "find-replace";
  meta: ToolPageMeta;
  ui: {
    textareaPlaceholder: string;
    findPlaceholder: string;
    replacePlaceholder: string;
    outputHeading: string;
    copyButton: string;
    clearButton: string;
    copySuccess: string;
  };
};

export type SpeechToolPageContent = TextToolSeoSections & {
  kind: "speech-tts" | "speech-stt";
  meta: ToolPageMeta;
  ui: TransformToolUi;
};

export type DevHashAlgorithm = "md5" | "sha1" | "sha256";

export type DevSpecialVariant =
  | "password"
  | "uuid"
  | "cron"
  | "timestamp"
  | "jwt"
  | "headers"
  | "ip"
  | "ua";

export type DevHashToolPageContent = TextToolSeoSections & {
  kind: "dev-hash";
  meta: ToolPageMeta;
  algorithm: DevHashAlgorithm;
  ui: TransformToolUi;
};

export type DevSpecialToolPageContent = TextToolSeoSections & {
  kind: "dev-special";
  meta: ToolPageMeta;
  variant: DevSpecialVariant;
  ui: TransformToolUi;
};

export type ImageToolVariant =
  | "compress"
  | "compress-jpeg"
  | "compress-png"
  | "compress-webp"
  | "jpg-to-png"
  | "png-to-jpg"
  | "jpg-to-webp"
  | "webp-to-jpg"
  | "png-to-webp"
  | "webp-to-png"
  | "resize"
  | "crop"
  | "rotate"
  | "flip"
  | "to-base64"
  | "from-base64"
  | "metadata"
  | "remove-metadata";

export type ImageToolPageContent = TextToolSeoSections & {
  kind: "image-tool";
  meta: ToolPageMeta;
  variant: ImageToolVariant;
  ui: TransformToolUi;
};

export type PdfToolVariant =
  | "pdf-to-word"
  | "word-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "pdf-editor-free";

export type PdfToolPageContent = TextToolSeoSections & {
  kind: "pdf-tool";
  meta: ToolPageMeta;
  variant: PdfToolVariant;
  ui: TransformToolUi;
};

export type TextToolFullPageContent =
  | StatsToolPageContent
  | TransformToolPageContent
  | CompareToolPageContent
  | FindReplaceToolPageContent
  | SpeechToolPageContent
  | DevHashToolPageContent
  | DevSpecialToolPageContent
  | ImageToolPageContent
  | PdfToolPageContent;
