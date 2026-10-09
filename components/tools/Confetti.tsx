"use client";

import { useEffect, useRef } from "react";

/** Short center-burst confetti — clears itself; no-op when prefers-reduced-motion. */
export function ToolConfetti({
  fire,
  colors = ["#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"],
}: {
  fire: number;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!fire) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w * 0.5;
    const cy = h * 0.38;
    const parts = Array.from({ length: 48 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      return {
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        w: 3 + Math.random() * 3.5,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
      };
    });

    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, w, h);
      // Fade out in the last third
      ctx.globalAlpha = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;
      for (const p of parts) {
        p.vy += 0.22;
        p.vx *= 0.99;
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
      ctx.globalAlpha = 1;
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    };
  }, [fire, colors]);

  if (!fire) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[45]"
    />
  );
}
