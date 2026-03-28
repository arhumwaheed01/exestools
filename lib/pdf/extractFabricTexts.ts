import type { PdfEditorTextItem } from "./editorTypes";

type FabricObj = {
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function extractTextsFromFabricJson(
  fabricJson: unknown,
  pageIndex: number,
  canvasW: number,
  canvasH: number,
): PdfEditorTextItem[] {
  if (!fabricJson || typeof fabricJson !== "object") return [];
  const objects = (fabricJson as { objects?: FabricObj[] }).objects;
  if (!Array.isArray(objects) || canvasW <= 0 || canvasH <= 0) return [];

  const out: PdfEditorTextItem[] = [];
  for (const o of objects) {
    const ty = o.type;
    if (ty !== "textbox" && ty !== "i-text" && ty !== "Textbox" && ty !== "IText") continue;
    const text = String(o.text ?? "").slice(0, 4000);
    if (!text.trim()) continue;
    const left = Number(o.left) || 0;
    const top = Number(o.top) || 0;
    const w = (Number(o.width) || 120) * (Number(o.scaleX) || 1);
    const h = (Number(o.height) || 24) * (Number(o.scaleY) || 1);
    const fs = Math.min(96, Math.max(6, Number(o.fontSize) || 14));
    const fw = o.fontWeight;
    const bold = fw === "bold" || fw === 700 || fw === "700" || Number(fw) >= 600;
    const italic = o.fontStyle === "italic";
    const alignRaw = (o.textAlign ?? "left").toLowerCase();
    const align = alignRaw === "center" || alignRaw === "right" ? alignRaw : "left";
    const heading = fs >= 22 || bold;

    out.push({
      pageIndex,
      nx: clamp01(left / canvasW),
      ny: clamp01(top / canvasH),
      nw: clamp01(w / canvasW) || 0.2,
      nh: clamp01(h / canvasH) || 0.04,
      text,
      fontSizePt: fs,
      bold,
      italic,
      align,
      heading,
    });
  }
  return out;
}
