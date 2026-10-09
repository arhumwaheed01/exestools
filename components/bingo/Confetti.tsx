"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rot: number;
  vr: number;
};

function readThemeColors(el: Element | null): string[] {
  if (!el || typeof getComputedStyle === "undefined") {
    return ["#b91c1c", "#15803d", "#1d4ed8", "#be185d", "#f59e0b"];
  }
  const cs = getComputedStyle(el as HTMLElement);
  const band = cs.getPropertyValue("--bc-band").trim() || "#b91c1c";
  const l2 = cs.getPropertyValue("--bc-letter-2").trim() || "#15803d";
  const l3 = cs.getPropertyValue("--bc-letter-3").trim() || "#1d4ed8";
  const l4 = cs.getPropertyValue("--bc-letter-4").trim() || "#be185d";
  const l5 = cs.getPropertyValue("--bc-letter-5").trim() || "#f59e0b";
  return [band, l2, l3, l4, l5];
}

/** Brief paper-like confetti. Self-removes after ~1.6s. */
export function Confetti({
  burst = "line",
  anchor,
  onDone,
}: {
  burst?: "line" | "full";
  /** Element to read theme CSS vars from (e.g. .bingo-card). */
  anchor?: Element | null;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colors = readThemeColors(anchor ?? document.querySelector(".bingo-card"));
    const n = burst === "full" ? 150 : 90;
    const parts: Particle[] = Array.from({ length: n }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      w: 4 + Math.random() * 5,
      h: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
    }));

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of parts) {
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < 1600) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [anchor, burst, onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
