"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { SpinControls } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { ResultReveal } from "@/components/tools/ResultReveal";
import type { EmbedToolSlug } from "@/lib/embed";
import { embedToolId, embedToolLabel } from "@/lib/embed";
import { defaultChoicesForTool } from "@/lib/presets";
import { randomInt } from "@/lib/random";
import { readShareFromLocation } from "@/lib/share-codec";
import { cleanPathFor, defaultAutoRemoveWinner } from "@/lib/tools";
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

type Props = { slug: EmbedToolSlug };

/**
 * Minimal iframe wheel: list from #w= when present, otherwise tool defaults.
 * No site chrome; "Powered by ExesTools" backlink only.
 */
export function EmbedWheel({ slug }: Props) {
  const toolId = embedToolId(slug);
  const title = embedToolLabel(slug);
  const defaults = useMemo(() => defaultChoicesForTool(toolId), [toolId]);
  const reduceMotion = useReducedMotion();
  const sound = useSound();
  const resolvedTheme = resolveToolTheme("auto", toolId);
  const themeColors = useMemo(
    () => Array.from({ length: 8 }, (_, i) => segColor(resolvedTheme, i)),
    [resolvedTheme],
  );
  const themeLabels = useMemo(
    () => Array.from({ length: 8 }, (_, i) => onSegColor(resolvedTheme, i)),
    [resolvedTheme],
  );

  const [text, setText] = useState(() => choicesToText(defaults));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [autoRemove, setAutoRemove] = useState(() => defaultAutoRemoveWinner(toolId));
  const [ready, setReady] = useState(false);
  const [spinLength, setSpinLength] = useState<SpinLength>("normal");

  const spinningRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const lastSegRef = useRef(-1);
  const spinBtnRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { choices } = useMemo(() => parseChoicesWithStats(text), [text]);
  const canSpin = choices.length >= 2 && !spinning;
  const backHref = `${cleanPathFor(toolId)}?ref=embed`;

  const status = useMemo(() => {
    if (spinning) return "Spinning…";
    if (choices.length < 2) return "Need at least 2 options to spin.";
    return `${choices.length} options ready — hit SPIN.`;
  }, [spinning, choices.length]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    const shared = readShareFromLocation();
    if (shared?.choices?.length) {
      setText(choicesToText(shared.choices));
      track("share_open", { toolId, via: "embed_hash" });
    }
    setAutoRemove(defaultAutoRemoveWinner(toolId));
    requestAnimationFrame(() => setReady(true));
    track("embed_view", { toolId, mode: "embed" });
    return () => cancelAnimationFrame(rafRef.current);
  }, [toolId]);

  const finishSpin = useCallback(
    (finalRotation: number) => {
      setRotation(finalRotation);
      const idx = winnerIndexAt(finalRotation, choices.length);
      const name = choices[idx] ?? null;
      setWinner(name);
      setRevealOpen(Boolean(name));
      setSpinning(false);
      sound.chime();
      track("spin", { toolId, count: choices.length, mode: "embed" });
      if (autoRemove && name && toolId !== "yes-no-wheel") {
        setText(choicesToText(choices.filter((c) => c !== name)));
      }
    },
    [choices, autoRemove, toolId, sound],
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

  const wheelShellStyle = {
    aspectRatio: "1 / 1",
    width: "min(100%, 380px, calc(100svh - 12rem))",
    maxWidth: "380px",
  } as const;

  return (
    <div
      className="mx-auto flex min-h-[100svh] max-w-lg flex-col px-3 py-3"
      data-tool-theme={resolvedTheme}
    >
      <header className="mb-2 text-center">
        <h1 className="text-lg font-extrabold text-foreground sm:text-xl">{title}</h1>
      </header>

      <div className="rounded-3xl border border-border bg-surface p-3 sm:p-4" ref={stageRef}>
        <div className="relative mx-auto" style={wheelShellStyle}>
          <div
            className={`absolute inset-0 transition-opacity ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <StaticWheelPreview
              choices={choices.length ? choices : defaults}
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

        <ResultReveal
          open={revealOpen}
          value={winner}
          showRemove={!autoRemove && toolId !== "yes-no-wheel"}
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
          spinBtnRef={spinBtnRef}
        />

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
          spinButtonRef={spinBtnRef}
          spinAnchorRef={stageRef}
        />

        {toolId !== "yes-no-wheel" ? (
          <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={autoRemove}
              onChange={(e) => setAutoRemove(e.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            Remove winner after spin (no repeats)
          </label>
        ) : null}
      </div>

      <p className="mt-auto pt-3 text-center text-xs text-muted">
        Powered by{" "}
        <Link
          href={backHref}
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
