"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { SpinControls } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { ResultReveal } from "@/components/tools/ResultReveal";
import {
  classroomEmbedChoices,
  classroomEmbedTitle,
  type ClassroomEmbedSlug,
} from "@/lib/classroom-embed";
import { randomInt } from "@/lib/random";
import { track } from "@/lib/track";
import { spinDurationMs, useSound, type SpinLength } from "@/lib/tools/sound";
import { onSegColor, resolveToolTheme, segColor } from "@/lib/tools/theme";
import {
  choicesToText,
  easeOutCubic,
  parseChoicesWithStats,
  targetRotationForIndex,
  winnerIndexAt,
} from "@/lib/wheel";
import "@/app/styles/tools-themes.css";

type Props = {
  slug: ClassroomEmbedSlug;
};

function sessionKey(slug: ClassroomEmbedSlug) {
  return `exestools.embed.classroom.${slug}`;
}

/**
 * Spin-only classroom embed for Google Sites (By URL → Whole page).
 * Never reads names from path, query, or hash — only the fixed starter preset.
 */
export function ClassroomEmbedWheel({ slug }: Props) {
  const starter = useMemo(() => classroomEmbedChoices(slug), [slug]);
  const title = classroomEmbedTitle(slug);
  const reduceMotion = useReducedMotion();
  const sound = useSound();
  const resolvedTheme = resolveToolTheme("auto", "classroom-spinner");
  const themeColors = useMemo(
    () => Array.from({ length: 8 }, (_, i) => segColor(resolvedTheme, i)),
    [resolvedTheme],
  );
  const themeLabels = useMemo(
    () => Array.from({ length: 8 }, (_, i) => onSegColor(resolvedTheme, i)),
    [resolvedTheme],
  );

  const [text, setText] = useState(() => choicesToText(starter));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [autoRemove, setAutoRemove] = useState(true);
  const [ready, setReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [spinLength, setSpinLength] = useState<SpinLength>("normal");

  const spinningRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const lastSegRef = useRef(-1);

  const { choices } = useMemo(() => parseChoicesWithStats(text), [text]);
  const canSpin = choices.length >= 2 && !spinning;

  const status = useMemo(() => {
    if (spinning) return "Spinning…";
    if (choices.length < 2) return "Fewer than 2 left — reset the starter list to spin again.";
    return `${choices.length} options ready — hit SPIN.`;
  }, [spinning, choices.length]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    // Strip any #w= / query residue from the address bar so nothing looks like a roster URL.
    try {
      const url = new URL(window.location.href);
      if (url.hash || url.search) {
        window.history.replaceState({}, "", url.pathname);
      }
    } catch {
      /* ignore */
    }

    // Restore remove-winner progress for this embed slug only (browser session).
    // Never read share hashes or name query params.
    try {
      const raw = sessionStorage.getItem(sessionKey(slug));
      if (raw) {
        const parsed = JSON.parse(raw) as { choices?: string[]; autoRemove?: boolean };
        if (Array.isArray(parsed.choices) && parsed.choices.length >= 1) {
          setText(choicesToText(parsed.choices));
        }
        if (typeof parsed.autoRemove === "boolean") setAutoRemove(parsed.autoRemove);
      }
    } catch {
      /* ignore */
    }

    setHydrated(true);
    requestAnimationFrame(() => setReady(true));
    track("embed_view", { toolId: "classroom-spinner", preset: slug });

    return () => cancelAnimationFrame(rafRef.current);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(
        sessionKey(slug),
        JSON.stringify({ choices, autoRemove, updatedAt: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }, [choices, autoRemove, hydrated, slug]);

  const finishSpin = useCallback(
    (finalRotation: number) => {
      setRotation(finalRotation);
      const idx = winnerIndexAt(finalRotation, choices.length);
      const name = choices[idx] ?? null;
      setWinner(name);
      setRevealOpen(Boolean(name));
      setSpinning(false);
      sound.chime();
      track("spin", {
        toolId: "classroom-spinner",
        count: choices.length,
        mode: "embed",
        preset: slug,
      });
      if (autoRemove && name) {
        setText(choicesToText(choices.filter((c) => c !== name)));
      }
    },
    [choices, autoRemove, slug, sound],
  );

  const spin = useCallback(() => {
    if (spinningRef.current || choices.length < 2) return;
    sound.unlock();
    setRevealOpen(false);
    setWinner(null);
    setSpinning(true);
    lastSegRef.current = -1;

    const winnerIdx = randomInt(choices.length);
    const start = rotationRef.current;
    const extra = reduceMotion ? 1 : 5 + randomInt(3);
    const end = targetRotationForIndex(winnerIdx, choices.length, start, extra);
    const duration = spinDurationMs(spinLength, Boolean(reduceMotion));
    const t0 = performance.now();

    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOutCubic(t);
      const next = start + (end - start) * e;
      setRotation(next);
      const seg = winnerIndexAt(next, choices.length);
      if (seg !== lastSegRef.current) {
        lastSegRef.current = seg;
        sound.tick();
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finishSpin(end);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [choices, finishSpin, reduceMotion, sound, spinLength]);

  const resetStarter = () => {
    if (spinningRef.current) return;
    setText(choicesToText(starter));
    setRotation(0);
    setWinner(null);
    setRevealOpen(false);
  };

  const wheelShellStyle = {
    aspectRatio: "1 / 1",
    width: "min(100%, 380px, calc(100svh - 12rem))",
    maxWidth: "380px",
  } as const;

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-lg flex-col px-3 py-3" data-tool-theme={resolvedTheme}>
      <header className="mb-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Classroom spinner</p>
        <h1 className="text-lg font-extrabold text-foreground sm:text-xl">{title}</h1>
      </header>

      <div className="rounded-3xl border border-border bg-surface p-3 sm:p-4">
        <div className="relative mx-auto" style={wheelShellStyle}>
          <div
            className={`absolute inset-0 transition-opacity ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <StaticWheelPreview
              choices={choices.length ? choices : starter}
              className="!max-w-none h-full"
            />
          </div>
          <div className={`absolute inset-0 transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}>
            <WheelCanvas
              choices={choices}
              rotation={rotation}
              colors={themeColors}
              labelColors={themeLabels}
              className="!max-w-none h-full"
            />
          </div>
        </div>

        <SpinControls
          canSpin={canSpin}
          spinning={spinning}
          soundEnabled={sound.enabled}
          status={status}
          spinLength={spinLength}
          onSpin={spin}
          onReset={() => {
            if (!spinning) setRotation(0);
          }}
          onToggleSound={() => {
            sound.unlock();
            sound.setEnabled(!sound.enabled);
          }}
          onSpinLength={setSpinLength}
        />

        <ResultReveal
          open={revealOpen}
          value={winner}
          showRemove={!autoRemove}
          onSpinAgain={() => {
            setRevealOpen(false);
            spin();
          }}
          onRemove={() => {
            if (!winner) return;
            setText(choicesToText(choices.filter((c) => c !== winner)));
            setRevealOpen(false);
            setWinner(null);
            setRotation(0);
          }}
          onClose={() => setRevealOpen(false)}
        />

        <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={autoRemove}
            onChange={(e) => setAutoRemove(e.target.checked)}
            className="h-4 w-4 accent-cyan-500"
          />
          Remove winner after spin (no repeats)
        </label>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            disabled={spinning}
            onClick={resetStarter}
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Reset starter list
          </button>
        </div>
      </div>

      <p className="mt-auto pt-3 text-center text-xs text-muted">
        List is fixed for this embed — no paste or share.{" "}
        <Link
          href="/classroom-spinner?ref=embed"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent hover:underline"
        >
          ExesTools
        </Link>
      </p>
    </div>
  );
}
