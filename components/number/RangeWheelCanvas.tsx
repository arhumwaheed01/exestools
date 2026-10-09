"use client";

import { useEffect, useRef } from "react";
import { formatNumberLabel, labelStep } from "@/lib/range";
import { WHEEL_COLORS, sliceAngle } from "@/lib/wheel";

type Props = {
  pool: number[];
  rotation: number;
  ariaLabel: string;
  className?: string;
  colors?: readonly string[];
};

const MIN_LABEL_DEG = 3;

/** Number-wheel canvas with sparse labels on large ranges. */
export function RangeWheelCanvas({
  pool,
  rotation,
  ariaLabel,
  className = "",
  colors,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const paint = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const css = Math.max(1, Math.floor(wrap.getBoundingClientRect().width) || wrap.clientWidth || 280);
      canvas.style.width = `${css}px`;
      canvas.style.height = `${css}px`;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = css / 2;
      const cy = css / 2;
      const radius = Math.min(cx, cy) - 10;
      const n = pool.length;

      ctx.clearRect(0, 0, css, css);
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      if (n === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#1c2430";
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 16px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Empty", cx, cy);
        return;
      }

      const slice = sliceAngle(n);
      const step = labelStep(n);
      const sliceDeg = 360 / n;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      for (let i = 0; i < n; i++) {
        const start = i * slice - Math.PI / 2;
        const end = start + slice;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        const palette = colors?.length ? colors : WHEEL_COLORS;
        ctx.fillStyle = palette[i % palette.length]!;
        ctx.fill();
        if (n <= 120) {
          ctx.strokeStyle = "rgba(255,255,255,0.45)";
          ctx.lineWidth = n > 60 ? 0.5 : 2;
          ctx.stroke();
        }

        if (sliceDeg >= MIN_LABEL_DEG && (step === 1 || i % step === 0)) {
          const mid = start + slice / 2;
          ctx.save();
          ctx.rotate(mid);
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ffffff";
          const fontSize = Math.max(10, Math.min(18, radius / (n > 10 ? 9 : 7)));
          ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 3;
          ctx.fillText(formatNumberLabel(pool[i]!), radius - 14, 0);
          ctx.restore();
        }
      }
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(22, radius * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0f172a";
      ctx.stroke();
    };

    paint();
    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [pool, rotation, colors]);

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto aspect-square w-full max-w-[min(420px,100%)] ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2"
        aria-hidden
      >
        <div
          className="relative h-0 w-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-cyan-400 drop-shadow-md"
          style={{ marginBottom: -6 }}
        >
          <span className="absolute left-1/2 top-[-6px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_0_3px_#0b0f14]" />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="relative z-[1] block h-full w-full max-w-full drop-shadow-xl"
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  );
}
