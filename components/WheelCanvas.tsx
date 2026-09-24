"use client";

import { useEffect, useRef } from "react";
import { truncateLabel, WHEEL_COLORS, sliceAngle } from "@/lib/wheel";

type Props = {
  choices: string[];
  rotation: number;
  className?: string;
};

export function WheelCanvas({ choices, rotation, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const css = Math.min(420, wrap.clientWidth || 420);
      canvas.style.width = `${css}px`;
      canvas.style.height = `${css}px`;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = css;
      const h = css;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 10;
      const n = choices.length;

      ctx.clearRect(0, 0, w, h);

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
        ctx.fillText("Add choices", cx, cy);
        return;
      }

      const slice = sliceAngle(n);
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
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]!;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();

        const mid = start + slice / 2;
        ctx.save();
        ctx.rotate(mid);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        const fontSize = Math.max(11, Math.min(18, radius / (n > 10 ? 9 : 7)));
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 3;
        ctx.fillText(truncateLabel(choices[i]!, n > 14 ? 12 : 16), radius - 14, 0);
        ctx.restore();
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

    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [choices, rotation]);

  return (
    <div ref={wrapRef} className={`relative mx-auto w-full max-w-[420px] ${className}`}>
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
        className="relative z-[1] h-auto w-full drop-shadow-xl"
        role="img"
        aria-label={`Spinner wheel with ${choices.length} choices`}
      />
    </div>
  );
}
