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
import { SpinControls, StickySpinButton } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { WheelSidePanel, type PanelTab } from "@/components/WheelSidePanel";
import { HistoryRow } from "@/components/tools/HistoryRow";
import { NextStepsInline } from "@/components/tools/NextStepsInline";
import { ResultReveal } from "@/components/tools/ResultReveal";
import { ThemeChips } from "@/components/tools/ThemeChips";
import { ToolConfetti } from "@/components/tools/Confetti";
import { WinnerModal } from "@/components/WinnerModal";
import { YesNoTally } from "@/components/tools/YesNoTally";
import { WheelOverflowMenu } from "@/components/tools/WheelOverflowMenu";
import { EmbedSnippet } from "@/components/embed/EmbedSnippet";
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

const CHOICES_HELP_BASE =
  "Up to 60. Empty lines are ignored. Duplicate lines are skipped (capital letters don't count as different), so add an initial if two people share a name.";

function choicesEditorLabels(toolId: ToolId): { heading: string; helpText: string } {
  switch (toolId) {
    case "home":
      return {
        heading: "Your options",
        helpText: `One option per line, ${CHOICES_HELP_BASE}`,
      };
    case "random-name-picker":
      return {
        heading: "Your names",
        helpText: `One name per line, ${CHOICES_HELP_BASE}`,
      };
    case "classroom-spinner":
      return {
        heading: "Your roster",
        helpText: `One student name per line, ${CHOICES_HELP_BASE}`,
      };
    case "prize-wheel":
      return {
        heading: "Your prizes",
        helpText: `One prize or reward per line, ${CHOICES_HELP_BASE}`,
      };
    case "yes-no-wheel":
      return {
        heading: "Your choices",
        helpText: `One answer or option per line, ${CHOICES_HELP_BASE}`,
      };
    default:
      return {
        heading: "Your choices",
        helpText: `One name or option per line, ${CHOICES_HELP_BASE}`,
      };
  }
}

function listSavedNote(toolId: ToolId): string {
  switch (toolId) {
    case "random-name-picker":
      return "Your names are saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
    case "classroom-spinner":
      return "Your roster is saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
    case "prize-wheel":
      return "Your prize list is saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
    case "yes-no-wheel":
      return "Your options are saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
    case "home":
      return "Your options are saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
    default:
      return "Your list is saved in this browser. Share links carry the list inside the link, so anyone with the link can see it.";
  }
}

export type SpinnerLayout = "classic" | "wheel-first";

type Props = {
  toolId: ToolId;
  /** Legacy ?c= (read-only). */
  initialEncoded?: string | null;
  /** Optional ?preset= allowlisted id. */
  initialPresetQuery?: string | null;
  /** Wheel-first: large wheel + collapsible entries panel (home / name picker). */
  layout?: SpinnerLayout;
};

export function SpinnerWheel({
  toolId,
  initialEncoded = null,
  initialPresetQuery = null,
  layout = "classic",
}: Props) {
  const wheelFirst = layout === "wheel-first";
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
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>("entries");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [embedPanelOpen, setEmbedPanelOpen] = useState(false);
  /** Winner modal: pool size at spin start (not post-remove length). */
  const [pickedFromCount, setPickedFromCount] = useState(0);
  /** Pixel size for wheel-first layout (from ResizeObserver). */
  const [wheelPx, setWheelPx] = useState(0);

  const sound = useSound();
  const spinningRef = useRef(false);
  const spinRef = useRef<() => void>(() => {});
  const showTally = toolId === "yes-no-wheel";
  const editorLabels = useMemo(() => choicesEditorLabels(toolId), [toolId]);
  const savedNote = useMemo(() => listSavedNote(toolId), [toolId]);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const idleRafRef = useRef(0);
  const lastSegRef = useRef(-1);
  const allowSaveRef = useRef(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelBoxRef = useRef<HTMLDivElement>(null);
  const stickySpinRef = useRef<HTMLButtonElement>(null);
  const spinPoolCountRef = useRef(0);

  useEffect(() => {
    if (!wheelFirst) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      if (mq.matches) {
        setPanelOpen(false);
        setMobilePanelOpen(false);
      } else {
        setPanelOpen(true);
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [wheelFirst]);

  // Size the wheel from its flex box on every resize / panel collapse.
  useEffect(() => {
    if (!wheelFirst) return;
    const box = wheelBoxRef.current;
    if (!box) return;

    const measure = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      // Leave room above the square so the teardrop pointer isn't clipped.
      const pointerPad = 14;
      // Cap height on short viewports so Spin + side-panel "Add wheel" stay on-screen.
      const vh = window.innerHeight;
      const shortCap = vh <= 760 ? Math.floor(vh * 0.5) : Math.floor(vh * 0.62);
      const next = mobile
        ? Math.max(0, Math.floor(Math.min(w, vh * 0.4 - pointerPad)))
        : Math.max(0, Math.floor(Math.min(w, h - pointerPad, shortCap)));
      setWheelPx((prev) => (prev === next ? prev : next));
    };

    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(box);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [wheelFirst, panelOpen]);

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

  // Slow continuous idle drift until the user starts a real spin.
  useEffect(() => {
    if (spinning || revealOpen || reduceMotion || choices.length < 2) return;
    let last = performance.now();
    const radPerSec = 0.22;
    const tick = (now: number) => {
      const dt = Math.min(0.064, (now - last) / 1000);
      last = now;
      const next = rotationRef.current + radPerSec * dt;
      rotationRef.current = next;
      setRotation(next);
      idleRafRef.current = requestAnimationFrame(tick);
    };
    idleRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(idleRafRef.current);
  }, [spinning, revealOpen, reduceMotion, choices.length]);

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
      cancelAnimationFrame(idleRafRef.current);
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
      setPickedFromCount(spinPoolCountRef.current || choices.length);
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
    spinPoolCountRef.current = choices.length;
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
    cancelAnimationFrame(idleRafRef.current);
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
      const inField = tag === "TEXTAREA" || tag === "INPUT" || Boolean(t?.isContentEditable);
      if (spinningRef.current) return;

      // Ctrl/Cmd+Enter spins even while editing the list.
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        spinRef.current();
        return;
      }
      if (inField) return;

      if (e.code === "Space" || e.key === " ") {
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

  const onSort = () => {
    if (spinningRef.current) return;
    setText(choicesToText([...choices].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))));
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

  const homeLinks =
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
          { href: "/bingo-card-generator", label: "Bingo card generator" },
        ]
      : undefined;

  const onFreshWheel = () => {
    setText(choicesToText(defaults));
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    setShowNextSteps(false);
    allowSaveRef.current = true;
    setSharedMode(false);
  };

  const sharedBanner = sharedMode ? (
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
  ) : null;

  const toastEl = toast ? (
    <p
      className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg sm:bottom-4"
      role="status"
    >
      {toast}
    </p>
  ) : null;

  const winnerUi =
    toolId !== "prize-wheel" && toolId !== "yes-no-wheel" ? (
      <WinnerModal
        open={revealOpen}
        winner={winner}
        entryCount={pickedFromCount}
        showRemoveContinue={!autoRemove}
        onClose={() => {
          setRevealOpen(false);
          setShowNextSteps(true);
        }}
        onHide={() => {
          setRevealOpen(false);
          setShowNextSteps(false);
        }}
        onSpinAgain={() => {
          setRevealOpen(false);
          setShowNextSteps(false);
          spin();
        }}
        onRemoveWinner={onRemoveWinner}
      />
    ) : (
      <ToolConfetti fire={confettiFire} colors={[...themeColors]} />
    );

  const rootStyle = {
    "--t-accent": themeVars.accent,
    "--t-win": themeVars.win,
  } as CSSProperties;

  const panelProps = {
    tab: panelTab,
    onTab: setPanelTab,
    text,
    entryCount: choices.length,
    resultCount: history.length,
    results: history,
    onClearResults: () => setHistory([]),
    disabled: spinning,
    duplicatesSkipped,
    overLimit,
    heading: editorLabels.heading,
    helpText: editorLabels.helpText,
    raffleHint:
      toolId === "random-name-picker" || toolId === "classroom-spinner" || toolId === "home",
    savedNote,
    onChange: onTextChange,
    onShuffle,
    onSort,
    onClear,
    onRestoreDefaults,
    onCopy: () => void onCopy(),
    onFreshWheel,
    autoRemove,
    onAutoRemove: setAutoRemove,
    showAutoRemove: toolId !== "yes-no-wheel",
    wheelTitle,
    onWheelTitle: setWheelTitle,
    themeChoice,
    onThemeChange,
    presets: toolPresets,
    onPreset,
    homeLinks,
  };

  const livePreview = (
    <p className="sr-only" aria-live="polite">
      {choices.length > 0
        ? `${choices.length} choices on the wheel: ${choices.join(", ")}.`
        : "No choices on the wheel yet."}
    </p>
  );

  if (wheelFirst) {
    return (
      <div className="space-y-2" data-tool-theme={resolvedTheme} style={rootStyle}>
        {livePreview}
        {sharedBanner}
        {/* Fixed stage height — leave room for site header + H1 so "Add wheel" fits at 1280×720. */}
        <div
          className="flex flex-col gap-2 lg:h-[calc(100dvh-13.5rem)] lg:max-h-[calc(100dvh-13.5rem)] lg:min-h-[18rem] lg:flex-row lg:items-stretch lg:gap-0 lg:overflow-hidden"
          ref={stageRef}
        >
          <div
            className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface p-2 sm:p-2.5 ${
              panelOpen ? "lg:rounded-r-none lg:border-r-0" : ""
            }`}
          >
            <div className="absolute left-2 top-2 z-30">
              <WheelOverflowMenu
                disabled={spinning}
                soundEnabled={sound.enabled}
                onToggleSound={() => {
                  sound.unlock();
                  sound.setEnabled(!sound.enabled);
                }}
                spinLength={spinLength}
                onSpinLength={setSpinLength}
                onShare={() => void onShare()}
                shareDisabled={choices.length < 1 || spinning}
                onEmbed={() => setEmbedPanelOpen(true)}
              />
            </div>
            <EmbedSnippet
              toolId={toolId}
              choices={choices}
              disabled={spinning}
              panel={{ open: embedPanelOpen, onClose: () => setEmbedPanelOpen(false) }}
            />

            {wheelTitle ? (
              <p className="mb-0.5 shrink-0 text-center text-sm font-bold text-muted">{wheelTitle}</p>
            ) : null}

            {/* Only this box feeds ResizeObserver — controls/next-steps never steal its height */}
            <div
              ref={wheelBoxRef}
              className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden pt-3"
            >
              {wheelPx > 0 ? (
                <div className="relative shrink-0" style={{ width: wheelPx, height: wheelPx }}>
                  <WheelCanvas
                    choices={choices}
                    rotation={rotation}
                    colors={themeColors}
                    labelColors={themeLabels}
                    highlightIndex={revealOpen ? winnerIndex : null}
                    title={wheelTitle || undefined}
                    hubLabel={spinning ? "…" : ""}
                    spinPrompt={!spinning && !revealOpen && choices.length >= 2}
                    fillContainer
                    className="!max-w-none h-full"
                  />
                  <button
                    type="button"
                    data-et-spin=""
                    onClick={spin}
                    disabled={!canSpin}
                    aria-label="Click To Spin Ctrl+Enter"
                    aria-busy={spinning}
                    className="absolute inset-[12%] z-20 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 disabled:cursor-not-allowed"
                  />
                </div>
              ) : (
                <div className="aspect-square h-full max-h-full w-auto bg-surface-2/30" aria-hidden />
              )}
            </div>

            {/* Fixed-height status row — spin speed & share live in the ⋮ menu */}
            <p
              className="flex h-7 shrink-0 items-center justify-center text-center text-xs text-muted"
              aria-live="polite"
            >
              {status}
            </p>

            {toolId === "prize-wheel" || toolId === "yes-no-wheel" ? (
              <ResultReveal
                open={revealOpen}
                value={winner}
                label={toolId === "prize-wheel" ? "Prize" : "Result"}
                variant={toolId === "prize-wheel" ? "prize" : "yesno"}
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
                }}
                spinBtnRef={stickySpinRef}
              />
            ) : null}
            {showTally ? (
              <YesNoTally choices={choices} tally={tally} onReset={() => setTally({})} />
            ) : null}
          </div>

          <WheelSidePanel
            open={panelOpen}
            onToggle={() => setPanelOpen((v) => !v)}
            {...panelProps}
          />
        </div>

        {/* Mobile sticky SPIN + padding so the bar never covers the wheel */}
        <div className="lg:hidden">
          <StickySpinButton
            canSpin={canSpin}
            spinning={spinning}
            onSpin={spin}
            buttonRef={stickySpinRef}
            alwaysDockMobile
          />
        </div>

        <div className="pb-[4.5rem] lg:pb-0">
          <WheelSidePanel
            open={mobilePanelOpen}
            onToggle={() => setMobilePanelOpen((v) => !v)}
            mobileSheet
            {...panelProps}
          />
        </div>

        <NextStepsInline
          open={showNextSteps && !revealOpen}
          toolId={toolId}
          onClose={() => setShowNextSteps(false)}
          onSpinAgain={() => {
            setShowNextSteps(false);
            spin();
          }}
        />

        {toastEl}
        {winnerUi}
      </div>
    );
  }

  const wheelShellStyle = {
    aspectRatio: "1 / 1",
    width: sharedMode
      ? "min(100%, 300px, calc(100svh - 16rem))"
      : "min(100%, 420px, calc(100svh - 14rem))",
    maxWidth: "420px",
  } as const;

  return (
    <div className="space-y-3" data-tool-theme={resolvedTheme} style={rootStyle}>
      {livePreview}
      {sharedBanner}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-0">
          <div className="relative rounded-3xl border border-border bg-surface p-3 sm:p-5" ref={stageRef}>
            <div className="absolute left-3 top-3 z-30">
              <WheelOverflowMenu
                disabled={spinning}
                soundEnabled={sound.enabled}
                onToggleSound={() => {
                  sound.unlock();
                  sound.setEnabled(!sound.enabled);
                }}
                spinLength={spinLength}
                onSpinLength={setSpinLength}
                onShare={() => void onShare()}
                shareDisabled={choices.length < 1 || spinning}
                onEmbed={() => setEmbedPanelOpen(true)}
              />
            </div>
            <EmbedSnippet
              toolId={toolId}
              choices={choices}
              disabled={spinning}
              panel={{ open: embedPanelOpen, onClose: () => setEmbedPanelOpen(false) }}
            />
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
            {toolId === "prize-wheel" || toolId === "yes-no-wheel" ? (
              <ResultReveal
                open={revealOpen}
                value={winner}
                label={toolId === "prize-wheel" ? "Prize" : "Result"}
                variant={toolId === "prize-wheel" ? "prize" : "yesno"}
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
                }}
                spinBtnRef={stickySpinRef}
              />
            ) : null}
            <HistoryRow
              items={history}
              onClear={() => setHistory([])}
              label={toolId === "classroom-spinner" ? "Picked so far" : undefined}
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
              spinButtonRef={stickySpinRef}
              spinAnchorRef={stageRef}
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
                onClick={onFreshWheel}
                disabled={spinning}
                className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden />
                Fresh wheel
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ChoicesEditor
            text={text}
            count={choices.length}
            disabled={spinning}
            duplicatesSkipped={duplicatesSkipped}
            overLimit={overLimit}
            heading={editorLabels.heading}
            helpText={editorLabels.helpText}
            raffleHint={
              toolId === "random-name-picker" ||
              toolId === "classroom-spinner" ||
              toolId === "home"
            }
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
            {savedNote}{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
          <PresetSelector
            presets={toolPresets}
            disabled={spinning}
            onSelect={onPreset}
            homeLinks={homeLinks}
          />
        </div>
      </div>

      <NextStepsInline
        open={showNextSteps && !revealOpen}
        toolId={toolId}
        onClose={() => setShowNextSteps(false)}
        onSpinAgain={() => {
          setShowNextSteps(false);
          spin();
        }}
      />
      {toastEl}
      {winnerUi}
    </div>
  );
}
