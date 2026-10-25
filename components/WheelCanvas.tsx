"use client";

import { useEffect, useRef, useState } from "react";
import { labelInkForBg } from "@/lib/tools/contrast";
import { normalizeAngle, WHEEL_COLORS, sliceAngle, weightedSliceAngles } from "@/lib/wheel";

type Props = {
  choices: string[];
  rotation: number;
  className?: string;
  colors?: readonly string[];
  labelColors?: readonly string[];
  highlightIndex?: number | null;
  title?: string;
  /** Hub center label (default ET). Use short text — long strings clip. */
  hubLabel?: string;
  /** When true, size to the wrapper (no 420px cap). */
  fillContainer?: boolean;
  /** Curved idle CTA: "Click To Spin" (top) + "Ctrl+Enter" (bottom). */
  spinPrompt?: boolean;
  /** Optional per-slice weights (same length as choices). */
  weights?: readonly number[];
  /** Optional per-slice image data URLs (same length as choices). */
  sliceImages?: readonly (string | null | undefined)[];
};

function lighten(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const n = parseInt(raw, 16);
  const r = Math.min(255, ((n >> 16) & 255) + amount);
  const g = Math.min(255, ((n >> 8) & 255) + amount);
  const b = Math.min(255, (n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darken(hex: string, amount: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const n = parseInt(raw, 16);
  const r = Math.max(0, ((n >> 16) & 255) - amount);
  const g = Math.max(0, ((n >> 8) & 255) - amount);
  const b = Math.max(0, (n & 255) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Draw text along a circle. `flip` makes bottom arcs read left-to-right upright. */
function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  flip: boolean,
) {
  const chars = Array.from(text);
  if (!chars.length) return;

  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const dir = flip ? -1 : 1;
  let angle = centerAngle - dir * (total / 2 / radius);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;

  for (let i = 0; i < chars.length; i++) {
    const w = widths[i]!;
    const a = angle + dir * (w / 2 / radius);
    ctx.save();
    ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    ctx.rotate(a + (flip ? -Math.PI / 2 : Math.PI / 2));
    ctx.fillText(chars[i]!, 0, 0);
    ctx.restore();
    angle += dir * (w / radius);
  }

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawFixedChrome(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  hubLabel: string,
  spinPrompt: boolean,
) {
  const rimOuter = radius + 12;
  const rimInner = radius + 2;
  const rimGrad = ctx.createLinearGradient(cx - rimOuter, cy, cx + rimOuter, cy);
  rimGrad.addColorStop(0, "#b45309");
  rimGrad.addColorStop(0.35, "#fbbf24");
  rimGrad.addColorStop(0.55, "#fde68a");
  rimGrad.addColorStop(0.75, "#f59e0b");
  rimGrad.addColorStop(1, "#92400e");
  ctx.beginPath();
  ctx.arc(cx, cy, rimOuter, 0, Math.PI * 2);
  ctx.arc(cx, cy, rimInner, 0, Math.PI * 2, true);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  const bulbs = 24;
  for (let i = 0; i < bulbs; i++) {
    const a = (i / bulbs) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + Math.cos(a) * (radius + 7);
    const by = cy + Math.sin(a) * (radius + 7);
    const bulb = ctx.createRadialGradient(bx, by, 0, bx, by, 4.5);
    bulb.addColorStop(0, "#fffbeb");
    bulb.addColorStop(0.4, "#fde047");
    bulb.addColorStop(1, "rgba(251,191,36,0)");
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = bulb;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = "#fef08a";
    ctx.fill();
  }

  if (spinPrompt) {
    const fontPx = Math.max(13, Math.min(22, radius * 0.095));
    ctx.font = `800 ${fontPx}px system-ui, sans-serif`;
    const promptR = radius * 0.42;
    drawArcText(ctx, "Click To Spin", cx, cy, promptR, -Math.PI / 2, false);
    drawArcText(ctx, "Ctrl+Enter", cx, cy, promptR, Math.PI / 2, true);
  }

  const hubR = Math.max(22, radius * 0.12);
  if (spinPrompt) {
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(15,23,42,0.15)";
    ctx.stroke();
  } else {
    const hubGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, hubR);
    hubGrad.addColorStop(0, "#1e293b");
    hubGrad.addColorStop(1, "#0b0f17");
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#e2e8f0";
    ctx.stroke();
    const label = hubLabel.trim();
    if (label) {
      ctx.fillStyle = "#e2e8f0";
      const fontPx =
        label.length > 4 ? Math.max(8, hubR * 0.38) : Math.max(10, hubR * 0.7);
      ctx.font = `800 ${fontPx}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx, cy + 1);
    }
  }
}

/**
 * Segments painted once to an offscreen canvas; the visible canvas rotates that
 * bitmap each frame. Rim, bulbs, hub and pointer stay fixed. Always blits after
 * paint (including ResizeObserver) so the glossy wheel shows on first load.
 */
export function WheelCanvas({
  choices,
  rotation,
  className = "",
  colors,
  labelColors,
  highlightIndex = null,
  title,
  hubLabel = "ET",
  fillContainer = false,
  spinPrompt = false,
  weights,
  sliceImages,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef({ css: 420, dpr: 1, radius: 190 });
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;
  const hubLabelRef = useRef(hubLabel);
  hubLabelRef.current = hubLabel;
  const spinPromptRef = useRef(spinPrompt);
  spinPromptRef.current = spinPrompt;
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [, setImgTick] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const palette = colors?.length ? colors : WHEEL_COLORS;
    const labels = labelColors;

    const blit = () => {
      const off = offscreenRef.current;
      const ctx = canvas.getContext("2d");
      if (!off || !ctx) return;

      const { css, dpr, radius } = sizeRef.current;
      const cx = css / 2;
      const cy = css / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, css, css);

      ctx.beginPath();
      ctx.arc(cx, cy + 6, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationRef.current);
      ctx.drawImage(off, -cx, -cy, css, css);
      ctx.restore();

      drawFixedChrome(ctx, cx, cy, radius, hubLabelRef.current, spinPromptRef.current);
    };

    const paintOffscreen = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const css = fillContainer
        ? Math.max(1, wrap.clientWidth || 420)
        : Math.min(420, Math.max(1, wrap.clientWidth || 420));
      // Extra pad so rim + pointer leave room for slice labels near the top.
      const rimPad = 22;
      const radius = css / 2 - rimPad;
      sizeRef.current = { css, dpr, radius };

      canvas.style.width = `${css}px`;
      canvas.style.height = `${css}px`;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);

      if (!offscreenRef.current) offscreenRef.current = document.createElement("canvas");
      const off = offscreenRef.current;
      off.width = Math.round(css * dpr);
      off.height = Math.round(css * dpr);
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = css / 2;
      const cy = css / 2;
      const n = choices.length;
      octx.clearRect(0, 0, css, css);

      if (n === 0) {
        octx.beginPath();
        octx.arc(cx, cy, radius, 0, Math.PI * 2);
        octx.fillStyle = "#1c2430";
        octx.fill();
        // Rim only — no hub — so "Add choices" stays readable in the center.
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const { css: c, dpr: d, radius: r } = sizeRef.current;
          const rcx = c / 2;
          const rcy = c / 2;
          ctx.setTransform(d, 0, 0, d, 0, 0);
          ctx.clearRect(0, 0, c, c);
          ctx.beginPath();
          ctx.arc(rcx, rcy + 6, r + 10, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fill();
          ctx.drawImage(off, 0, 0, c, c);
          // Gold rim without hub disk
          const rimOuter = r + 12;
          const rimInner = r + 2;
          const rimGrad = ctx.createLinearGradient(rcx - rimOuter, rcy, rcx + rimOuter, rcy);
          rimGrad.addColorStop(0, "#b45309");
          rimGrad.addColorStop(0.5, "#fde68a");
          rimGrad.addColorStop(1, "#92400e");
          ctx.beginPath();
          ctx.arc(rcx, rcy, rimOuter, 0, Math.PI * 2);
          ctx.arc(rcx, rcy, rimInner, 0, Math.PI * 2, true);
          ctx.fillStyle = rimGrad;
          ctx.fill();
          ctx.fillStyle = "#94a3b8";
          ctx.font = `600 ${Math.max(14, Math.min(20, r * 0.12))}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Add choices", rcx, rcy);
        }
        return;
      }

      if (n === 1) {
        const base = palette[0]!;
        octx.beginPath();
        octx.arc(cx, cy, radius, 0, Math.PI * 2);
        const grad = octx.createRadialGradient(cx, cy - radius * 0.2, radius * 0.1, cx, cy, radius);
        grad.addColorStop(0, lighten(base, 55));
        grad.addColorStop(0.5, base);
        grad.addColorStop(1, darken(base, 40));
        octx.fillStyle = grad;
        octx.fill();
        // Sample the lightened mid of the gradient where the label sits.
        octx.fillStyle = labelInkForBg(lighten(base, 30));
        const fontSize = Math.max(14, Math.min(22, radius * 0.12));
        octx.font = `700 ${fontSize}px system-ui, sans-serif`;
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        octx.shadowColor = "rgba(0,0,0,0.45)";
        octx.shadowBlur = 3;
        const raw = choices[0]!.trim();
        const maxW = radius * 1.35;
        let display = raw.length > 24 ? raw.slice(0, 24) : raw;
        if (octx.measureText(display).width > maxW) {
          while (
            display.length > 1 &&
            octx.measureText(`${display.slice(0, -1)}…`).width > maxW
          ) {
            display = display.slice(0, -1);
          }
        }
        if (display.length < raw.length) {
          display = `${display.replace(/…$/u, "")}…`;
        }
        octx.fillText(display, cx, cy - radius * 0.35);
        octx.shadowBlur = 0;
        blit();
        return;
      }

      const useWeights = Boolean(weights && weights.length === n);
      const angles = useWeights ? weightedSliceAngles(weights!) : null;
      const equal = sliceAngle(n);
      octx.save();
      octx.translate(cx, cy);

      let angleCursor = -Math.PI / 2;
      for (let i = 0; i < n; i++) {
        const slice = angles ? angles[i]! : equal;
        const start = angleCursor;
        const end = start + slice;
        angleCursor = end;
        const base = palette[i % palette.length]!;
        const mid = start + slice / 2;

        octx.beginPath();
        octx.moveTo(0, 0);
        octx.arc(0, 0, radius, start, end);
        octx.closePath();

        const grad = octx.createRadialGradient(
          Math.cos(mid) * radius * 0.25,
          Math.sin(mid) * radius * 0.25,
          radius * 0.05,
          0,
          0,
          radius,
        );
        grad.addColorStop(0, lighten(base, 55));
        grad.addColorStop(0.45, base);
        grad.addColorStop(1, darken(base, 40));
        octx.fillStyle = grad;
        octx.fill();

        if (highlightIndex === i) {
          octx.strokeStyle = "#ffffff";
          octx.lineWidth = 5;
          octx.shadowColor = base;
          octx.shadowBlur = 18;
          octx.stroke();
          octx.shadowBlur = 0;
        } else {
          octx.strokeStyle = "rgba(255,255,255,0.35)";
          octx.lineWidth = 1.5;
          octx.stroke();
        }

        const imgUrl = sliceImages?.[i];
        if (imgUrl) {
          let img = imageCacheRef.current.get(imgUrl);
          if (!img) {
            img = new Image();
            img.decoding = "async";
            img.onload = () => setImgTick((t) => t + 1);
            img.src = imgUrl;
            imageCacheRef.current.set(imgUrl, img);
          }
          if (img.complete && img.naturalWidth > 0) {
            const imgSize = Math.min(radius * 0.28, Math.max(18, radius * Math.sin(slice / 2) * 0.9));
            const imgR = radius * (n <= 6 ? 0.48 : 0.55);
            octx.save();
            octx.rotate(mid);
            octx.beginPath();
            octx.arc(imgR, 0, imgSize / 2, 0, Math.PI * 2);
            octx.closePath();
            octx.clip();
            octx.drawImage(img, imgR - imgSize / 2, -imgSize / 2, imgSize, imgSize);
            octx.restore();
          }
        }

        const world = normalizeAngle(mid);
        const flip = world > Math.PI / 2 && world < (Math.PI * 3) / 2;
        const hasImg = Boolean(imgUrl);
        // Keep labels inside the rim: radial half-width must fit (radius - labelR).
        const rimPad = 8;
        const labelR = hasImg
          ? radius * 0.78
          : radius * (n <= 6 ? 0.56 : 0.58);
        const chordMax = Math.max(
          24,
          2 * labelR * Math.sin(Math.min(slice, equal) / 2) * 0.82,
        );
        const radialMax = Math.max(20, 2 * (radius - rimPad - labelR));
        const maxW = Math.min(chordMax, radialMax);

        octx.save();
        octx.rotate(mid);
        if (flip) octx.rotate(Math.PI);
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        // Ink from the lightened zone under the label (not the raw swatch).
        octx.fillStyle = labelInkForBg(lighten(base, 30));
        octx.shadowColor = "rgba(0,0,0,0.45)";
        octx.shadowBlur = 3;

        const raw = choices[i]!.trim();
        const x = flip ? -labelR : labelR;
        const shortLabel = raw.length <= 2;

        if (shortLabel) {
          // A–F style labels: keep them large like short names.
          const fontSize = Math.max(14, Math.min(26, radius / (n > 10 ? 5.5 : 4.5)));
          octx.font = `700 ${fontSize}px system-ui, sans-serif`;
          octx.fillText(raw, x, 0);
        } else {
          // Prefer a readable size; fit by truncating with "…" (never shrink to ~9px).
          const minPx = 12;
          const fontSize = Math.min(
            hasImg ? 15 : 16,
            Math.max(minPx, radius / (n > 10 ? 6.2 : 5.4)),
          );
          octx.font = `700 ${fontSize}px system-ui, sans-serif`;

          const softCap = n <= 4 ? 16 : n <= 8 ? 12 : 9;
          let display = raw.length > softCap ? raw.slice(0, softCap) : raw;
          if (octx.measureText(display).width > maxW) {
            while (
              display.length > 1 &&
              octx.measureText(`${display.slice(0, -1)}…`).width > maxW
            ) {
              display = display.slice(0, -1);
            }
          }
          if (display.length < raw.length) {
            display = `${display.replace(/…$/u, "")}…`;
          }
          octx.fillText(display, x, 0);
        }
        octx.restore();
      }
      octx.restore();
      blit();
    };

    paintOffscreen();
    const ro = new ResizeObserver(() => paintOffscreen());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [choices, colors, labelColors, highlightIndex, hubLabel, fillContainer, spinPrompt, weights, sliceImages]);

  // Re-blit when rotation changes during a spin (disk already painted).
  useEffect(() => {
    const canvas = canvasRef.current;
    const off = offscreenRef.current;
    if (!canvas || !off) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { css, dpr, radius } = sizeRef.current;
    if (css < 2) return;
    const cx = css / 2;
    const cy = css / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, css, css);

    ctx.beginPath();
    ctx.arc(cx, cy + 6, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.drawImage(off, -cx, -cy, css, css);
    ctx.restore();

    drawFixedChrome(ctx, cx, cy, radius, hubLabel, spinPrompt);
  }, [rotation, hubLabel, spinPrompt]);

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto aspect-square h-full w-full ${fillContainer ? "max-w-none" : "max-w-[420px]"} ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {title ? (
        <p className="pointer-events-none absolute left-0 right-0 top-2 z-10 text-center text-sm font-bold text-foreground">
          {title}
        </p>
      ) : null}
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
        aria-hidden
      >
        <svg width="36" height="48" viewBox="0 0 36 48" className="drop-shadow-lg">
          <defs>
            <linearGradient id="et-ptr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <path
            d="M18 46 C18 46 4 28 4 16 C4 7.7 10.3 2 18 2 C25.7 2 32 7.7 32 16 C32 28 18 46 18 46 Z"
            fill="url(#et-ptr)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="16" r="5" fill="#22d3ee" stroke="#0b0f17" strokeWidth="2" />
        </svg>
      </div>
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        className="relative z-[1] block h-full w-full"
        role="img"
        aria-label={`Spinner wheel with ${choices.length} choices`}
      />
    </div>
  );
}
