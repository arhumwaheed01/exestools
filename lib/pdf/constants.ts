/** Max size per uploaded file (bytes) — production cap 20 MB. */
export const MAX_PDF_FILE_BYTES = 20 * 1024 * 1024;

export const MAX_MERGE_TOTAL_BYTES = 80 * 1024 * 1024;

export const MAX_MERGE_FILE_COUNT = 16;

export const PDF_RATE_LIMIT_MAX = 30;
export const PDF_RATE_LIMIT_WINDOW_MS = 60_000;

/** pdfjs-dist build (must match package.json for worker URL). */
export const PDFJS_DIST_VERSION = "4.10.38";
