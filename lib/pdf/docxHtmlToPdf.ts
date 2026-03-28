import { parse, HTMLElement, type Node as HtmlNode, TextNode } from "node-html-parser";
import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFImage,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 50;
const MARGIN_Y = 50;
const BODY_SIZE = 11;
const BODY_LH = BODY_SIZE * 1.35;
/** U+000A — avoid `split(/...` near strings (bundler typo surface). */
const NEWLINE = String.fromCharCode(10);

type LayoutCtx = {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  marginLeft: number;
  marginRight: number;
  pageWidth: number;
  pageHeight: number;
  font: PDFFont;
  fontSize: number;
  lineHeight: number;
};

function maxWidthFor(ctx: LayoutCtx): number {
  return ctx.pageWidth - ctx.marginLeft - ctx.marginRight;
}

function wrapLineToWidth(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        line = word;
      } else {
        let rest = word;
        while (rest.length > 0) {
          let take = rest.length;
          while (take > 0 && font.widthOfTextAtSize(rest.slice(0, take), fontSize) > maxWidth) {
            take--;
          }
          if (take < 1) take = 1;
          lines.push(rest.slice(0, take));
          rest = rest.slice(take);
        }
        line = "";
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function parseDataUri(src: string): { mime: string; data: Uint8Array } | null {
  const m = src.match(/^data:([^;,]+)(;base64)?,(.+)$/i);
  if (!m) return null;
  const mime = m[1].trim().toLowerCase();
  const isBase64 = !!m[2];
  const payload = m[3];
  if (!isBase64) {
    try {
      return { mime, data: new TextEncoder().encode(decodeURIComponent(payload)) };
    } catch {
      return null;
    }
  }
  try {
    return { mime, data: Uint8Array.from(Buffer.from(payload, "base64")) };
  } catch {
    return null;
  }
}

async function tryEmbedImage(
  pdf: PDFDocument,
  bytes: Uint8Array,
  mime: string,
): Promise<PDFImage | null> {
  const base = mime.split(";")[0].trim().toLowerCase();
  if (base === "image/png" || base.endsWith("/png")) {
    try {
      return await pdf.embedPng(bytes);
    } catch {
      return null;
    }
  }
  if (
    base === "image/jpeg" ||
    base === "image/jpg" ||
    base.endsWith("/jpeg") ||
    base.endsWith("/jpg")
  ) {
    try {
      return await pdf.embedJpg(bytes);
    } catch {
      return null;
    }
  }
  try {
    return await pdf.embedPng(bytes);
  } catch {
    try {
      return await pdf.embedJpg(bytes);
    } catch {
      return null;
    }
  }
}

function ensureSpace(ctx: LayoutCtx, blockHeight: number): void {
  if (ctx.y - blockHeight < MARGIN_Y) {
    ctx.page = ctx.pdf.addPage([ctx.pageWidth, ctx.pageHeight]);
    ctx.y = ctx.pageHeight - MARGIN_Y;
  }
}

async function drawImageEl(el: HTMLElement, ctx: LayoutCtx): Promise<number> {
  const src = el.getAttribute("src") || "";
  const parsed = parseDataUri(src);
  if (!parsed) return ctx.y;

  const embedded = await tryEmbedImage(ctx.pdf, parsed.data, parsed.mime);
  if (!embedded) return ctx.y;

  const iw = embedded.width;
  const ih = embedded.height;
  const mw = maxWidthFor(ctx);
  const scale = Math.min(1, mw / iw);
  const dw = iw * scale;
  const dh = ih * scale;
  const gap = 8;
  ensureSpace(ctx, dh + gap);

  ctx.page.drawImage(embedded, {
    x: ctx.marginLeft,
    y: ctx.y - dh,
    width: dw,
    height: dh,
  });
  return ctx.y - dh - gap;
}

function collectPreText(el: HTMLElement): string {
  let s = "";
  for (const c of el.childNodes) {
    if (c instanceof TextNode) s += c.rawText;
    else if (c instanceof HTMLElement) {
      const tag = c.tagName.toLowerCase();
      if (tag === "br") s += "\n";
      else s += collectPreText(c);
    }
  }
  return s;
}

async function withFontSize(
  ctx: LayoutCtx,
  fontSize: number,
  fn: () => Promise<void>,
): Promise<void> {
  const fs = ctx.fontSize;
  const lh = ctx.lineHeight;
  ctx.fontSize = fontSize;
  ctx.lineHeight = fontSize * 1.35;
  await fn();
  ctx.fontSize = fs;
  ctx.lineHeight = lh;
}

async function renderFlow(nodes: HtmlNode[], ctx: LayoutCtx): Promise<void> {
  let line = "";
  const mw = maxWidthFor(ctx);
  const flush = async () => {
    const t = line.trim();
    if (t) {
      ensureSpace(ctx, ctx.lineHeight);
      ctx.page.drawText(t, {
        x: ctx.marginLeft,
        y: ctx.y,
        size: ctx.fontSize,
        font: ctx.font,
        color: rgb(0, 0, 0),
      });
      ctx.y -= ctx.lineHeight;
    }
    line = "";
  };

  const appendWords = async (raw: string) => {
    const normalized = raw.replace(/\s+/g, " ").trim();
    if (!normalized) return;
    const words = normalized.split(" ");
    for (const word of words) {
      if (!word) continue;
      const test = line ? `${line} ${word}` : word;
      if (ctx.font.widthOfTextAtSize(test, ctx.fontSize) <= mw) {
        line = test;
      } else {
        await flush();
        if (ctx.font.widthOfTextAtSize(word, ctx.fontSize) <= mw) {
          line = word;
        } else {
          for (const partial of wrapLineToWidth(word, ctx.font, ctx.fontSize, mw)) {
            ensureSpace(ctx, ctx.lineHeight);
            ctx.page.drawText(partial || " ", {
              x: ctx.marginLeft,
              y: ctx.y,
              size: ctx.fontSize,
              font: ctx.font,
              color: rgb(0, 0, 0),
            });
            ctx.y -= ctx.lineHeight;
          }
        }
      }
    }
  };

  for (const node of nodes) {
    if (node instanceof TextNode) {
      if (!node.isWhitespace) await appendWords(node.text);
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    const tag = node.tagName.toLowerCase();
    if (tag === "br") {
      await flush();
      continue;
    }
    if (tag === "img") {
      await flush();
      ctx.y = await drawImageEl(node, ctx);
      continue;
    }
    if (
      [
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "span",
        "a",
        "mark",
        "small",
        "del",
        "ins",
        "sub",
        "sup",
        "cite",
        "abbr",
      ].includes(tag)
    ) {
      await renderFlow(node.childNodes, ctx);
      continue;
    }
    await flush();
    await dispatchBlock(node, ctx);
  }
  await flush();
}

async function dispatchBlock(node: HtmlNode, ctx: LayoutCtx): Promise<void> {
  if (node instanceof TextNode) {
    if (!node.isWhitespace) await renderFlow([node], ctx);
    return;
  }
  if (!(node instanceof HTMLElement)) return;

  const t = node.tagName.toLowerCase();

  switch (t) {
    case "p":
    case "div":
      await renderFlow(node.childNodes, ctx);
      ctx.y -= BODY_LH * 0.35;
      break;
    case "h1":
      await withFontSize(ctx, 22, async () => {
        await renderFlow(node.childNodes, ctx);
      });
      ctx.y -= BODY_LH * 0.45;
      break;
    case "h2":
      await withFontSize(ctx, 18, async () => {
        await renderFlow(node.childNodes, ctx);
      });
      ctx.y -= BODY_LH * 0.4;
      break;
    case "h3":
      await withFontSize(ctx, 15, async () => {
        await renderFlow(node.childNodes, ctx);
      });
      ctx.y -= BODY_LH * 0.35;
      break;
    case "h4":
    case "h5":
    case "h6":
      await withFontSize(ctx, 13, async () => {
        await renderFlow(node.childNodes, ctx);
      });
      ctx.y -= BODY_LH * 0.3;
      break;
    case "ul": {
      for (const li of node.childNodes) {
        if (!(li instanceof HTMLElement) || li.tagName.toLowerCase() !== "li") continue;
        ensureSpace(ctx, ctx.lineHeight);
        ctx.page.drawText("•", {
          x: ctx.marginLeft,
          y: ctx.y,
          size: ctx.fontSize,
          font: ctx.font,
          color: rgb(0, 0, 0),
        });
        const bulletPad = 14;
        const saved = ctx.marginLeft;
        ctx.marginLeft = saved + bulletPad;
        await renderFlow(li.childNodes, ctx);
        ctx.marginLeft = saved;
        ctx.y -= BODY_LH * 0.2;
      }
      ctx.y -= BODY_LH * 0.15;
      break;
    }
    case "ol": {
      let n = 0;
      for (const li of node.childNodes) {
        if (!(li instanceof HTMLElement) || li.tagName.toLowerCase() !== "li") continue;
        n++;
        const bullet = `${n}. `;
        ensureSpace(ctx, ctx.lineHeight);
        ctx.page.drawText(bullet, {
          x: ctx.marginLeft,
          y: ctx.y,
          size: ctx.fontSize,
          font: ctx.font,
          color: rgb(0, 0, 0),
        });
        const bulletW = ctx.font.widthOfTextAtSize(bullet, ctx.fontSize);
        const saved = ctx.marginLeft;
        ctx.marginLeft = saved + bulletW;
        await renderFlow(li.childNodes, ctx);
        ctx.marginLeft = saved;
        ctx.y -= BODY_LH * 0.2;
      }
      ctx.y -= BODY_LH * 0.15;
      break;
    }
    case "table":
    case "thead":
    case "tbody":
    case "tfoot":
      for (const c of node.childNodes) await dispatchBlock(c, ctx);
      break;
    case "tr":
      for (const c of node.childNodes) {
        if (c instanceof HTMLElement && ["td", "th"].includes(c.tagName.toLowerCase())) {
          await dispatchBlock(c, ctx);
        }
      }
      break;
    case "td":
    case "th":
      await renderFlow(node.childNodes, ctx);
      ctx.y -= BODY_LH * 0.2;
      break;
    case "blockquote": {
      const saved = ctx.marginLeft;
      ctx.marginLeft = saved + 18;
      for (const c of node.childNodes) await dispatchBlock(c, ctx);
      ctx.marginLeft = saved;
      ctx.y -= BODY_LH * 0.25;
      break;
    }
    case "pre": {
      const preFont = await ctx.pdf.embedFont(StandardFonts.Courier);
      const savedFont = ctx.font;
      ctx.font = preFont;
      await withFontSize(ctx, 10, async () => {
        const raw = collectPreText(node);
        const lines = raw.split(NEWLINE);
        const mwPre = maxWidthFor(ctx);
        for (const ln of lines) {
          const chunks = wrapLineToWidth(ln.length ? ln : " ", ctx.font, ctx.fontSize, mwPre);
          for (const ch of chunks) {
            ensureSpace(ctx, ctx.lineHeight);
            ctx.page.drawText(ch || " ", {
              x: ctx.marginLeft,
              y: ctx.y,
              size: ctx.fontSize,
              font: ctx.font,
              color: rgb(0, 0, 0),
            });
            ctx.y -= ctx.lineHeight;
          }
        }
      });
      ctx.font = savedFont;
      ctx.lineHeight = ctx.fontSize * 1.35;
      ctx.y -= BODY_LH * 0.2;
      break;
    }
    case "hr":
      ensureSpace(ctx, 12);
      ctx.page.drawLine({
        start: { x: ctx.marginLeft, y: ctx.y },
        end: { x: ctx.pageWidth - ctx.marginRight, y: ctx.y },
        thickness: 0.5,
        color: rgb(0.75, 0.75, 0.75),
      });
      ctx.y -= 16;
      break;
    case "br":
      ctx.y -= ctx.lineHeight;
      break;
    case "img":
      ctx.y = await drawImageEl(node, ctx);
      break;
    default:
      for (const c of node.childNodes) await dispatchBlock(c, ctx);
  }
}

/**
 * Renders Mammoth HTML (fragment) into a new PDF. Expects inline images as data URIs.
 */
export async function renderMammothHtmlToPdf(html: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const wrapped = `<div data-mammoth-root>${html}</div>`;
  const doc = parse(wrapped);
  const root = doc.querySelector("[data-mammoth-root]");
  if (!root) {
    const empty = await pdf.save({ useObjectStreams: true });
    return empty;
  }

  const ctx: LayoutCtx = {
    pdf,
    page: pdf.addPage([PAGE_W, PAGE_H]),
    y: PAGE_H - MARGIN_Y,
    marginLeft: MARGIN_X,
    marginRight: MARGIN_X,
    pageWidth: PAGE_W,
    pageHeight: PAGE_H,
    font,
    fontSize: BODY_SIZE,
    lineHeight: BODY_LH,
  };

  for (const child of root.childNodes) {
    await dispatchBlock(child, ctx);
  }

  return pdf.save({ useObjectStreams: true });
}
