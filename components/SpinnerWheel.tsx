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
import { AdvancedEntriesDialog } from "@/components/wheel-v2/AdvancedEntriesDialog";
import { CustomizeDialog } from "@/components/wheel-v2/CustomizeDialog";
import { WheelTopBar } from "@/components/wheel-v2/WheelTopBar";
import {
  fileToResizedDataUrl,
  loadWheelImages,
  saveWheelImages,
  type WheelImages,
} from "@/lib/wheel-v2/images";
import { EmbedSnippet } from "@/components/embed/EmbedSnippet";
import { encodeShareHash, readShareFromLocation } from "@/lib/share-codec";
import {
  autosaveLastWheel,
  DEFAULT_WHEEL_V2_SETTINGS,
  loadEntryWeights,
  loadRecentWheels,
  loadWheelSettings,
  normalizeSettings,
  normalizeWeights,
  deleteRecentWheel,
  pushRecentWheel,
  saveEntryWeights,
  saveWheelSettings,
  settingsForShare,
  spinMsFromSettings,
  type SavedWheelFile,
  type WheelV2Settings,
} from "@/lib/wheel-v2/settings";
import { isToolThemeId } from "@/lib/tools/theme";
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
import { labelInkForBg } from "@/lib/tools/contrast";
import {
  loadToolTheme,
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
  pickWeightedIndex,
  targetRotationForIndex,
  winnerIndexAt,
} from "@/lib/wheel";
import { parseCsvEntries } from "@/lib/wheel-v2/portal";
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
  const [v2Settings, setV2Settings] = useState<WheelV2Settings>(() =>
    typeof window === "undefined"
      ? loadWheelSettings(toolId)
      : loadWheelSettings(toolId),
  );
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shareUrlBox, setShareUrlBox] = useState<string | null>(null);
  const [recentWheels, setRecentWheels] = useState<SavedWheelFile[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoBundle, setUndoBundle] = useState<{
    text: string;
    settings: WheelV2Settings;
    title: string;
  } | null>(null);
  const [wheelImages, setWheelImages] = useState<WheelImages>({
    background: null,
    center: null,
    entries: {},
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  /** Per-entry weights keyed by lowercased name — never rewrite the text list. */
  const [entryWeights, setEntryWeights] = useState<Record<string, number>>({});
  const [hasSpunOnce, setHasSpunOnce] = useState(false);
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
      // Leave room above the square so the teardrop pointer + top labels aren't clipped.
      const pointerPad = 28;
      // Cap height on short viewports so Spin stays on-screen.
      const vh = window.innerHeight;
      const shortCap = vh <= 760 ? Math.floor(vh * 0.4) : Math.floor(vh * 0.54);
      const next = mobile
        ? Math.max(0, Math.floor(Math.min(w - 8, vh * 0.48 - pointerPad)))
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

  const resolvedTheme = resolveToolTheme(
    isToolThemeId(v2Settings.themeId) ? v2Settings.themeId : themeChoice,
    toolId,
  );
  const themeColors = useMemo(
    () =>
      Array.from(
        { length: 8 },
        (_, i) => v2Settings.swatches[i % v2Settings.swatches.length] ?? segColor(resolvedTheme, i),
      ),
    [resolvedTheme, v2Settings.swatches],
  );
  const themeLabels = useMemo(
    () => themeColors.map((c) => labelInkForBg(c)),
    [themeColors],
  );

  const { choices, duplicatesSkipped, overLimit } = useMemo(
    () =>
      parseChoicesWithStats(text, {
        allowDuplicates: v2Settings.displayDuplicates,
        max: v2Settings.maxNamesVisible,
      }),
    [text, v2Settings.displayDuplicates, v2Settings.maxNamesVisible],
  );
  const canSpin = choices.length >= 2 && !spinning;

  const choiceWeights = useMemo(
    () => choices.map((c) => entryWeights[c.toLocaleLowerCase()] ?? 1),
    [choices, entryWeights],
  );

  const weightsActive = useMemo(
    () => choiceWeights.some((w) => Math.abs(w - 1) > 0.001),
    [choiceWeights],
  );

  const sliceImages = useMemo(
    () => choices.map((c) => wheelImages.entries[c.toLocaleLowerCase()] ?? null),
    [choices, wheelImages.entries],
  );

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

  // Slow idle drift only before the first real spin — hold the winner after that.
  useEffect(() => {
    if (spinning || revealOpen || reduceMotion || choices.length < 2 || hasSpunOnce) {
      return;
    }
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
  }, [spinning, revealOpen, reduceMotion, choices.length, hasSpunOnce]);

  useEffect(() => {
    setThemeChoice(loadToolTheme(toolId));

    // Hydrate: #w= → ?preset= → legacy ?c= → localStorage → default
    const fromHash = readShareFromLocation();
    const fromLegacy = initialEncoded ? decodeChoicesParam(initialEncoded) : null;
    const fromPreset =
      initialPresetQuery && getPresetById(initialPresetQuery)
        ? getPresetById(initialPresetQuery)!.choices
        : null;
    const session = loadSession(toolId);

    setAutoRemove(
      typeof session?.autoRemove === "boolean"
        ? session.autoRemove
        : defaultAutoRemoveWinner(toolId),
    );
    setV2Settings(loadWheelSettings(toolId));
    setRecentWheels(loadRecentWheels(toolId));
    setWheelImages(loadWheelImages(toolId));
    setEntryWeights(loadEntryWeights(toolId));

    if (fromHash && fromHash.choices.length >= 1) {
      setText(choicesToText(fromHash.choices));
      if (fromHash.extra?.settings) {
        const sharedSettings = normalizeSettings(fromHash.extra.settings);
        setV2Settings(sharedSettings);
      }
      if (fromHash.extra?.weights) {
        setEntryWeights(normalizeWeights(fromHash.extra.weights));
      }
      if (typeof fromHash.extra?.title === "string") {
        setWheelTitle(fromHash.extra.title.slice(0, 40));
      }
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
    saveSession(toolId, choices, { autoRemove });
  }, [choices, autoRemove, hydrated, toolId]);

  useEffect(() => {
    if (!hydrated) return;
    saveWheelSettings(toolId, v2Settings);
    if (isToolThemeId(v2Settings.themeId) && v2Settings.themeId !== "auto") {
      setThemeChoice(v2Settings.themeId);
      saveToolTheme(toolId, v2Settings.themeId);
    }
  }, [v2Settings, toolId, hydrated]);

  useEffect(() => {
    if (!hydrated || !allowSaveRef.current) return;
    autosaveLastWheel(toolId, {
      title: wheelTitle,
      choices,
      settings: v2Settings,
      weights: entryWeights,
    });
  }, [choices, wheelTitle, v2Settings, entryWeights, hydrated, toolId]);

  useEffect(() => {
    if (!hydrated) return;
    saveEntryWeights(toolId, entryWeights);
  }, [entryWeights, toolId, hydrated]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const finishSpin = useCallback(
    (finalRotation: number) => {
      setRotation(finalRotation);
      const weights = choices.map((c) => entryWeights[c.toLocaleLowerCase()] ?? 1);
      const idx = winnerIndexAt(finalRotation, choices.length, weights);
      const name = choices[idx] ?? null;
      setWinner(name);
      setWinnerIndex(idx);
      setPickedFromCount(spinPoolCountRef.current || choices.length);
      setRevealOpen(Boolean(name));
      setSpinning(false);
      setHasSpunOnce(true);
      if (toolId === "prize-wheel") {
        sound.fanfare();
      } else {
        sound.chime();
      }
      if (v2Settings.confetti) setConfettiFire((n) => n + 1);
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
      } else if (v2Settings.autoRemoveAfterSec > 0 && name) {
        window.setTimeout(() => {
          setText((prev) => {
            const list = parseChoicesWithStats(prev, {
              allowDuplicates: v2Settings.displayDuplicates,
              max: v2Settings.maxNamesVisible,
            }).choices;
            return choicesToText(list.filter((c) => c !== name));
          });
          setRevealOpen(false);
          setWinner(null);
          setWinnerIndex(null);
        }, v2Settings.autoRemoveAfterSec * 1000);
      }
    },
    [choices, entryWeights, autoRemove, toolId, showTally, sound, v2Settings],
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

    const winnerIdx = pickWeightedIndex(choiceWeights);
    const start = rotationRef.current;
    const extra = reduceMotion ? 1 : 5 + randomInt(3);
    const end = targetRotationForIndex(
      winnerIdx,
      choices.length,
      start,
      extra,
      undefined,
      choiceWeights,
    );
    // Slight overshoot then settle (skipped under reduced motion)
    const overshoot = reduceMotion ? 0 : (4 + randomInt(3)) * (Math.PI / 180);
    const peak = end + overshoot;
    const duration = wheelFirst
      ? spinMsFromSettings(v2Settings, Boolean(reduceMotion))
      : spinDurationMs(spinLength, Boolean(reduceMotion));
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
        const seg = winnerIndexAt(next, choices.length, choiceWeights);
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
  }, [
    choices,
    choiceWeights,
    finishSpin,
    reduceMotion,
    sound,
    spinLength,
    toolId,
    wheelFirst,
    v2Settings,
  ]);

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
      const hash = encodeShareHash(choices, toolId, {
        settings: settingsForShare(v2Settings),
        title: wheelTitle || undefined,
        weights: entryWeights,
      });
      const url = `${window.location.origin}${cleanPathFor(toolId)}${hash}`;
      setShareUrlBox(url);
      try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied.");
      } catch {
        showToast("Share link ready — copy from the box.");
      }
      track("share_create", { toolId });
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "LIST_TOO_LONG"
          ? "List too long to share via URL."
          : "List too long to share, or clipboard blocked.";
      showToast(msg);
    }
  };

  const applySavedWheel = (file: SavedWheelFile) => {
    setText(choicesToText(file.choices));
    setV2Settings(normalizeSettings(file.settings));
    setEntryWeights(normalizeWeights(file.weights));
    setWheelTitle(file.title.slice(0, 40));
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    setShowNextSteps(false);
    allowSaveRef.current = true;
    setSharedMode(false);
  };

  const onSaveWheelFile = (opts: { title: string; download: boolean }) => {
    const title = opts.title.trim() || wheelTitle || "My wheel";
    const file: SavedWheelFile = {
      v: 1,
      toolId,
      title,
      choices,
      settings: v2Settings,
      weights: entryWeights,
      savedAt: Date.now(),
    };
    if (title !== wheelTitle) setWheelTitle(title.slice(0, 40));
    pushRecentWheel(toolId, file);
    setRecentWheels(loadRecentWheels(toolId));
    if (opts.download) {
      const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title.replace(/[^\w\-]+/g, "-").slice(0, 40) || "wheel"}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("Wheel saved and downloaded.");
    } else {
      showToast("Wheel saved on this device.");
    }
  };

  const onOpenWheelFile = async (f: File) => {
    try {
      const raw = JSON.parse(await f.text()) as SavedWheelFile;
      if (raw?.v !== 1 || !Array.isArray(raw.choices)) throw new Error("bad");
      applySavedWheel({ ...raw, settings: normalizeSettings(raw.settings) });
      showToast("Wheel opened.");
    } catch {
      showToast("Could not open that JSON file.");
    }
  };

  const onImportCsv = (raw: string): boolean => {
    const parts = parseCsvEntries(raw);
    if (parts.length < 2) return false;
    setText(choicesToText(parts));
    showToast(`Imported ${parts.length} entries.`);
    return true;
  };

  const onToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await (stageRef.current ?? document.documentElement).requestFullscreen();
      }
    } catch {
      showToast("Fullscreen blocked by the browser.");
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
    setUndoBundle({ text, settings: v2Settings, title: wheelTitle });
    setText(choicesToText(defaults));
    setV2Settings(loadWheelSettings(toolId)); // keep saved prefs; list resets
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    setShowNextSteps(false);
    allowSaveRef.current = true;
    setSharedMode(false);
  };

  const persistImages = (next: WheelImages) => {
    setWheelImages(next);
    saveWheelImages(toolId, next);
  };

  const onNewWheel = () => {
    setUndoBundle({ text, settings: v2Settings, title: wheelTitle });
    const themeSegs = segColors(resolveToolTheme("auto", toolId)).segs;
    setText(choicesToText(defaults));
    setV2Settings({
      ...DEFAULT_WHEEL_V2_SETTINGS,
      swatches: Array.from({ length: 6 }, (_, i) => themeSegs[i] ?? DEFAULT_WHEEL_V2_SETTINGS.swatches[i]!),
    });
    setEntryWeights({});
    persistImages({ background: null, center: null, entries: {} });
    setWheelTitle("");
    setRotation(0);
    setWinner(null);
    setWinnerIndex(null);
    setRevealOpen(false);
    setShowNextSteps(false);
    setHasSpunOnce(false);
    allowSaveRef.current = true;
    setSharedMode(false);
    setToast("NEW_UNDO");
    window.setTimeout(() => setToast((t) => (t === "NEW_UNDO" ? "" : t)), 5000);
  };

  const onUndoNew = () => {
    if (!undoBundle) return;
    setText(undoBundle.text);
    setV2Settings(undoBundle.settings);
    setWheelTitle(undoBundle.title);
    setUndoBundle(null);
    setToast("");
    showToast("Undone.");
  };

  const onPickImage = async (
    file: File,
    kind: "background" | "center" | "entry",
  ) => {
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      if (kind === "background") {
        persistImages({ ...wheelImages, background: dataUrl });
        showToast("Background image saved on this device.");
      } else if (kind === "center") {
        persistImages({ ...wheelImages, center: dataUrl });
        showToast("Center image saved on this device.");
      } else {
        const label = (file.name.replace(/\.[^.]+$/, "") || "Image").slice(0, 40);
        persistImages({
          ...wheelImages,
          entries: { ...wheelImages.entries, [label.toLocaleLowerCase()]: dataUrl },
        });
        setText((prev) => (prev.trim() ? `${prev.trim()}\n${label}` : label));
        showToast("Image added as an entry (stored locally).");
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      showToast(
        code === "SIZE"
          ? "Image must be 3 MB or smaller."
          : code === "TYPE"
            ? "Use PNG, JPG, or WebP."
            : "Could not read that image.",
      );
    }
  };

  const onExportResults = (format: "csv" | "txt") => {
    if (!history.length) {
      showToast("No results to export.");
      return;
    }
    const body =
      format === "csv"
        ? ["rank,result", ...history.map((h, i) => `${i + 1},"${h.replace(/"/g, '""')}"`)].join("\n")
        : history.map((h, i) => `${i + 1}. ${h}`).join("\n");
    const blob = new Blob([body], { type: format === "csv" ? "text/csv" : "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spin-results.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  useEffect(() => {
    if (!sharedMode) return;
    const t = window.setTimeout(() => setSharedMode(false), 10000);
    return () => window.clearTimeout(t);
  }, [sharedMode]);

  useEffect(() => {
    if (!shareUrlBox) return;
    const t = window.setTimeout(() => setShareUrlBox(null), 12000);
    return () => window.clearTimeout(t);
  }, [shareUrlBox]);

  const sharedBanner = sharedMode ? (
    <div
      className="relative z-30 flex max-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-accent/40 bg-surface-2/95 px-2.5 py-1.5 text-xs text-foreground backdrop-blur sm:text-sm"
      role="status"
    >
      <p className="min-w-0 flex-1 font-semibold leading-snug">
        Shared wheel — keep it on this device, or dismiss.
      </p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={keepThisWheel}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-accent-strong px-2.5 text-xs font-bold text-slate-950 hover:bg-accent"
        >
          Keep
        </button>
        <button
          type="button"
          onClick={backToMyWheel}
          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border bg-surface px-2.5 text-xs font-bold text-foreground hover:bg-border"
        >
          My wheel
        </button>
        <button
          type="button"
          onClick={() => setSharedMode(false)}
          className="inline-flex min-h-9 items-center justify-center rounded-lg px-2.5 text-xs font-bold text-muted hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  ) : null;

  const toastEl = toast ? (
    <div
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[60] flex max-w-[min(24rem,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-2 rounded-full bg-accent-strong px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg lg:bottom-auto lg:top-20"
      role="status"
    >
      {toast === "NEW_UNDO" ? (
        <>
          <span>New wheel ready.</span>
          <button
            type="button"
            onClick={onUndoNew}
            className="rounded-full bg-slate-950/20 px-2.5 py-1 font-bold underline-offset-2 hover:underline"
          >
            Undo
          </button>
        </>
      ) : (
        toast
      )}
    </div>
  ) : null;

  const winnerUi =
    toolId !== "yes-no-wheel" ? (
      <WinnerModal
        open={revealOpen}
        winner={winner}
        entryCount={pickedFromCount}
        weighted={weightsActive}
        showRemoveContinue={!autoRemove && v2Settings.showRemoveButton}
        titleBarText={v2Settings.popupMessage}
        onDismiss={() => {
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
    autoRemove,
    onAutoRemove: setAutoRemove,
    showAutoRemove: toolId !== "yes-no-wheel",
    onAddBackgroundImage: (f: File) => void onPickImage(f, "background"),
    onAddCenterImage: (f: File) => void onPickImage(f, "center"),
    onAddEntryImage: (f: File) => void onPickImage(f, "entry"),
    onRemoveBackgroundImage: () => {
      persistImages({ ...wheelImages, background: null });
      showToast("Background image removed.");
    },
    onRemoveCenterImage: () => {
      persistImages({ ...wheelImages, center: null });
      showToast("Center image removed.");
    },
    hasBackgroundImage: Boolean(wheelImages.background),
    hasCenterImage: Boolean(wheelImages.center),
    onSortResults: () => setHistory((h) => [...h].sort((a, b) => a.localeCompare(b))),
    onExportResults,
    onOpenAdvanced: () => setAdvancedOpen(true),
  };

  const livePreview = (
    <p className="sr-only" aria-live="polite">
      {choices.length > 0
        ? (() => {
            const noun = choices.length === 1 ? "choice" : "choices";
            const listed = choices
              .map((c) => (c.length > 64 ? `${c.slice(0, 64)}…` : c))
              .join(", ");
            return `${choices.length} ${noun} on the wheel: ${listed}.`;
          })()
        : "No choices on the wheel yet."}
    </p>
  );

  if (wheelFirst) {
    return (
      <div
        className="max-w-full space-y-2 overflow-x-hidden"
        data-tool-theme={resolvedTheme}
        style={{
          ...rootStyle,
          ...(v2Settings.pageGradient
            ? {
                background: `linear-gradient(180deg, ${v2Settings.pageBg} 0%, transparent 42%)`,
              }
            : { backgroundColor: "transparent" }),
        }}
      >
        {livePreview}
        {sharedBanner}
        <CustomizeDialog
          open={customizeOpen}
          value={v2Settings}
          wheelTitle={wheelTitle}
          onWheelTitle={setWheelTitle}
          onCancel={() => setCustomizeOpen(false)}
          onOk={(next) => {
            let swatches = next.swatches;
            if (next.themeId === "custom") {
              swatches = next.swatches;
            } else if (isToolThemeId(next.themeId) && next.themeId !== "auto") {
              const segs = segColors(next.themeId).segs;
              swatches = Array.from({ length: 6 }, (_, i) => segs[i] ?? next.swatches[i]!);
            } else if (next.themeId === "auto") {
              const segs = segColors(resolveToolTheme("auto", toolId)).segs;
              swatches = Array.from({ length: 6 }, (_, i) => segs[i] ?? next.swatches[i]!);
            }
            setV2Settings({ ...next, swatches });
            setCustomizeOpen(false);
            showToast("Settings saved.");
          }}
          onPreviewTick={() => {
            sound.unlock();
            sound.setEnabled(true);
            sound.tick();
          }}
          onStopTick={() => undefined}
          onPreviewWinner={() => {
            sound.unlock();
            sound.setEnabled(true);
            sound.chime();
          }}
          onStopWinner={() => undefined}
          onResetAppearance={() => {
            persistImages({ background: null, center: null, entries: wheelImages.entries });
          }}
        />
        <AdvancedEntriesDialog
          open={advancedOpen}
          entries={choices}
          swatches={v2Settings.swatches}
          weights={entryWeights}
          images={wheelImages.entries}
          onCancel={() => setAdvancedOpen(false)}
          onOk={(result) => {
            const names = result.rows.map((r) => r.name);
            const nextWeights: Record<string, number> = {};
            const nextImages: Record<string, string> = { ...wheelImages.entries };
            const nextSwatches = [...v2Settings.swatches];
            result.rows.forEach((r, i) => {
              const key = r.name.toLocaleLowerCase();
              nextWeights[key] = r.weight;
              if (r.image) nextImages[key] = r.image;
              else delete nextImages[key];
              if (i < 6) nextSwatches[i] = r.color;
            });
            setText(choicesToText(names));
            setEntryWeights(nextWeights);
            persistImages({ ...wheelImages, entries: nextImages });
            setV2Settings((s) => ({ ...s, swatches: nextSwatches, themeId: "custom" }));
            setAdvancedOpen(false);
            showToast("Advanced entries applied.");
          }}
        />
        {/* Mobile: wheel on top (order-1); toolbar under it. Desktop: toolbar above via flex-col wrapper. */}
        <div className="flex w-full min-w-0 max-w-full flex-col gap-2">
        <div className="order-2 w-full min-w-0 max-w-full lg:order-1">
          <WheelTopBar
            disabled={spinning}
            compact
            onCustomize={() => setCustomizeOpen(true)}
            onNew={onNewWheel}
            onSave={onSaveWheelFile}
            onOpenFile={(f) => void onOpenWheelFile(f)}
            recent={recentWheels}
            onOpenRecent={applySavedWheel}
            onDeleteRecent={(savedAt) => {
              const deleted = recentWheels.find((r) => r.savedAt === savedAt);
              deleteRecentWheel(toolId, savedAt);
              setRecentWheels(loadRecentWheels(toolId));
              if (
                deleted &&
                deleted.title.trim().toLocaleLowerCase() ===
                  wheelTitle.trim().toLocaleLowerCase()
              ) {
                setWheelTitle("");
              }
            }}
            defaultSaveTitle={wheelTitle || "My wheel"}
            onShare={() => void onShare()}
            shareUrl={shareUrlBox}
            onClearShare={() => setShareUrlBox(null)}
            onFullscreen={() => void onToggleFullscreen()}
            isFullscreen={isFullscreen}
            onImportCsv={onImportCsv}
            onPreferences={() => setCustomizeOpen(true)}
            faqHref="#faq"
            onAddWheel={onFreshWheel}
            presets={toolPresets}
            onPreset={onPreset}
            homeLinks={homeLinks}
          />
        </div>
        {/* Fixed stage height — leave room for site header + H1 + top bar at 1280×720. */}
        <div
          className="relative order-1 flex w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-3xl lg:order-2 lg:h-[calc(100dvh-18rem)] lg:max-h-[calc(100dvh-18rem)] lg:min-h-[17rem] lg:flex-row lg:items-stretch lg:gap-0"
          ref={stageRef}
        >
          {isFullscreen ? (
            <button
              type="button"
              onClick={() => void onToggleFullscreen()}
              className="absolute left-1/2 top-3 z-[80] inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground shadow-lg outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
            >
              Exit fullscreen
            </button>
          ) : null}
          <div
            className={`relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border border-border p-2 sm:p-2.5 ${
              panelOpen ? "lg:rounded-r-none lg:border-r-0" : ""
            } ${wheelImages.background ? "bg-transparent" : "bg-surface"}`}
          >
            {wheelImages.background ? (
              <>
                <div
                  className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${wheelImages.background})` }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 z-0 bg-background/72" aria-hidden />
              </>
            ) : null}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
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
              className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden pt-6"
            >
              {wheelPx > 0 ? (
                <div className="relative shrink-0" style={{ width: wheelPx, height: wheelPx }}>
                  <WheelCanvas
                    choices={choices}
                    rotation={rotation}
                    colors={themeColors}
                    labelColors={themeLabels}
                    highlightIndex={revealOpen ? winnerIndex : null}
                    title={v2Settings.showTitle && wheelTitle ? wheelTitle : undefined}
                    hubLabel={spinning ? "…" : ""}
                    spinPrompt={false}
                    weights={choiceWeights}
                    sliceImages={sliceImages}
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
                    className="absolute inset-[4%] z-20 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 disabled:cursor-not-allowed"
                  />
                  {wheelImages.center ? (
                    <img
                      src={wheelImages.center}
                      alt=""
                      className={`pointer-events-none absolute left-1/2 top-1/2 z-[15] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow ${
                        v2Settings.centerImageSize === "S"
                          ? "h-[12%] w-[12%]"
                          : v2Settings.centerImageSize === "L"
                            ? "h-[22%] w-[22%]"
                            : "h-[16%] w-[16%]"
                      }`}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="aspect-square h-full max-h-full w-auto bg-surface-2/30" aria-hidden />
              )}
            </div>

            {weightsActive ? (
              <p className="mx-auto shrink-0 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-center text-[10px] font-bold tracking-wide text-amber-200">
                Weighted
              </p>
            ) : null}
            {!hasSpunOnce && !spinning && choices.length >= 2 ? (
              <p className="mx-auto hidden shrink-0 rounded-full bg-background/85 px-3 py-0.5 text-center text-[10px] font-bold tracking-wide text-foreground shadow-sm [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] pointer-fine:block sm:text-[11px]">
                Click To Spin · Ctrl+Enter
              </p>
            ) : null}

            {/* Fixed-height status row — spin speed & share live in the ⋮ menu */}
            <p
              className="flex h-6 shrink-0 items-center justify-center text-center text-xs text-muted"
              aria-live="polite"
            >
              {status}
            </p>

            {toolId === "yes-no-wheel" ? (
              <ResultReveal
                open={revealOpen}
                value={winner}
                label="Result"
                variant="yesno"
                showRemove={false}
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
          </div>

          <WheelSidePanel
            open={panelOpen}
            onToggle={() => setPanelOpen((v) => !v)}
            {...panelProps}
          />
        </div>
        </div>

        {/* Mobile sticky SPIN — panel below keeps clearance so Entries isn't under the bar */}
        <div className="lg:hidden">
          <StickySpinButton
            canSpin={canSpin}
            spinning={spinning}
            onSpin={spin}
            buttonRef={stickySpinRef}
            alwaysDockMobile
          />
        </div>

        <div className="w-full pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
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
            {toolId === "yes-no-wheel" ? (
              <ResultReveal
                open={revealOpen}
                value={winner}
                label="Result"
                variant="yesno"
                showRemove={false}
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
                Share
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
