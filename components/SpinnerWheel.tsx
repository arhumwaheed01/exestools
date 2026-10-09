"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { Link2, Share2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { ChoicesEditor } from "@/components/ChoicesEditor";
import { PresetSelector } from "@/components/PresetSelector";
import { RelatedTools } from "@/components/RelatedTools";
import { SpinControls, StickySpinButton } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { HistoryRow } from "@/components/tools/HistoryRow";
import { ResultReveal } from "@/components/tools/ResultReveal";
import { ThemeChips } from "@/components/tools/ThemeChips";
import { ToolConfetti } from "@/components/tools/Confetti";
import { YesNoTally } from "@/components/tools/YesNoTally";
import { encodeShareHash, readShareFromLocation } from "@/lib/share-codec";
import {
  defaultChoicesForTool,
  getPresetById,
  presetsForTool,
  type WheelPreset,
} from "@/lib/presets";
import {
  decodeChoicesParam,
  loadSession,
  saveSession,
} from "@/lib/spinner-storage";
import { randomInt, shuffle } from "@/lib/random";
import { track } from "@/lib/track";
import { cleanPathFor, defaultAutoRemoveWinner, type ToolId } from "@/lib/tools";
import { spinDurationMs, useSound, type SpinLength } from "@/lib/tools/sound";
import {
  loadToolTheme,
  onSegColor,
  resolveToolTheme,
  saveToolTheme,
  segColor,
  segColors,
  type ToolThemeId,
} from "@/lib/tools/theme";
import {
  choicesToText,
  easeOutCubic,
  parseChoicesWithStats,
  targetRotationForIndex,
  winnerIndexAt,
} from "@/lib/wheel";
import "@/app/styles/tools-themes.css";

type Props = {
  toolId: ToolId;
  /** Legacy ?c= (read-only). */
  initialEncoded?: string | null;
  /** Optional ?preset= allowlisted id. */
  initialPresetQuery?: string | null;
};

export function SpinnerWheel({
  toolId,
  initialEncoded = null,
  initialPresetQuery = null,
}: Props) {
  const reduceMotion = useReducedMotion();
  const defaults = useMemo(() => defaultChoicesForTool(toolId), [toolId]);
  const toolPresets = useMemo(() => presetsForTool(toolId), [toolId]);

  const [text, setText] = useState(() => choicesToText(defaults));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [sharedMode, setSharedMode] = useState(false);
  const [autoRemove, setAutoRemove] = useState(() => defaultAutoRemoveWinner(toolId));
  const [ready, setReady] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [themeChoice, setThemeChoice] = useState<ToolThemeId>("auto");
  const [spinLength, setSpinLength] = useState<SpinLength>("normal");
  const [wheelTitle, setWheelTitle] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [confettiFire, setConfettiFire] = useState(0);
  /** Yes/No page only: spin result tallies (session state, not persisted). */
  const [tally, setTally] = useState<Record<string, { label: string; count: number }>>({});

  const sound = useSound();
  const spinningRef = useRef(false);
  const spinRef = useRef<() => void>(() => {});
  const showTally = toolId === "yes-no-wheel";
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const lastSegRef = useRef(-1);
  const allowSaveRef = useRef(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const stickySpinRef = useRef<HTMLButtonElement>(null);

  const resolvedTheme = resolveToolTheme(themeChoice, toolId);
  const themeColors = useMemo(
    () => Array.from({ length: 8 }, (_, i) => segColor(resolvedTheme, i)),
    [resolvedTheme],
  );
  const themeLabels = useMemo(
    () => Array.from({ length: 8 }, (_, i) => onSegColor(resolvedTheme, i)),
    [resolvedTheme],
  );

  const { choices, duplicatesSkipped, overLimit } = useMemo(
    () => parseChoicesWithStats(text),
    [text],
  );
  const canSpin = choices.length >= 2 && !spinning;

  const status = useMemo(() => {
    if (spinning) return "Spinning… good luck!";
    if (choices.length < 2) return "Add at least 2 choices to spin.";
    return `${choices.length} options ready — hit SPIN.`;
  }, [spinning, choices.length]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    setAutoRemove(defaultAutoRemoveWinner(toolId));
    setThemeChoice(loadToolTheme(toolId));

    // Hydrate: #w= → ?preset= → legacy ?c= → localStorage → default
    const fromHash = readShareFromLocation();
    const fromLegacy = initialEncoded ? decodeChoicesParam(initialEncoded) : null;
    const fromPreset =
      initialPresetQuery && getPresetById(initialPresetQuery)
        ? getPresetById(initialPresetQuery)!.choices
        : null;
    const session = loadSession(toolId);

    if (fromHash && fromHash.choices.length >= 1) {
      setText(choicesToText(fromHash.choices));
      setSharedMode(true);
      allowSaveRef.current = false;
      track("share_open", { toolId, via: "hash" });
    } else if (fromLegacy && fromLegacy.length >= 1) {
      setText(choicesToText(fromLegacy));
      setSharedMode(true);
      allowSaveRef.current = false;
      track("share_open", { toolId, via: "legacy_c" });
      // Optional: strip legacy ?c= from the address bar after hydrate (canonical stays clean).
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("c")) {
          url.searchParams.delete("c");
          const qs = url.searchParams.toString();
          window.history.replaceState(
            {},
            "",
            `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`,
          );
        }
      } catch {
        /* ignore */
      }
    } else if (fromPreset && fromPreset.length >= 1) {
      setText(choicesToText(fromPreset));
      allowSaveRef.current = true;
      track("preset_load", { toolId, preset: initialPresetQuery });
    } else if (session?.choices?.length) {
      setText(choicesToText(session.choices));
      allowSaveRef.current = true;
      track("return_visit", { toolId });
    } else {
      setText(choicesToText(defaults));
      allowSaveRef.current = true;
    }

    setHydrated(true);
    // Reveal canvas after first paint of reserved shell
    requestAnimationFrame(() => setReady(true));

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [initialEncoded, initialPresetQuery, toolId, defaults]);

  useEffect(() => {
    if (!hydrated || !allowSaveRef.current) return;
    saveSession(toolId, choices);
  }, [choices, hydrated, toolId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const finishSpin = useCallback(
    (finalRotation: number) => {
      setRotation(finalRotation);
      const idx = winnerIndexAt(finalRotation, choices.length);
      const name = choices[idx] ?? null;
      setWinner(name);
      setWinnerIndex(idx);
      setRevealOpen(Boolean(name));
      setSpinning(false);
      if (toolId === "prize-wheel") {
        sound.fanfare();
      } else {
        sound.chime();
      }
      setConfettiFire((n) => n + 1);
      if (name) setHistory((h) => [name, ...h].slice(0, 5));
      try {
        if (navigator.vibrate && sound.enabled) navigator.vibrate(30);
      } catch {
        /* ignore */
      }
      track("spin", { toolId, count: choices.length });

      if (showTally && name) {
        const key = name.toLocaleLowerCase();
        setTally((prev) => {
          const existing = prev[key];
          return {
            ...prev,
            [key]: { label: existing?.label ?? name, count: (existing?.count ?? 0) + 1 },
          };
        });
      }

      if (autoRemove && name) {
        const next = choices.filter((c) => c !== name);
        setText(choicesToText(next));
      }
    },
    [choices, autoRemove, toolId, showTally, sound],
  );

  const spin = useCallback(() => {
    if (spinningRef.current || choices.length < 2) return;
    sound.unlock();
    if (toolId === "prize-wheel" && !reduceMotion) sound.drumroll(1200);
    setRevealOpen(false);
    setWinner(null);
    setWinnerIndex(null);
    setSpinning(true);
    lastSegRef.current = -1;

    const winnerIdx = randomInt(choices.length);
    const start = rotationRef.current;
    const extra = reduceMotion ? 1 : 5 + randomInt(3);
    const end = targetRotationForIndex(winnerIdx, choices.length, start, extra);
    // Slight overshoot then settle (skipped under reduced motion)
    const overshoot = reduceMotion ? 0 : (4 + randomInt(3)) * (Math.PI / 180);
    const peak = end + overshoot;
    const duration = spinDurationMs(spinLength, Boolean(reduceMotion));
    const settleMs = reduceMotion ? 0 : 250;
    const t0 = performance.now();

    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < duration) {
        const t = Math.min(1, elapsed / duration);
        const e = easeOutCubic(t);
        const next = start + (peak - start) * e;
        setRotation(next);
        const seg = winnerIndexAt(next, choices.length);
        if (seg !== lastSegRef.current) {
          lastSegRef.current = seg;
          sound.tick();
        }
        rafRef.current = requestAnimationFrame(tick);
      } else if (settleMs && elapsed < duration + settleMs) {
        const t = (elapsed - duration) / settleMs;
        const next = peak + (end - peak) * easeOutCubic(Math.min(1, t));
        setRotation(next);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finishSpin(end);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [choices, finishSpin, reduceMotion, sound, spinLength, toolId]);

  spinRef.current = spin;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || t?.isContentEditable) return;
      if (spinningRef.current) return;

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        spinRef.current();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        spinRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTextChange = (raw: string) => {
    if (spinningRef.current) return;
    setText(raw);
    track("entries_edited", { toolId });
  };

  const onShuffle = () => {
    if (spinningRef.current) return;
    setText(choicesToText(shuffle(choices)));
  };

  const onClear = () => {
    if (spinningRef.current) return;
    setText("");
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    setShowNextSteps(false);
    allowSaveRef.current = true;
    showToast("Cleared — add at least 2 choices to spin.");
  };

  const onRestoreDefaults = () => {
    if (spinningRef.current) return;
    setText(choicesToText(defaults));
    setShowNextSteps(false);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Choices copied to clipboard.");
    } catch {
      showToast("Could not copy — check browser permissions.");
    }
  };

  const onPreset = (preset: WheelPreset) => {
    if (spinningRef.current) return;
    setText(choicesToText(preset.choices));
    setRotation(0);
    track("preset_load", { toolId, preset: preset.id });
  };

  const onShare = async () => {
    try {
      const hash = encodeShareHash(choices, toolId);
      const url = `${window.location.origin}${cleanPathFor(toolId)}${hash}`;
      await navigator.clipboard.writeText(url);
      track("share_create", { toolId });
      showToast("Share link copied.");
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "LIST_TOO_LONG"
          ? "List too long to share via URL."
          : "List too long to share, or clipboard blocked.";
      showToast(msg);
    }
  };

  const onRemoveWinner = () => {
    if (!winner) return;
    const next = choices.filter((c) => c !== winner);
    setText(choicesToText(next));
    setRevealOpen(false);
    setWinner(null);
    setWinnerIndex(null);
    setRotation(0);
    setShowNextSteps(true);
  };

  const onThemeChange = (next: ToolThemeId) => {
    setThemeChoice(next);
    saveToolTheme(toolId, next);
  };

  const keepThisWheel = () => {
    allowSaveRef.current = true;
    saveSession(toolId, choices);
    setSharedMode(false);
    showToast("Kept on this device.");
  };

  const backToMyWheel = () => {
    const session = loadSession(toolId);
    setText(choicesToText(session?.choices?.length ? session.choices : defaults));
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    allowSaveRef.current = true;
    setSharedMode(false);
    showToast("Back to your saved wheel.");
  };

  const themeVars = segColors(resolvedTheme);

  const wheelShellStyle = {
    aspectRatio: "1 / 1",
    width: sharedMode
      ? "min(100%, 300px, calc(100svh - 16rem))"
      : "min(100%, 420px, calc(100svh - 14rem))",
    maxWidth: "420px",
  } as const;

  return (
    <div
      className="space-y-3"
      data-tool-theme={resolvedTheme}
      style={
        {
          "--t-accent": themeVars.accent,
          "--t-win": themeVars.win,
        } as CSSProperties
      }
    >
      {sharedMode ? (
        <div
          className="flex max-h-16 flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-surface-2 px-3 py-2 text-xs text-foreground sm:text-sm"
          role="status"
        >
          <p className="min-w-0 flex-1 font-semibold leading-snug">
            You’re viewing a shared wheel. Names stay here unless you keep it.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={keepThisWheel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-accent-strong px-3 text-xs font-bold text-slate-950 hover:bg-accent"
            >
              Keep this wheel
            </button>
            <button
              type="button"
              onClick={backToMyWheel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-xs font-bold text-foreground hover:bg-border"
            >
              Back to my wheel
            </button>
            <button
              type="button"
              onClick={() => setSharedMode(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-xs font-bold text-muted hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-0">
          <div className="rounded-3xl border border-border bg-surface p-3 sm:p-5" ref={stageRef}>
            {wheelTitle ? (
              <p className="mb-2 text-center text-sm font-bold text-muted">{wheelTitle}</p>
            ) : null}
            <div className="relative mx-auto" style={wheelShellStyle}>
              <div
                className={`absolute inset-0 transition-opacity ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
              >
                <StaticWheelPreview
                  choices={choices.length ? choices : defaults}
                  className="!max-w-none h-full"
                />
              </div>
              <div
                className={`absolute inset-0 transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
              >
                <WheelCanvas
                  choices={choices}
                  rotation={rotation}
                  colors={themeColors}
                  labelColors={themeLabels}
                  highlightIndex={revealOpen ? winnerIndex : null}
                  title={wheelTitle || undefined}
                  className="!max-w-none h-full"
                />
              </div>
            </div>
            <ResultReveal
              open={revealOpen}
              value={winner}
              label={
                toolId === "prize-wheel"
                  ? "Prize"
                  : toolId === "yes-no-wheel"
                    ? "Result"
                    : "Winner"
              }
              variant={
                toolId === "prize-wheel"
                  ? "prize"
                  : toolId === "yes-no-wheel"
                    ? "yesno"
                    : "default"
              }
              showRemove={!autoRemove && toolId !== "yes-no-wheel"}
              onSpinAgain={() => {
                setRevealOpen(false);
                setShowNextSteps(false);
                spin();
              }}
              onRemove={onRemoveWinner}
              onShare={() => void onShare()}
              onClose={() => {
                setRevealOpen(false);
                setShowNextSteps(true);
                window.setTimeout(() => stickySpinRef.current?.focus(), 0);
              }}
            />
            <HistoryRow
              items={history}
              onClear={() => setHistory([])}
              label={toolId === "classroom-spinner" ? "Picked so far" : undefined}
            />
            <SpinControls
              hideSpinButton
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
            {showTally ? (
              <YesNoTally choices={choices} tally={tally} onReset={() => setTally({})} />
            ) : null}
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void onShare()}
                disabled={choices.length < 1 || spinning}
                className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                Copy share link
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(choicesToText(defaults));
                  setRotation(0);
                  setWinner(null);
                  setWinnerIndex(null);
                  setRevealOpen(false);
                  setShowNextSteps(false);
                  allowSaveRef.current = true;
                  setSharedMode(false);
                }}
                disabled={spinning}
                className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden />
                Fresh wheel
              </button>
            </div>
            {showNextSteps ? (
              <div className="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-3">
                <p className="text-sm font-semibold text-foreground">
                  Spin again, or try a related spinner below.
                </p>
                <div className="mt-2">
                  <RelatedTools toolId={toolId} compact heading="Next steps" />
                </div>
              </div>
            ) : null}
          </div>
          <StickySpinButton
            placement="inline-desktop"
            canSpin={canSpin}
            spinning={spinning}
            onSpin={spin}
            buttonRef={stickySpinRef}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ChoicesEditor
            text={text}
            count={choices.length}
            disabled={spinning}
            duplicatesSkipped={duplicatesSkipped}
            overLimit={overLimit}
            onChange={onTextChange}
            onShuffle={onShuffle}
            onClear={onClear}
            onRestoreDefaults={onRestoreDefaults}
            onCopy={() => void onCopy()}
          />
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Theme</p>
            <ThemeChips value={themeChoice} onChange={onThemeChange} />
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Wheel title (optional)
            </span>
            <input
              type="text"
              value={wheelTitle}
              onChange={(e) => setWheelTitle(e.target.value.slice(0, 40))}
              disabled={spinning}
              placeholder="e.g. Lunch picker"
              className="min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            />
          </label>
          <p className="text-xs text-muted">
            Your list is saved in this browser. Share links carry the list inside the link, so anyone
            with the link can see it.{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
          <PresetSelector
            presets={toolPresets}
            disabled={spinning}
            onSelect={onPreset}
            homeLinks={
              toolId === "home"
                ? [
                    { href: "/random-name-picker", label: "Name picker" },
                    { href: "/classroom-spinner", label: "Classroom spinner" },
                    { href: "/prize-wheel", label: "Prize wheel" },
                    { href: "/yes-no-wheel", label: "Yes or no wheel" },
                    { href: "/random-team-generator", label: "Team generator" },
                    { href: "/secret-santa-generator", label: "Secret Santa" },
                    { href: "/random-number-wheel", label: "Number wheel" },
                    { href: "/raffle-generator", label: "Raffle generator" },
                    { href: "/bingo-card-generator", label: "Bingo cards" },
                  ]
                : undefined
            }
          />
        </div>
      </div>

      {/* Phone SPIN — fixed to the viewport so it stays while editing entries */}
      <StickySpinButton
        placement="fixed-mobile"
        canSpin={canSpin}
        spinning={spinning}
        onSpin={spin}
        buttonRef={stickySpinRef}
      />

      {toast ? (
        <p
          className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg sm:bottom-4"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <ToolConfetti fire={confettiFire} colors={[...themeColors]} />
    </div>
  );
}
