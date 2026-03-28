/**
 * Client → /api/pdf/edit-advanced.
 * v1: vector text + watermark (legacy).
 * v2: raster overlays (drawings, shapes, images, styled text) + watermark.
 */

export type PdfEditorTextItem = {
  pageIndex: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
  text: string;
  fontSizePt: number;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  heading: boolean;
};

export type PdfEditorWatermark = {
  text: string;
  opacity: number;
  position?: "center" | "diagonal" | "top" | "bottom";
};

export type PdfEditorPayloadV1 = {
  version: 1;
  pageOrder: number[];
  pageRotations: Record<string, number>;
  texts: PdfEditorTextItem[];
  watermark?: PdfEditorWatermark | null;
};

/** Base64 PNG without data URL prefix; transparent where empty. */
export type PdfEditorPayloadV2 = {
  version: 2;
  pageOrder: number[];
  pageRotations: Record<string, number>;
  pageOverlays: Record<string, string>;
  watermark?: PdfEditorWatermark | null;
};

export type PdfEditorPayload = PdfEditorPayloadV1 | PdfEditorPayloadV2;
