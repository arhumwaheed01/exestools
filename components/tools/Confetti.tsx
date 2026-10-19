"use client";

import { useEffect } from "react";

type ConfettiOptions = {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  disableForReducedMotion?: boolean;
  zIndex?: number;
};

type ConfettiFn = (options?: ConfettiOptions) => Promise<null> | null;

let confettiPromise: Promise<ConfettiFn> | null = null;

function loadConfetti(): Promise<ConfettiFn> {
  if (!confettiPromise) {
    confettiPromise = import("canvas-confetti").then((m) => {
      const mod = m as unknown as { default?: ConfettiFn } & ConfettiFn;
      return (typeof mod.default === "function" ? mod.default : mod) as ConfettiFn;
    });
  }
  return confettiPromise;
}

/** Dual side-bursts (then a smaller follow-up at 300ms). No-op when prefers-reduced-motion. */
export function fireCelebrationConfetti(colors?: string[]) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const palette = colors?.length
    ? colors
    : ["#22d3ee", "#f472b6", "#fbbf24", "#a78bfa", "#34d399", "#fb923c"];

  void loadConfetti().then((confetti) => {
    const common: ConfettiOptions = {
      colors: palette,
      disableForReducedMotion: true,
      zIndex: 60,
    };

    confetti({
      ...common,
      particleCount: 55,
      spread: 62,
      startVelocity: 38,
      origin: { x: 0.12, y: 0.55 },
      angle: 60,
    });
    confetti({
      ...common,
      particleCount: 55,
      spread: 62,
      startVelocity: 38,
      origin: { x: 0.88, y: 0.55 },
      angle: 120,
    });

    window.setTimeout(() => {
      confetti({
        ...common,
        particleCount: 28,
        spread: 70,
        startVelocity: 28,
        origin: { x: 0.5, y: 0.42 },
      });
    }, 300);
  });
}

/** Fires celebration confetti when `fire` increments. */
export function ToolConfetti({
  fire,
  colors,
}: {
  fire: number;
  colors?: string[];
}) {
  useEffect(() => {
    if (!fire) return;
    fireCelebrationConfetti(colors);
  }, [fire, colors]);

  return null;
}
