"use client";

import type { CSSProperties, DragEvent, MutableRefObject, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LuAlignCenter,
  LuAlignLeft,
  LuAlignRight,
  LuBold,
  LuCheck,
  LuCircle,
  LuDownload,
  LuHeading1,
  LuHeading2,
  LuHighlighter,
  LuImagePlus,
  LuItalic,
  LuLoaderCircle,
  LuMinus,
  LuMousePointer2,
  LuPencil,
  LuPlus,
  LuRedo2,
  LuRotateCwSquare,
  LuSquare,
  LuTrash2,
  LuType,
  LuUnderline,
  LuUndo2,
} from "react-icons/lu";
import type { PdfEditorPayloadV2 } from "@/lib/pdf/editorTypes";
import { fabricJsonToPngBase64 } from "@/components/tools/pdf-editor/exportOverlay";
import { PDFJS_DIST_VERSION } from "@/lib/pdf/constants";
import { MAX_PDF_FILE_BYTES } from "@/lib/pdf/constants";
import {
  extractOcrTextHitsFromCanvas,
  mergeNativeAndOcrHitsForPick,
} from "@/lib/pdf/ocrPageTextHits";
import {
  extractPdfTextHits,
  getEditorPageViewport,
  pickPdfTextHit,
  type PdfTextHit,
} from "@/lib/pdf/pdfPageTextHits";
import {
  FloatingTextFormatBar,
  type TextBarAction,
} from "@/components/tools/pdf-editor/FloatingTextFormatBar";
import { FABRIC_TEXTBOX_EDIT_CHROME } from "@/components/tools/pdf-editor/fabricTextChrome";

const MAX_PAGES = 120;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const LAYOUT_MAX_W = 880;

type PdfRenderTask = ReturnType<import("pdfjs-dist").PDFPageProxy["render"]>;
type EditorTool =
  | "select"
  | "text"
  | "draw"
  | "highlight"
  | "rect"
  | "circle"
  | "arrow"
  | "image";

type FabricCanvasInstance = InstanceType<(typeof import("fabric"))["Canvas"]>;

const FABRIC_JSON_PROPS = ["pdfHitIndex", "pdfMaskForHit"] as const;

/** Hover preview rect — must never be persisted in undo/export JSON. */
function stripHoverGuideForSnapshot(c: FabricCanvasInstance): import("fabric").FabricObject[] {
  const removed: import("fabric").FabricObject[] = [];
  for (const o of c.getObjects()) {
    if ((o as { pdfHoverGuide?: boolean }).pdfHoverGuide) {
      c.remove(o);
      removed.push(o);
    }
  }
  return removed;
}

function fabricSnapshot(c: FabricCanvasInstance): string {
  const ephem = stripHoverGuideForSnapshot(c);
  try {
    return JSON.stringify(c.toJSON([...FABRIC_JSON_PROPS]));
  } finally {
    ephem.forEach((o) => c.add(o));
  }
}

function hidePdfTextHoverGuide(c: FabricCanvasInstance) {
  const g = c.getObjects().find((o) => (o as { pdfHoverGuide?: boolean }).pdfHoverGuide);
  if (g && (g as { visible?: boolean }).visible !== false) {
    g.set({ visible: false });
    c.requestRenderAll();
  }
}

function isPdfHitClaimedByTextbox(c: FabricCanvasInstance, hitIndex: number): boolean {
  return c.getObjects().some((o) => {
    const typ = (o as { type?: string }).type?.toLowerCase();
    const a = o as { pdfHitIndex?: number };
    return typ === "textbox" && a.pdfHitIndex === hitIndex;
  });
}

function baseCursorForTool(t: EditorTool): string {
  if (t === "select") return "default";
  if (t === "image") return "copy";
  return "crosshair";
}

function reviveFabricPdfMeta(serialized: object, obj: import("fabric").FabricObject) {
  const o = serialized as { pdfHitIndex?: number; pdfMaskForHit?: number; type?: string };
  if (typeof o.pdfHitIndex === "number") obj.set("pdfHitIndex", o.pdfHitIndex);
  if (typeof o.pdfMaskForHit === "number") obj.set("pdfMaskForHit", o.pdfMaskForHit);
  const typ = o.type?.toLowerCase() ?? (obj as { type?: string }).type?.toLowerCase();
  if (typ === "textbox") obj.set({ ...FABRIC_TEXTBOX_EDIT_CHROME });
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function readApiError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  if (raw) {
    try {
      const j = JSON.parse(raw) as { error?: string };
      if (j.error) return j.error;
    } catch {
      if (raw.length < 240) return raw;
    }
  }
  return res.statusText || "Request failed.";
}

const FONT_OPTIONS = [
  "Helvetica, Arial, sans-serif",
  "Georgia, Times New Roman, serif",
  "Courier New, Courier, monospace",
  "Verdana, Geneva, sans-serif",
  "Trebuchet MS, sans-serif",
];

function useInView(callback: (visible: boolean) => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === el) callback(e.isIntersecting);
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [callback]);
  return ref;
}

/** Read-only PDF row for non-active pages (lazy). */
function StaticPdfRow({
  pdfDoc,
  origIndex,
  rotation,
  maxW,
  onActivate,
}: {
  pdfDoc: import("pdfjs-dist").PDFDocumentProxy;
  origIndex: number;
  rotation: number;
  maxW: number;
  onActivate: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const taskRef = useRef<PdfRenderTask | null>(null);
  const [visible, setVisible] = useState(false);
  const inViewRef = useInView(setVisible);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (inViewRef as MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [inViewRef],
  );

  useEffect(() => {
    if (!visible) return;
    const c = canvasRef.current;
    if (!c) return;
    let cancelled = false;

    (async () => {
      taskRef.current?.cancel();
      try {
        await taskRef.current?.promise;
      } catch {
        /* ignore */
      }
      taskRef.current = null;

      const page = await pdfDoc.getPage(origIndex + 1);
      const base = page.getViewport({ scale: 1, rotation });
      const scale = Math.min(maxW / base.width, 2);
      const vp = page.getViewport({ scale, rotation });
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const task = page.render({ canvasContext: ctx, viewport: vp });
      taskRef.current = task;
      try {
        await task.promise;
      } catch {
        /* cancelled */
      } finally {
        if (taskRef.current === task) taskRef.current = null;
      }
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
      taskRef.current?.cancel();
    };
  }, [visible, pdfDoc, origIndex, rotation, maxW]);

  return (
    <div ref={setRefs} className="w-full">
      <button
        type="button"
        onClick={onActivate}
        className="group w-full rounded-xl border border-dashed border-input-border/80 bg-white p-2 text-left shadow-sm transition-colors hover:border-primary/50 hover:shadow-md"
      >
        <canvas
          ref={canvasRef}
          className="mx-auto block max-h-[70vh] max-w-full rounded-lg bg-white"
        />
        <p className="mt-2 text-center text-xs font-medium text-secondary-text/80 group-hover:text-primary">
          Page {origIndex + 1} · Click to edit
        </p>
      </button>
    </div>
  );
}

export function PdfEditorWorkspace() {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvasInstance | null>(null);
  const pdfDocRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const pdfFileRef = useRef<File | null>(null);
  /** PDF text runs for click-to-edit (viewport-aligned with active canvas). */
  const nativeTextHitsRef = useRef<Record<number, PdfTextHit[]>>({});
  const ocrTextHitsRef = useRef<Record<number, PdfTextHit[]>>({});
  const fabricJsonByPage = useRef<Record<number, string>>({});
  const dimsByPage = useRef<Record<number, { w: number; h: number }>>({});
  const prevOrigRef = useRef<number | null>(null);
  const undoByPage = useRef<Record<number, string[]>>({});
  const redoByPage = useRef<Record<number, string[]>>({});
  const dragThumb = useRef<{ from: number } | null>(null);
  const fabricLoadingRef = useRef(false);
  const mainPdfRenderTaskRef = useRef<PdfRenderTask | null>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [layoutWidth, setLayoutWidth] = useState(720);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<EditorTool>("select");
  const toolRef = useRef<EditorTool>(tool);
  toolRef.current = tool;
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [fillColor, setFillColor] = useState("transparent");
  const [brushWidth, setBrushWidth] = useState(3);
  const [textColor, setTextColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0]!);
  const [selTick, setSelTick] = useState(0);
  /** Viewport position for Acrobat-style floating text toolbar (fixed px). */
  const [textFloatBar, setTextFloatBar] = useState<{ centerX: number; top: number } | null>(null);
  const setTextFloatBarRef = useRef(setTextFloatBar);
  setTextFloatBarRef.current = setTextFloatBar;
  const computeTextBarPositionRef = useRef<() => void>(() => {});

  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pageRotations, setPageRotations] = useState<Record<string, number>>({});
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.22);
  const [watermarkPosition, setWatermarkPosition] = useState<
    "center" | "diagonal" | "top" | "bottom"
  >("diagonal");
  const [fontSize, setFontSize] = useState(18);
  const [thumbRev, setThumbRev] = useState(0);
  const [exportOk, setExportOk] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [editorDropActive, setEditorDropActive] = useState(false);
  const editorDragDepth = useRef(0);
  const [pdfDocUi, setPdfDocUi] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(
    null,
  );

  const currentOrig = pageOrder[activeIdx] ?? 0;
  const canEditCanvas = numPages > 0 && !busy;

  useEffect(() => {
    const el = centerColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setLayoutWidth(Math.max(320, Math.min(LAYOUT_MAX_W, w - 24)));
    });
    ro.observe(el);
    setLayoutWidth(Math.max(320, Math.min(LAYOUT_MAX_W, el.clientWidth - 24)));
    return () => ro.disconnect();
  }, [numPages]);

  useEffect(() => {
    if (!exportOk) return;
    const t = window.setTimeout(() => setExportOk(false), 6000);
    return () => window.clearTimeout(t);
  }, [exportOk]);

  useEffect(() => {
    setOcrStatus("");
  }, [activeIdx]);

  const persistCurrentFabric = useCallback(() => {
    const c = fabricRef.current;
    const orig = prevOrigRef.current;
    if (c && orig !== null) {
      fabricJsonByPage.current[orig] = fabricSnapshot(c);
    }
  }, []);

  const pushUndo = useCallback(() => {
    if (fabricLoadingRef.current) return;
    const c = fabricRef.current;
    const orig = prevOrigRef.current;
    if (!c || orig === null) return;
    const snap = fabricSnapshot(c);
    const u = undoByPage.current[orig] ?? [];
    u.push(snap);
    if (u.length > 60) u.shift();
    undoByPage.current[orig] = u;
    redoByPage.current[orig] = [];
  }, []);

  const bumpSelection = useCallback(() => setSelTick((t) => t + 1), []);

  const computeTextFloatBar = useCallback(() => {
    const c = fabricRef.current;
    if (!c) {
      setTextFloatBarRef.current(null);
      return;
    }
    const o = c.getActiveObject();
    const t = (o as { type?: string })?.type;
    if (!o || t !== "textbox") {
      setTextFloatBarRef.current(null);
      return;
    }
    const rect = o.getBoundingRect();
    const upper = c.upperCanvasEl;
    if (!upper) {
      setTextFloatBarRef.current(null);
      return;
    }
    const cr = upper.getBoundingClientRect();
    const cw = c.width || 1;
    const ch = c.height || 1;
    const scaleX = cr.width / cw;
    const scaleY = cr.height / ch;
    const centerX = cr.left + (rect.left + rect.width / 2) * scaleX;
    const top = cr.top + rect.top * scaleY;
    setTextFloatBarRef.current({ centerX, top: top - 46 });
  }, []);
  computeTextBarPositionRef.current = computeTextFloatBar;

  const onFloatBarAction = useCallback(
    (action: TextBarAction) => {
      void (async () => {
        const { Textbox } = await import("fabric");
        const c = fabricRef.current;
        if (!c) return;
        const o = c.getActiveObject();
        if (!(o instanceof Textbox)) return;
        switch (action) {
          case "underline":
            o.set("underline", !o.underline);
            break;
          case "strikethrough":
            o.set("linethrough", !o.linethrough);
            break;
          case "alignLeft":
            o.set("textAlign", "left");
            break;
          case "alignCenter":
            o.set("textAlign", "center");
            break;
          case "alignRight":
            o.set("textAlign", "right");
            break;
          case "lineTight":
            o.set("lineHeight", Math.max(0.72, Number(o.lineHeight ?? 1.2) - 0.12));
            break;
          case "lineLoose":
            o.set("lineHeight", Math.min(2.35, Number(o.lineHeight ?? 1.2) + 0.12));
            break;
          default:
            break;
        }
        c.requestRenderAll();
        pushUndo();
        computeTextFloatBar();
      })();
    },
    [pushUndo, computeTextFloatBar],
  );

  const onFloatBarFontFamily = useCallback(
    (f: string) => {
      setFontFamily(f);
      void (async () => {
        const { Textbox } = await import("fabric");
        const c = fabricRef.current;
        if (!c) return;
        const o = c.getActiveObject();
        if (!(o instanceof Textbox)) return;
        o.set("fontFamily", f);
        c.requestRenderAll();
        pushUndo();
        bumpSelection();
        computeTextFloatBar();
      })();
    },
    [pushUndo, computeTextFloatBar, bumpSelection],
  );

  const onFloatBarToggleBold = useCallback(() => {
    void (async () => {
      const { Textbox } = await import("fabric");
      const c = fabricRef.current;
      if (!c) return;
      const o = c.getActiveObject();
      if (!(o instanceof Textbox)) return;
      const w = o.fontWeight;
      const next = w === "bold" || w === 700 || w === "700" ? "normal" : "bold";
      o.set("fontWeight", next);
      c.requestRenderAll();
      pushUndo();
      bumpSelection();
      computeTextFloatBar();
    })();
  }, [pushUndo, bumpSelection, computeTextFloatBar]);

  const onFloatBarToggleItalic = useCallback(() => {
    void (async () => {
      const { Textbox } = await import("fabric");
      const c = fabricRef.current;
      if (!c) return;
      const o = c.getActiveObject();
      if (!(o instanceof Textbox)) return;
      o.set("fontStyle", o.fontStyle === "italic" ? "normal" : "italic");
      c.requestRenderAll();
      pushUndo();
      bumpSelection();
      computeTextFloatBar();
    })();
  }, [pushUndo, bumpSelection, computeTextFloatBar]);

  const onFloatBarFontSize = useCallback(
    (n: number) => {
      const size = Math.max(8, Math.min(96, Math.round(n)));
      setFontSize(size);
      void (async () => {
        const { Textbox } = await import("fabric");
        const c = fabricRef.current;
        if (!c) return;
        const o = c.getActiveObject();
        if (!(o instanceof Textbox)) return;
        o.set("fontSize", size);
        c.requestRenderAll();
        pushUndo();
        bumpSelection();
        computeTextFloatBar();
      })();
    },
    [pushUndo, bumpSelection, computeTextFloatBar],
  );

  const onFloatBarFillColor = useCallback(
    (hex: string) => {
      setTextColor(hex);
      void (async () => {
        const { Textbox } = await import("fabric");
        const c = fabricRef.current;
        if (!c) return;
        const o = c.getActiveObject();
        if (!(o instanceof Textbox)) return;
        o.set("fill", hex);
        c.requestRenderAll();
        pushUndo();
        bumpSelection();
        computeTextFloatBar();
      })();
    },
    [pushUndo, bumpSelection, computeTextFloatBar],
  );

  const applySmoothTextChrome = useCallback((tb: import("fabric").Textbox) => {
    tb.set({ ...FABRIC_TEXTBOX_EDIT_CHROME });
  }, []);

  const tryOpenNativeTextEdit = useCallback(
    async (
      c: FabricCanvasInstance,
      hit: PdfTextHit,
      style: { textColor: string; fontFamily: string },
    ): Promise<boolean> => {
      const fabric = await import("fabric");
      const existing = c
        .getObjects()
        .find((o) => (o as { pdfHitIndex?: number }).pdfHitIndex === hit.hitIndex);
      if (existing && existing instanceof fabric.Textbox) {
        applySmoothTextChrome(existing);
        c.setActiveObject(existing);
        c.requestRenderAll();
        bumpSelection();
        requestAnimationFrame(() => {
          try {
            existing.enterEditing();
            existing.selectAll();
          } catch {
            /* ignore */
          }
          computeTextBarPositionRef.current();
        });
        return true;
      }

      const pad = 4;
      const maskH = Math.max(hit.height + pad * 2, hit.fontSizePx * 1.22 + pad * 2);
      const mask = new fabric.Rect({
        left: hit.left - pad,
        top: hit.top - pad,
        width: hit.width + pad * 2,
        height: maskH,
        fill: "#ffffff",
        strokeWidth: 0,
        selectable: false,
        evented: false,
        objectCaching: false,
      });
      mask.set({ pdfMaskForHit: hit.hitIndex });

      const raw = hit.str.replace(/\r/g, "").replace(/\u00ad/g, "");
      const tb = new fabric.Textbox(raw.length > 0 ? raw : " ", {
        left: hit.left,
        top: hit.top,
        width: Math.max(hit.width + 28, 56),
        fontSize: Math.round(Math.min(96, Math.max(8, hit.fontSizePx))),
        fill: style.textColor,
        fontFamily: hit.fontFamily || style.fontFamily,
        lineHeight: 1.15,
      });
      tb.set({ pdfHitIndex: hit.hitIndex });
      applySmoothTextChrome(tb);

      c.add(mask);
      c.sendObjectToBack(mask);
      c.add(tb);
      c.setActiveObject(tb);
      c.requestRenderAll();
      bumpSelection();
      requestAnimationFrame(() => {
        try {
          tb.enterEditing();
          tb.selectAll();
        } catch {
          /* ignore */
        }
        computeTextBarPositionRef.current();
      });
      return true;
    },
    [bumpSelection, applySmoothTextChrome],
  );

  const removeFabricObjectAndPdfPair = useCallback((c: FabricCanvasInstance, o: import("fabric").FabricObject) => {
    const anyO = o as { pdfHitIndex?: number; pdfMaskForHit?: number };
    const idx = anyO.pdfHitIndex ?? anyO.pdfMaskForHit;
    c.remove(o);
    if (idx !== undefined) {
      const linked = c.getObjects().filter((x) => {
        const a = x as { pdfHitIndex?: number; pdfMaskForHit?: number };
        return a.pdfHitIndex === idx || a.pdfMaskForHit === idx;
      });
      linked.forEach((x) => c.remove(x));
    }
    c.discardActiveObject();
    c.requestRenderAll();
  }, []);

  const renderPdfPage = useCallback(
    async (origIdx: number, fabricW: number, fabricH: number) => {
      const pdf = pdfDocRef.current;
      const pdfCanvas = pdfCanvasRef.current;
      if (!pdf || !pdfCanvas) return;

      const prev = mainPdfRenderTaskRef.current;
      if (prev) {
        prev.cancel();
        try {
          await prev.promise;
        } catch {
          /* ignore */
        }
        mainPdfRenderTaskRef.current = null;
      }

      const page = await pdf.getPage(origIdx + 1);
      const rot = Number(pageRotations[String(origIdx)] ?? pageRotations[origIdx] ?? 0);
      const vp = getEditorPageViewport(page, rot, fabricW, fabricH);
      pdfCanvas.width = Math.floor(vp.width);
      pdfCanvas.height = Math.floor(vp.height);
      const ctx = pdfCanvas.getContext("2d");
      if (!ctx) return;

      const task = page.render({ canvasContext: ctx, viewport: vp });
      mainPdfRenderTaskRef.current = task;
      try {
        await task.promise;
      } catch {
        /* cancelled */
      } finally {
        if (mainPdfRenderTaskRef.current === task) {
          mainPdfRenderTaskRef.current = null;
        }
      }

      dimsByPage.current[origIdx] = { w: pdfCanvas.width, h: pdfCanvas.height };
    },
    [pageRotations],
  );

  useEffect(() => {
    if (!pdfDocRef.current || pageOrder.length === 0) return;
    const orig = pageOrder[activeIdx];
    if (orig === undefined) return;

    let cancelled = false;

    (async () => {
      const { Canvas } = await import("fabric");

      persistCurrentFabric();
      prevOrigRef.current = orig;

      const maxW = layoutWidth;
      const maxH = 900;
      await renderPdfPage(orig, maxW, maxH);
      if (cancelled) return;

      const pdf = pdfDocRef.current;
      if (pdf) {
        const page = await pdf.getPage(orig + 1);
        const rot = Number(pageRotations[String(orig)] ?? pageRotations[orig] ?? 0);
        const vp = getEditorPageViewport(page, rot, maxW, maxH);
        try {
          const hits = await extractPdfTextHits(page, vp);
          if (!cancelled) nativeTextHitsRef.current[orig] = hits;
        } catch {
          if (!cancelled) nativeTextHitsRef.current[orig] = [];
        }
      }

      const pdfCanvas = pdfCanvasRef.current;
      if (!pdfCanvas || !fabricCanvasElRef.current) return;
      const w = pdfCanvas.width;
      const h = pdfCanvas.height;

      let canvas = fabricRef.current;
      if (!canvas) {
        canvas = new Canvas(fabricCanvasElRef.current, {
          width: w,
          height: h,
          backgroundColor: "transparent",
          preserveObjectStacking: true,
        });
        fabricRef.current = canvas;

        let undoTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
        const debouncedPushUndo = () => {
          if (fabricLoadingRef.current) return;
          if (undoTimer !== null) clearTimeout(undoTimer);
          undoTimer = globalThis.setTimeout(() => {
            undoTimer = null;
            if (fabricLoadingRef.current) return;
            pushUndo();
          }, 80);
        };
        canvas.on("object:modified", debouncedPushUndo);
        canvas.on("object:added", debouncedPushUndo);
        canvas.on("object:removed", debouncedPushUndo);
        canvas.on("selection:created", bumpSelection);
        canvas.on("selection:updated", bumpSelection);
        canvas.on("selection:cleared", bumpSelection);

        const barRefresh = () =>
          requestAnimationFrame(() => computeTextBarPositionRef.current());
        canvas.on("object:moving", barRefresh);
        canvas.on("object:scaling", barRefresh);
        canvas.on("object:rotating", barRefresh);
        canvas.on("object:modified", barRefresh);
        canvas.on("text:changed", barRefresh);
        canvas.on("text:editing:entered", barRefresh);
        canvas.on("text:editing:exited", barRefresh);
      } else {
        canvas.setDimensions({ width: w, height: h });
      }

      const raw = fabricJsonByPage.current[orig];
      const json = raw ? (JSON.parse(raw) as object) : { objects: [] as unknown[] };

      fabricLoadingRef.current = true;
      canvas.clear();
      canvas.backgroundColor = "transparent";
      try {
        await canvas.loadFromJSON(json, reviveFabricPdfMeta);
      } catch {
        await canvas.loadFromJSON({ objects: [] }, reviveFabricPdfMeta);
      }
      canvas.renderAll();
      undoByPage.current[orig] = [fabricSnapshot(canvas)];
      redoByPage.current[orig] = [];
      requestAnimationFrame(() => {
        fabricLoadingRef.current = false;
      });
    })();

    return () => {
      cancelled = true;
      mainPdfRenderTaskRef.current?.cancel();
    };
  }, [
    activeIdx,
    pageOrder,
    layoutWidth,
    pageRotations,
    persistCurrentFabric,
    pushUndo,
    renderPdfPage,
    bumpSelection,
  ]);

  useEffect(() => {
    computeTextFloatBar();
  }, [selTick, zoom, activeIdx, computeTextFloatBar]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const h = () => computeTextFloatBar();
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, [computeTextFloatBar]);

  /** Tool mode: drawing vs selection vs shape placement */
  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !canEditCanvas) return;

    void (async () => {
      const fabric = await import("fabric");
      c.isDrawingMode = false;
      // Keep selection on whenever not drawing so PDF text overlays stay movable/deletable.
      c.selection = tool !== "draw" && tool !== "highlight";
      c.defaultCursor =
        tool === "select" ? "default" : tool === "image" ? "copy" : "crosshair";

      if (tool === "draw") {
        const brush = new fabric.PencilBrush(c);
        brush.color = strokeColor;
        brush.width = brushWidth;
        c.freeDrawingBrush = brush;
        c.isDrawingMode = true;
      } else if (tool === "highlight") {
        const brush = new fabric.PencilBrush(c);
        brush.color = "rgba(255, 235, 60, 0.38)";
        brush.width = Math.max(22, brushWidth * 5);
        c.freeDrawingBrush = brush;
        c.isDrawingMode = true;
      }

      c.requestRenderAll();
    })();
  }, [tool, strokeColor, brushWidth, canEditCanvas, activeIdx]);

  /** Canvas click → native PDF text, new text, or shapes */
  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !canEditCanvas) return;
    if (tool === "draw" || tool === "highlight") return;

    const onDown = (...args: unknown[]) => {
      const opt = args[0] as { e?: Event; target?: unknown };
      if (c.isDrawingMode) return;
      if (opt.target) return;
      const e = opt.e as MouseEvent | undefined;
      if (!e) return;
      void (async () => {
        const fabric = await import("fabric");
        const p = c.getScenePoint(e);
        const orig = prevOrigRef.current;

        // Click PDF text layer: works in select/text/shapes (not while drawing or placing image).
        if (orig !== null) {
          const merged = mergeNativeAndOcrHitsForPick(
            nativeTextHitsRef.current[orig] ?? [],
            ocrTextHitsRef.current[orig] ?? [],
          );
          const hit = pickPdfTextHit(p.x, p.y, merged);
          if (hit) {
            await tryOpenNativeTextEdit(c, hit, { textColor, fontFamily });
            return;
          }
        }

        if (tool === "select") return;

        if (tool === "text") {
          const tb = new fabric.Textbox("Text", {
            left: p.x,
            top: p.y,
            width: Math.min(400, c.width! * 0.7),
            fontSize,
            fill: textColor,
            fontFamily,
          });
          applySmoothTextChrome(tb);
          c.add(tb);
          c.setActiveObject(tb);
          c.requestRenderAll();
          bumpSelection();
          requestAnimationFrame(() => {
            try {
              tb.enterEditing();
              tb.selectAll();
            } catch {
              /* ignore */
            }
            computeTextBarPositionRef.current();
          });
          return;
        }

        if (tool === "rect") {
          const r = new fabric.Rect({
            left: p.x - 70,
            top: p.y - 45,
            width: 140,
            height: 90,
            fill: fillColor === "transparent" ? "transparent" : fillColor,
            stroke: strokeColor,
            strokeWidth: 2,
          });
          c.add(r);
          c.setActiveObject(r);
          c.requestRenderAll();
          return;
        }

        if (tool === "circle") {
          const cir = new fabric.Circle({
            left: p.x,
            top: p.y,
            radius: 48,
            originX: "center",
            originY: "center",
            fill: fillColor === "transparent" ? "transparent" : fillColor,
            stroke: strokeColor,
            strokeWidth: 2,
          });
          c.add(cir);
          c.setActiveObject(cir);
          c.requestRenderAll();
          return;
        }

        if (tool === "arrow") {
          const len = 110;
          const x2 = p.x;
          const y2 = p.y;
          const x1 = x2 - len;
          const y1 = y2;
          const line = new fabric.Line([x1, y1, x2, y2], {
            stroke: strokeColor,
            strokeWidth: 3,
          });
          const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          const tri = new fabric.Triangle({
            left: x2,
            top: y2,
            originX: "center",
            originY: "center",
            width: 16,
            height: 20,
            fill: strokeColor,
            angle: ang + 90,
          });
          c.add(line, tri);
          c.setActiveObject(line);
          c.requestRenderAll();
        }
      })();
    };

    c.on("mouse:down", onDown);
    return () => {
      c.off("mouse:down", onDown);
    };
  }, [
    tool,
    canEditCanvas,
    fontSize,
    textColor,
    fontFamily,
    strokeColor,
    fillColor,
    activeIdx,
    tryOpenNativeTextEdit,
    applySmoothTextChrome,
    bumpSelection,
  ]);

  /** Hover highlight + I-beam over detectable PDF text (pdf.js + OCR); stripped from undo/export. */
  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !canEditCanvas) return;

    let raf = 0;

    const runHoverFrame = (opt: { e?: Event; target?: unknown }) => {
      const upper = c.upperCanvasEl;
      if (!upper) return;

      if (c.isDrawingMode) {
        hidePdfTextHoverGuide(c);
        upper.style.cursor = "";
        return;
      }

      const e = opt.e as MouseEvent | undefined;
      if (!e) return;

      const t = toolRef.current;
      if (t === "draw" || t === "highlight") {
        hidePdfTextHoverGuide(c);
        upper.style.cursor = "";
        return;
      }

      if (opt.target) {
        hidePdfTextHoverGuide(c);
        const typ = (opt.target as { type?: string }).type?.toLowerCase();
        upper.style.cursor =
          typ === "textbox" ? "text" : baseCursorForTool(toolRef.current);
        return;
      }

      const p = c.getScenePoint(e);
      const orig = prevOrigRef.current;
      if (orig === null) {
        hidePdfTextHoverGuide(c);
        upper.style.cursor = "";
        return;
      }

      const merged = mergeNativeAndOcrHitsForPick(
        nativeTextHitsRef.current[orig] ?? [],
        ocrTextHitsRef.current[orig] ?? [],
      );
      const hit = pickPdfTextHit(p.x, p.y, merged);

      if (!hit) {
        hidePdfTextHoverGuide(c);
        upper.style.cursor = "";
        return;
      }

      if (isPdfHitClaimedByTextbox(c, hit.hitIndex)) {
        hidePdfTextHoverGuide(c);
        upper.style.cursor = "text";
        return;
      }

      const pad = 5;
      const boxH = Math.max(hit.height + pad * 2, hit.fontSizePx * 1.2 + pad * 2);
      upper.style.cursor = "text";

      void import("fabric").then((fabric) => {
        if (fabricRef.current !== c) return;
        let g = c
          .getObjects()
          .find((o) => (o as { pdfHoverGuide?: boolean }).pdfHoverGuide) as
          | import("fabric").Rect
          | undefined;
        if (!g) {
          g = new fabric.Rect({
            left: hit.left - pad,
            top: hit.top - pad,
            width: hit.width + pad * 2,
            height: boxH,
            fill: "rgba(147, 197, 253, 0.2)",
            stroke: "rgba(56, 189, 248, 0.65)",
            strokeWidth: 1,
            rx: 2,
            ry: 2,
            selectable: false,
            evented: false,
            visible: true,
            objectCaching: false,
          });
          (g as { pdfHoverGuide?: boolean }).pdfHoverGuide = true;
          c.add(g);
        } else {
          const same =
            g.left === hit.left - pad &&
            g.top === hit.top - pad &&
            g.width === hit.width + pad * 2 &&
            g.height === boxH &&
            (g as { visible?: boolean }).visible === true;
          if (!same) {
            g.set({
              left: hit.left - pad,
              top: hit.top - pad,
              width: hit.width + pad * 2,
              height: boxH,
              visible: true,
            });
          }
        }
        c.requestRenderAll();
      });
    };

    const onMove = (...args: unknown[]) => {
      const opt = args[0] as { e?: Event; target?: unknown };
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        runHoverFrame(opt);
      });
    };

    const onOut = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      hidePdfTextHoverGuide(c);
      if (c.upperCanvasEl) c.upperCanvasEl.style.cursor = "";
    };

    c.on("mouse:move", onMove);
    c.on("mouse:out", onOut);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      c.off("mouse:move", onMove);
      c.off("mouse:out", onOut);
      if (c.upperCanvasEl) c.upperCanvasEl.style.cursor = "";
    };
  }, [tool, canEditCanvas, activeIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const t = e.target as HTMLElement;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable)
        return;
      const c = fabricRef.current;
      if (!c) return;
      const o = c.getActiveObject();
      if (o) {
        removeFabricObjectAndPdfPair(c, o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [removeFabricObjectAndPdfPair]);

  const runOcrOnActivePage = useCallback(async () => {
    const orig = pageOrder[activeIdx];
    if (orig === undefined) return;
    const canvas = pdfCanvasRef.current;
    if (!canvas || canvas.width < 8 || canvas.height < 8) {
      setOcrStatus("Wait for the page to finish rendering, then try again.");
      return;
    }
    setOcrBusy(true);
    setOcrStatus("Preparing OCR…");
    try {
      const hits = await extractOcrTextHitsFromCanvas(canvas, (pct, status) => {
        setOcrStatus(`${status} ${pct}%`);
      });
      ocrTextHitsRef.current[orig] = hits;
      setOcrStatus(
        hits.length > 0
          ? `Found ${hits.length} word region(s). Click a word to edit (English).`
          : "No text detected. Try a clearer scan or larger type.",
      );
    } catch {
      setOcrStatus(
        "OCR failed. First run downloads the language model — check your connection and try again.",
      );
    } finally {
      setOcrBusy(false);
    }
  }, [activeIdx, pageOrder]);

  const onPickFile = useCallback(async (f: File | null) => {
    setLoadErr("");
    setOcrStatus("");
    mainPdfRenderTaskRef.current?.cancel();
    mainPdfRenderTaskRef.current = null;
    pdfDocRef.current = null;
    setPdfDocUi(null);
    fabricJsonByPage.current = {};
    nativeTextHitsRef.current = {};
    ocrTextHitsRef.current = {};
    dimsByPage.current = {};
    undoByPage.current = {};
    redoByPage.current = {};
    prevOrigRef.current = null;
    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }
    if (!f) return;
    if (f.size > MAX_PDF_FILE_BYTES) {
      setLoadErr(`File too large (max ${formatBytes(MAX_PDF_FILE_BYTES)}).`);
      return;
    }
    const n = f.name.toLowerCase();
    if (!n.endsWith(".pdf") && f.type !== "application/pdf") {
      setLoadErr("Please upload a PDF file.");
      return;
    }
    pdfFileRef.current = f;
    setFileName(f.name);
    setBusy(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_DIST_VERSION}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise;
      if (doc.numPages > MAX_PAGES) {
        setLoadErr(`This PDF has ${doc.numPages} pages. Max supported here is ${MAX_PAGES}.`);
        return;
      }
      pdfDocRef.current = doc;
      setPdfDocUi(doc);
      setNumPages(doc.numPages);
      setPageOrder(Array.from({ length: doc.numPages }, (_, i) => i));
      setActiveIdx(0);
      setPageRotations({});
      setThumbRev((x) => x + 1);
      // Default to Edit text so the flow matches Acrobat-style “click text to type”.
      setTool("text");
    } catch {
      setLoadErr("Could not read this PDF.");
    } finally {
      setBusy(false);
    }
  }, []);

  const addTextCenter = useCallback(async () => {
    const c = fabricRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    if (!c || !pdfCanvas) return;
    const { Textbox } = await import("fabric");
    const tb = new Textbox("Edit text", {
      left: pdfCanvas.width * 0.08,
      top: pdfCanvas.height * 0.12,
      width: Math.min(420, pdfCanvas.width * 0.75),
      fontSize,
      fill: textColor,
      fontFamily,
    });
    applySmoothTextChrome(tb);
    c.add(tb);
    c.setActiveObject(tb);
    c.requestRenderAll();
    bumpSelection();
    requestAnimationFrame(() => {
      try {
        tb.enterEditing();
        tb.selectAll();
      } catch {
        /* ignore */
      }
      computeTextBarPositionRef.current();
    });
  }, [fontSize, textColor, fontFamily, applySmoothTextChrome, bumpSelection]);

  const applyStyleToSelection = useCallback(
    async (fn: (t: import("fabric").Textbox) => void) => {
      const c = fabricRef.current;
      if (!c) return;
      const { Textbox } = await import("fabric");
      const obj = c.getActiveObject();
      if (obj instanceof Textbox) {
        fn(obj);
        c.requestRenderAll();
        bumpSelection();
      }
    },
    [bumpSelection],
  );

  const onImagePick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0];
      if (!f || !f.type.startsWith("image/")) return;
      const c = fabricRef.current;
      if (!c) return;
      const url = URL.createObjectURL(f);
      void (async () => {
        const { FabricImage } = await import("fabric");
        try {
          const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
          img.scaleToWidth(Math.min(280, c.width! * 0.45));
          img.set({ left: c.width! * 0.2, top: c.height! * 0.15 });
          c.add(img);
          c.setActiveObject(img);
          c.requestRenderAll();
        } catch {
          setLoadErr("Could not load image.");
        } finally {
          URL.revokeObjectURL(url);
        }
      })();
      setTool("select");
    },
    [],
  );

  const rotatePage = useCallback(() => {
    const orig = currentOrig;
    setPageRotations((prev) => {
      const cur = Number(prev[String(orig)] ?? prev[orig] ?? 0);
      const next = ((Math.round(cur / 90) * 90 + 90) % 360) as 0 | 90 | 180 | 270;
      return { ...prev, [String(orig)]: next };
    });
    setThumbRev((x) => x + 1);
  }, [currentOrig]);

  const deletePage = useCallback(() => {
    if (pageOrder.length <= 1) return;
    const next = pageOrder.filter((_, idx) => idx !== activeIdx);
    const nextActive = Math.min(activeIdx, Math.max(0, next.length - 1));
    setPageOrder(next);
    setActiveIdx(nextActive);
    setThumbRev((x) => x + 1);
  }, [activeIdx, pageOrder]);

  const undo = useCallback(() => {
    const c = fabricRef.current;
    const orig = prevOrigRef.current;
    if (!c || orig === null) return;
    const u = undoByPage.current[orig] ?? [];
    if (u.length < 2) return;
    const cur = u.pop()!;
    const prev = u[u.length - 1]!;
    (redoByPage.current[orig] ??= []).push(cur);
    fabricLoadingRef.current = true;
    void c.loadFromJSON(JSON.parse(prev) as object, reviveFabricPdfMeta).then(() => {
      c.renderAll();
      fabricLoadingRef.current = false;
      bumpSelection();
    });
  }, [bumpSelection]);

  const redo = useCallback(() => {
    const c = fabricRef.current;
    const orig = prevOrigRef.current;
    if (!c || orig === null) return;
    const r = redoByPage.current[orig] ?? [];
    if (!r.length) return;
    const snap = r.pop()!;
    (undoByPage.current[orig] ??= []).push(snap);
    fabricLoadingRef.current = true;
    void c.loadFromJSON(JSON.parse(snap) as object, reviveFabricPdfMeta).then(() => {
      c.renderAll();
      fabricLoadingRef.current = false;
      bumpSelection();
    });
  }, [bumpSelection]);

  const deleteSelection = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;
    const o = c.getActiveObject();
    if (!o) return;
    removeFabricObjectAndPdfPair(c, o);
    bumpSelection();
  }, [bumpSelection, removeFabricObjectAndPdfPair]);

  const buildPayloadV2 = useCallback(async (): Promise<PdfEditorPayloadV2> => {
    persistCurrentFabric();
    const uniqueOrigs = [...new Set(pageOrder)];
    const overlays: Record<string, string> = {};
    let totalChars = 0;

    for (const orig of uniqueOrigs) {
      const raw = fabricJsonByPage.current[orig];
      if (!raw) continue;
      const dim = dimsByPage.current[orig];
      if (!dim) continue;
      const b64 = await fabricJsonToPngBase64(raw, dim.w, dim.h, 1500);
      if (b64 && b64.length > 64) {
        overlays[String(orig)] = b64;
        totalChars += b64.length;
        if (totalChars > 12_000_000) {
          throw new Error("Export too large. Remove some drawings or try fewer pages.");
        }
      }
    }

    const wm =
      watermarkText.trim().length > 0
        ? {
            text: watermarkText.trim().slice(0, 120),
            opacity: watermarkOpacity,
            position: watermarkPosition,
          }
        : null;

    return {
      version: 2,
      pageOrder,
      pageRotations,
      pageOverlays: overlays,
      watermark: wm,
    };
  }, [pageOrder, pageRotations, persistCurrentFabric, watermarkOpacity, watermarkPosition, watermarkText]);

  const downloadEdited = useCallback(async () => {
    const f = pdfFileRef.current;
    if (!f) {
      setLoadErr("Upload a PDF first.");
      return;
    }
    setBusy(true);
    setLoadErr("");
    setExportOk(false);
    try {
      persistCurrentFabric();
      const payload = await buildPayloadV2();
      const json = JSON.stringify(payload);
      if (json.length > 14_000_000) {
        throw new Error("Export payload is too large. Reduce annotations or page count.");
      }
      const fd = new FormData();
      const uploadName = /\.pdf$/i.test(f.name)
        ? f.name
        : `${(f.name.replace(/\.[^/.]+$/, "") || "document").replace(/[^\w.\-()+ ]/g, "_")}.pdf`;
      fd.append("file", f, uploadName);
      fd.append("operations", json);
      const res = await fetch("/api/pdf/edit-advanced", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await readApiError(res));
      const blob = await res.blob();
      const base = f.name.replace(/\.pdf$/i, "") || "document";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}-edited.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOk(true);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }, [buildPayloadV2, persistCurrentFabric]);

  const onReorderDrop = useCallback((toListIdx: number) => {
    const from = dragThumb.current?.from;
    dragThumb.current = null;
    if (from === undefined || from === null || from === toListIdx) return;
    setPageOrder((o) => {
      const next = [...o];
      const [moved] = next.splice(from, 1);
      if (moved === undefined) return o;
      next.splice(toListIdx, 0, moved);
      return next;
    });
    setActiveIdx(toListIdx);
    setThumbRev((x) => x + 1);
  }, []);

  const scrollToActivePage = useCallback(() => {
    const id = `editor-page-${activeIdx}`;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  useEffect(() => {
    scrollToActivePage();
  }, [activeIdx, scrollToActivePage]);

  const floatBarFormatting = useMemo(() => {
    if (!textFloatBar) return null;
    const c = fabricRef.current;
    const o = c?.getActiveObject() as import("fabric").Textbox | undefined;
    if (!o || o.type?.toLowerCase() !== "textbox") return null;
    const fw = o.fontWeight;
    return {
      bold: fw === "bold" || fw === 700 || fw === "700",
      italic: o.fontStyle === "italic",
      fontSize: Math.round(Number(o.fontSize ?? 18)),
      fill: typeof o.fill === "string" ? o.fill : "#111827",
    };
  }, [selTick, textFloatBar]);

  const activeObj = fabricRef.current?.getActiveObject();
  void selTick;
  void activeObj;

  return (
    <div className="flex min-h-[78vh] flex-col rounded-xl border border-input-border/80 bg-background shadow-inner">
      {/* Top toolbar */}
      <div className="flex flex-col gap-2 border-b border-input-border/70 bg-surface/50 px-3 py-2 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex flex-wrap items-center gap-1 border-b border-input-border/40 pb-2 lg:border-0 lg:pb-0">
          <span className="mr-1 text-xs font-semibold text-secondary-text/70">Zoom</span>
          <ToolbarBtn
            label="Zoom out"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - 0.1) * 10) / 10))}
          >
            <LuMinus className="h-4 w-4" />
          </ToolbarBtn>
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mx-1 h-2 w-24 accent-primary md:w-32"
            aria-label="Zoom level"
          />
          <ToolbarBtn
            label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + 0.1) * 10) / 10))}
          >
            <LuPlus className="h-4 w-4" />
          </ToolbarBtn>
          <span className="min-w-[3rem] text-xs font-mono text-secondary-text">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="mx-2 hidden h-6 w-px bg-input-border lg:block" />

        <div className="flex flex-wrap items-center gap-1">
          <ToolToggle
            label="Select — move, resize, or delete overlays (PDF text is clickable in other tools too)"
            active={tool === "select"}
            onClick={() => setTool("select")}
            disabled={!canEditCanvas}
          >
            <LuMousePointer2 className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Edit text — click PDF text or canvas; inline typing + floating bar"
            active={tool === "text"}
            onClick={() => setTool("text")}
            disabled={!canEditCanvas}
          >
            <LuType className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Draw"
            active={tool === "draw"}
            onClick={() => setTool("draw")}
            disabled={!canEditCanvas}
          >
            <LuPencil className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Highlight"
            active={tool === "highlight"}
            onClick={() => setTool("highlight")}
            disabled={!canEditCanvas}
          >
            <LuHighlighter className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Rectangle"
            active={tool === "rect"}
            onClick={() => setTool("rect")}
            disabled={!canEditCanvas}
          >
            <LuSquare className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Circle"
            active={tool === "circle"}
            onClick={() => setTool("circle")}
            disabled={!canEditCanvas}
          >
            <LuCircle className="h-4 w-4" />
          </ToolToggle>
          <ToolToggle
            label="Arrow"
            active={tool === "arrow"}
            onClick={() => setTool("arrow")}
            disabled={!canEditCanvas}
          >
            <span className="text-sm font-bold" aria-hidden>
              →
            </span>
          </ToolToggle>
          <ToolToggle
            label="Image"
            active={tool === "image"}
            onClick={() => {
              setTool("image");
              imageInputRef.current?.click();
            }}
            disabled={!canEditCanvas}
          >
            <LuImagePlus className="h-4 w-4" />
          </ToolToggle>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onImagePick(e.target.files)}
          />
        </div>

        <div className="mx-2 hidden h-6 w-px bg-input-border lg:block" />

        <div className="flex flex-wrap items-center gap-1">
          <ToolbarBtn label="Add text box" disabled={!canEditCanvas} onClick={() => void addTextCenter()}>
            <LuType className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Undo" disabled={!canEditCanvas} onClick={undo}>
            <LuUndo2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Redo" disabled={!canEditCanvas} onClick={redo}>
            <LuRedo2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Delete selection" disabled={!canEditCanvas} onClick={deleteSelection}>
            <LuTrash2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Rotate page" disabled={!canEditCanvas} onClick={rotatePage}>
            <LuRotateCwSquare className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Delete page"
            disabled={pageOrder.length <= 1 || !canEditCanvas}
            onClick={deletePage}
          >
            <LuTrash2 className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {busy ? <LuLoaderCircle className="h-5 w-5 animate-spin text-primary" aria-hidden /> : null}
          <button
            type="button"
            disabled={busy || numPages === 0}
            onClick={() => void downloadEdited()}
            className="btn inline-flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <LuDownload className="h-4 w-4" aria-hidden />
            Download PDF
          </button>
        </div>
      </div>

      <div className="border-b border-input-border/40 bg-sky-50/50 px-3 py-2 dark:bg-sky-950/25">
        <p className="text-xs font-medium text-secondary-text/90 md:text-sm">
          Open a PDF → <span className="font-medium text-secondary-text/85">hover</span> detectable text (light blue
          outline + I-beam) → <span className="font-medium text-secondary-text/85">click</span> to edit in place (white
          mask + overlay + floating bar) → <span className="text-primary">Download PDF</span> flattens overlays onto the
          page.
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-secondary-text/75 md:text-xs">
          Text comes from the PDF text layer (pdf.js). Multiple regions stay independent. No text layer? Use the{" "}
          <span className="font-medium text-secondary-text/85">Text</span> tool or{" "}
          <span className="font-medium text-secondary-text/85">OCR</span> (English). Draw / Highlight pause hover
          click-to-edit until you switch tools.
        </p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        {/* Left: thumbnails */}
        <aside className="flex max-h-48 shrink-0 flex-col border-b border-input-border/70 lg:max-h-none lg:w-52 lg:border-r lg:border-b-0 xl:w-56">
          <div className="border-b border-input-border/50 p-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text/70">Pages</p>
            <p className="mt-0.5 text-[11px] text-secondary-text/70">Drag to reorder · Click to jump</p>
          </div>
          <div className="flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
            {pageOrder.length === 0 ? (
              <p className="p-2 text-sm text-secondary-text/80">No PDF</p>
            ) : (
              pageOrder.map((orig, listIdx) => (
                <div
                  key={`${orig}-${listIdx}`}
                  draggable
                  onDragStart={() => {
                    dragThumb.current = { from: listIdx };
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e: DragEvent) => {
                    e.preventDefault();
                    onReorderDrop(listIdx);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIdx(listIdx)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition-colors ${
                      listIdx === activeIdx
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-transparent bg-surface/80 hover:border-input-border"
                    }`}
                  >
                    <PageThumb
                      origIndex={orig}
                      pdfDoc={pdfDocUi}
                      rotation={
                        Number(
                          pageRotations[String(orig)] ?? pageRotations[orig] ?? 0,
                        ) as 0 | 90 | 180 | 270
                      }
                      rev={thumbRev}
                    />
                    <span className="font-mono text-xs">{listIdx + 1}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center: scroll all pages */}
        <div ref={centerColRef} className="relative min-h-[50vh] min-w-0 flex-1 bg-secondary-text/[0.04]">
          <div ref={scrollAreaRef} className="h-full max-h-[calc(100vh-12rem)] overflow-auto p-3 md:p-4 lg:max-h-[calc(100vh-10rem)]">
            {numPages === 0 && busy ? (
              <div className="flex min-h-[200px] items-center justify-center gap-3">
                <LuLoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <span className="text-sm font-medium">Loading PDF…</span>
              </div>
            ) : null}

            {numPages === 0 && !busy ? (
              <div
                className={`mx-auto max-w-lg rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  editorDropActive ? "border-primary bg-primary/5" : "border-input-border bg-surface/40"
                }`}
                onDragEnter={(e: DragEvent) => {
                  e.preventDefault();
                  editorDragDepth.current += 1;
                  setEditorDropActive(true);
                }}
                onDragLeave={(e: DragEvent) => {
                  e.preventDefault();
                  editorDragDepth.current -= 1;
                  if (editorDragDepth.current <= 0) {
                    editorDragDepth.current = 0;
                    setEditorDropActive(false);
                  }
                }}
                onDragOver={(e: DragEvent) => e.preventDefault()}
                onDrop={(e: DragEvent) => {
                  e.preventDefault();
                  editorDragDepth.current = 0;
                  setEditorDropActive(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void onPickFile(f);
                }}
              >
                <label className="flex cursor-pointer flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <span className="text-sm font-semibold">Drop PDF or click to upload</span>
                  <span className="text-xs text-secondary-text/75">
                    Max {formatBytes(MAX_PDF_FILE_BYTES)} · {MAX_PAGES} pages
                  </span>
                </label>
              </div>
            ) : null}

            {fileName ? (
              <p className="mb-3 text-center text-xs text-secondary-text/70">
                {fileName} · {numPages} page{numPages === 1 ? "" : "s"}
              </p>
            ) : null}

            {exportOk ? (
              <p className="mb-3 flex items-start justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                <LuCheck className="mt-0.5 h-4 w-4 shrink-0" />
                Download started — check your browser’s download bar.
              </p>
            ) : null}

            {loadErr ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {loadErr}
              </p>
            ) : null}

            {numPages > 0 && pdfDocUi ? (
              <div
                className="mx-auto flex w-full max-w-[min(100%,920px)] flex-col gap-8 origin-top"
                style={
                  typeof CSS !== "undefined" &&
                  typeof CSS.supports === "function" &&
                  CSS.supports("zoom", "1")
                    ? ({ zoom } as CSSProperties)
                    : {
                        transform: `scale(${zoom})`,
                        transformOrigin: "top center",
                      }
                }
              >
                {pageOrder.map((orig, listIdx) => (
                  <div key={`${orig}-${listIdx}`} id={`editor-page-${listIdx}`} className="scroll-mt-4">
                    {listIdx === activeIdx ? (
                      <div className="rounded-xl border-2 border-primary bg-white p-2 shadow-lg ring-2 ring-primary/20">
                        <p className="mb-2 text-center text-xs font-semibold text-primary">
                          Editing · Page {listIdx + 1}
                        </p>
                        <div className="mb-2 flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            disabled={ocrBusy}
                            onClick={() => void runOcrOnActivePage()}
                            className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-100/90 px-3 py-1.5 text-xs font-semibold text-sky-950 shadow-sm transition-colors hover:bg-sky-200/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/60"
                          >
                            {ocrBusy ? (
                              <>
                                <LuLoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                Running OCR…
                              </>
                            ) : (
                              <>Recognize text (OCR) — scanned pages</>
                            )}
                          </button>
                          {ocrStatus ? (
                            <p className="max-w-md text-center text-[11px] leading-snug text-secondary-text/80">
                              {ocrStatus}
                            </p>
                          ) : null}
                        </div>
                        <div className="relative mx-auto inline-block max-w-full">
                          <canvas
                            ref={pdfCanvasRef}
                            className="pointer-events-none absolute left-0 top-0 max-w-full rounded bg-white"
                          />
                          <canvas
                            ref={fabricCanvasElRef}
                            className="relative z-10 max-w-full rounded"
                          />
                        </div>
                      </div>
                    ) : pdfDocUi ? (
                      <StaticPdfRow
                        pdfDoc={pdfDocUi}
                        origIndex={orig}
                        rotation={Number(
                          pageRotations[String(orig)] ?? pageRotations[orig] ?? 0,
                        )}
                        maxW={layoutWidth}
                        onActivate={() => setActiveIdx(listIdx)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: properties */}
        <aside className="w-full shrink-0 border-t border-input-border/70 bg-surface/30 p-3 lg:w-72 lg:border-l lg:border-t-0 xl:w-80">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-text/70">
            Style & export
          </p>

          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-secondary-text/80">Stroke / pen color</p>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="mt-1 h-9 w-full cursor-pointer rounded border border-input-border"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-secondary-text/80">Shape fill</p>
              <select
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input-border bg-background px-2 py-1.5 text-sm"
              >
                <option value="transparent">Transparent</option>
                <option value="#fef08a">Yellow tint</option>
                <option value="#bfdbfe">Blue tint</option>
                <option value="#fecaca">Red tint</option>
                <option value="#ffffff">White</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-secondary-text/80">Pen width</p>
              <input
                type="range"
                min={1}
                max={16}
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </div>

            <hr className="border-input-border/60" />

            <p className="text-xs font-semibold text-secondary-text">Text (selection)</p>
            <label className="block text-xs text-secondary-text/80">
              Font
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input-border bg-background px-2 py-1.5"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f.split(",")[0]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-secondary-text/80">
              Color
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="mt-1 h-9 w-full cursor-pointer rounded border border-input-border"
              />
            </label>
            <label className="block text-xs text-secondary-text/80">
              Size
              <input
                type="number"
                min={8}
                max={96}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value) || 14)}
                className="mt-1 w-full rounded-lg border border-input-border px-2 py-1.5"
              />
            </label>
            <div className="flex flex-wrap gap-1">
              <MiniBtn
                label="Bold"
                onClick={() =>
                  void applyStyleToSelection((t) => {
                    const w = t.fontWeight;
                    t.set("fontWeight", w === "bold" || w === 700 ? "normal" : "bold");
                  })
                }
              >
                <LuBold className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Italic"
                onClick={() =>
                  void applyStyleToSelection((t) =>
                    t.set("fontStyle", t.fontStyle === "italic" ? "normal" : "italic"),
                  )
                }
              >
                <LuItalic className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Underline"
                onClick={() =>
                  void applyStyleToSelection((t) =>
                    t.set("underline", !t.underline),
                  )
                }
              >
                <LuUnderline className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Align left"
                onClick={() => void applyStyleToSelection((t) => t.set("textAlign", "left"))}
              >
                <LuAlignLeft className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Center"
                onClick={() => void applyStyleToSelection((t) => t.set("textAlign", "center"))}
              >
                <LuAlignCenter className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Align right"
                onClick={() => void applyStyleToSelection((t) => t.set("textAlign", "right"))}
              >
                <LuAlignRight className="h-4 w-4" />
              </MiniBtn>
            </div>
            <div className="flex flex-wrap gap-1">
              <MiniBtn
                label="Heading 1"
                onClick={() =>
                  void applyStyleToSelection((t) => t.set({ fontSize: 32, fontWeight: "bold" }))
                }
              >
                <LuHeading1 className="h-4 w-4" />
              </MiniBtn>
              <MiniBtn
                label="Heading 2"
                onClick={() =>
                  void applyStyleToSelection((t) => t.set({ fontSize: 24, fontWeight: "bold" }))
                }
              >
                <LuHeading2 className="h-4 w-4" />
              </MiniBtn>
            </div>
            <button
              type="button"
              className="w-full rounded-lg border border-input-border py-1.5 text-xs font-semibold hover:border-primary/40"
              onClick={() => void applyStyleToSelection((t) => t.set("fontSize", fontSize))}
            >
              Apply size to selection
            </button>

            {activeObj ? (
              <p className="text-[11px] text-secondary-text/65">
                Selected: {(activeObj as { type?: string }).type ?? "object"}
              </p>
            ) : (
              <p className="text-[11px] text-secondary-text/65">No selection</p>
            )}

            <hr className="border-input-border/60" />

            <p className="text-xs font-semibold text-secondary-text">Watermark</p>
            <input
              type="text"
              className="w-full rounded-lg border border-input-border bg-background px-2 py-1.5 text-sm"
              placeholder="Optional"
              value={watermarkText}
              maxLength={120}
              onChange={(e) => setWatermarkText(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs">
              Opacity
              <input
                type="range"
                min={0.06}
                max={0.45}
                step={0.02}
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
            </label>
            <label className="block text-xs text-secondary-text/80">
              Position
              <select
                value={watermarkPosition}
                onChange={(e) =>
                  setWatermarkPosition(e.target.value as typeof watermarkPosition)
                }
                className="mt-1 w-full rounded-lg border border-input-border bg-background px-2 py-1.5"
              >
                <option value="diagonal">Diagonal (classic)</option>
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </label>
          </div>
        </aside>
      </div>

      <FloatingTextFormatBar
        position={textFloatBar}
        fontFamily={fontFamily}
        fontOptions={FONT_OPTIONS}
        formatting={floatBarFormatting}
        onFontFamily={onFloatBarFontFamily}
        onFontSize={onFloatBarFontSize}
        onFillColor={onFloatBarFillColor}
        onToggleBold={onFloatBarToggleBold}
        onToggleItalic={onFloatBarToggleItalic}
        onAction={onFloatBarAction}
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input-border bg-background text-secondary-text transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ToolToggle({
  children,
  label,
  active,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-secondary-text transition-colors disabled:opacity-40 ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-input-border bg-background hover:border-primary/40"
      }`}
    >
      {children}
    </button>
  );
}

function MiniBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input-border bg-background hover:border-primary/40"
    >
      {children}
    </button>
  );
}

function PageThumb({
  origIndex,
  pdfDoc,
  rotation,
  rev,
}: {
  origIndex: number;
  pdfDoc: import("pdfjs-dist").PDFDocumentProxy | null;
  rotation: 0 | 90 | 180 | 270;
  rev: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);

  useEffect(() => {
    void rev;
    const c = ref.current;
    const pdf = pdfDoc;
    if (!c || !pdf) return;
    let cancelled = false;

    (async () => {
      renderTaskRef.current?.cancel();
      try {
        await renderTaskRef.current?.promise;
      } catch {
        /* ignore */
      }
      renderTaskRef.current = null;

      const page = await pdf.getPage(origIndex + 1);
      const vp = page.getViewport({ scale: 0.14, rotation });
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      const ctx = c.getContext("2d");
      if (!ctx) return;

      const task = page.render({ canvasContext: ctx, viewport: vp });
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch {
        /* cancelled */
      } finally {
        if (renderTaskRef.current === task) renderTaskRef.current = null;
      }
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [origIndex, pdfDoc, rotation, rev]);

  return (
    <canvas
      ref={ref}
      width={40}
      height={52}
      className="rounded border border-input-border/80 bg-white"
    />
  );
}
