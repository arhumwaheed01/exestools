"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_KEY = "et:sound";

function loadEnabled(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw === "on") return true;
    if (raw === "off") return false;
    return null;
  } catch {
    return null;
  }
}

function saveEnabled(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

function getCtx(ref: { current: AudioContext | null }): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!ref.current) ref.current = new Ctx();
    if (ref.current.state === "suspended") void ref.current.resume();
    return ref.current;
  } catch {
    return null;
  }
}

/** Web Audio helpers — no files, <3 KB. */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const lastTick = useRef(0);
  const [enabled, setEnabledState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadEnabled();
    if (stored !== null) setEnabledState(stored);
    setReady(true);
  }, []);

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    saveEnabled(on);
  }, []);

  /** Call on first user gesture if preference unset — defaults ON. */
  const unlock = useCallback(() => {
    getCtx(ctxRef);
    if (loadEnabled() === null) {
      setEnabledState(true);
      saveEnabled(true);
    }
  }, []);

  const tick = useCallback(() => {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastTick.current < 25) return;
    lastTick.current = now;
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 1800;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t0 = ctx.currentTime;
      osc.start(t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.004);
      osc.stop(t0 + 0.005);
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const chime = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0.07;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t0 = ctx.currentTime + i * 0.12;
        osc.start(t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
        osc.stop(t0 + 0.15);
      });
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const fanfare = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t0 = ctx.currentTime + i * 0.1;
        osc.start(t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
        osc.stop(t0 + 0.2);
      });
    } catch {
      /* ignore */
    }
  }, [enabled]);

  return { enabled, setEnabled, ready, unlock, tick, chime, fanfare };
}

export type SpinLength = "short" | "normal" | "long";

export function spinDurationMs(length: SpinLength, reduceMotion: boolean): number {
  if (reduceMotion) return 300;
  if (length === "short") return 2200 + Math.random() * 400;
  if (length === "long") return 5500 + Math.random() * 800;
  return 4000 + Math.random() * 900;
}
