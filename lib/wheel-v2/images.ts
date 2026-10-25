/** Local-only wheel images (PNG/JPG/WebP). Never included in share links. */

const KEY = (toolId: string) => `et:wheel-v2:images:${toolId}`;
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_EDGE = 512;

export type WheelImages = {
  background: string | null;
  center: string | null;
  /** data URLs keyed by entry label (lowercased). */
  entries: Record<string, string>;
};

const EMPTY: WheelImages = { background: null, center: null, entries: {} };

export function loadWheelImages(toolId: string): WheelImages {
  try {
    const raw = localStorage.getItem(KEY(toolId));
    if (!raw) return { ...EMPTY, entries: {} };
    const parsed = JSON.parse(raw) as WheelImages;
    return {
      background: typeof parsed.background === "string" ? parsed.background : null,
      center: typeof parsed.center === "string" ? parsed.center : null,
      entries:
        parsed.entries && typeof parsed.entries === "object" ? { ...parsed.entries } : {},
    };
  } catch {
    return { ...EMPTY, entries: {} };
  }
}

export function saveWheelImages(toolId: string, images: WheelImages): void {
  try {
    localStorage.setItem(KEY(toolId), JSON.stringify(images));
  } catch {
    /* quota */
  }
}

export async function fileToResizedDataUrl(file: File): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/i.test(file.type)) {
    throw new Error("TYPE");
  }
  if (file.size > MAX_BYTES) throw new Error("SIZE");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.85);
}
