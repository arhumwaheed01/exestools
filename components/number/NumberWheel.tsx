"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Link2, Share2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { RangeWheelCanvas } from "@/components/number/RangeWheelCanvas";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { StickySpinButton } from "@/components/SpinControls";
import { HistoryRow } from "@/components/tools/HistoryRow";
import { ResultReveal } from "@/components/tools/ResultReveal";
import { ThemeChips } from "@/components/tools/ThemeChips";
import { ToolConfetti } from "@/components/tools/Confetti";
import { encodeShareHash, readShareFromLocation } from "@/lib/share-codec";
import {
  ALLOWED_NUMBER_PRESET_QUERY,
  RANGE_CHIPS,
  buildPool,
  formatBingoCall,
  formatNumberLabel,
  getChipById,
  validate,
} from "@/lib/range";
import { randomInt } from "@/lib/random";
import { track } from "@/lib/track";
import { spinDurationMs, useSound, type SpinLength } from "@/lib/tools/sound";
import {
  loadToolTheme,
  resolveToolTheme,
  saveToolTheme,
  segColor,
  type ToolThemeId,
} from "@/lib/tools/theme";
import { easeOutCubic, targetRotationForIndex } from "@/lib/wheel";
import "@/app/styles/tools-themes.css";

const TOOL_ID = "random-number-wheel" as const;
const STORAGE_KEY = "exestools.spinner.v1.random-number-wheel";
const HISTORY_CAP = 20;
const HISTORY_STORE_CAP = 200;

type NumSettings = {
  min: number;
  max: number;
  noRepeat: boolean;
  bingo: boolean;
};

type StoredState = {
  num: NumSettings;
  drawn: number[];
  history: number[];
  updatedAt: number;
};

type Props = {
  initialPresetQuery?: string | null;
};

function defaultSettings(): NumSettings {
  return { min: 1, max: 10, noRepeat: false, bingo: false };
}

function showBingoToggle(min: number, max: number) {
  return min === 1 && max === 75;
}

function resultLabel(n: number, bingo: boolean, min: number, max: number): string {
  if (bingo && showBingoToggle(min, max)) return formatBingoCall(n);
  return formatNumberLabel(n);
}

export function NumberWheel({ initialPresetQuery = null }: Props) {
  const reduceMotion = useReducedMotion();
  const [minRaw, setMinRaw] = useState("1");
  const [maxRaw, setMaxRaw] = useState("10");
  const [noRepeat, setNoRepeat] = useState(false);
  const [bingo, setBingo] = useState(false);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [revealOpen, setRevealOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const [sharedMode, setSharedMode] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [liveResult, setLiveResult] = useState("");
  const [toast, setToast] = useState("");
  const [highlightReset, setHighlightReset] = useState(false);
  const [themeChoice, setThemeChoice] = useState<ToolThemeId>("auto");
  const [confettiFire, setConfettiFire] = useState(0);
  const [spinLength, setSpinLength] = useState<SpinLength>("normal");

  const sound = useSound();
  const spinningRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const allowSaveRef = useRef(true);
  const poolRef = useRef<number[]>([]);
  const spinBtnRef = useRef<HTMLButtonElement>(null);
  const resolvedTheme = resolveToolTheme(themeChoice, TOOL_ID);
  const themeColors = useMemo(
    () => Array.from({ length: 8 }, (_, i) => segColor(resolvedTheme, i)),
    [resolvedTheme],
  );

  const validation = useMemo(() => validate(minRaw, maxRaw), [minRaw, maxRaw]);
  const min = validation.ok ? validation.min : 1;
  const max = validation.ok ? validation.max : 10;
  const bingoVisible = validation.ok && showBingoToggle(min, max);
  const bingoActive = bingoVisible && bingo;

  const pool = useMemo(() => {
    if (!validation.ok) return [];
    return buildPool(min, max, noRepeat ? drawn : []);
  }, [validation, min, max, noRepeat, drawn]);

  poolRef.current = pool;

  const rangeSize = validation.ok ? validation.count : 0;
  const poolEmpty = validation.ok && noRepeat && pool.length === 0 && drawn.length > 0;
  const canSpin = validation.ok && pool.length >= 1 && !spinning;

  const ariaLabel = validation.ok
    ? `Number wheel from ${formatNumberLabel(min)} to ${formatNumberLabel(max)}, ${pool.length} numbers left.`
    : "Number wheel";

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const spinRef = useRef<() => void>(() => {});
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const persist = useCallback(
    (next: { min: number; max: number; noRepeat: boolean; bingo: boolean; drawn: number[]; history: number[] }) => {
      if (!allowSaveRef.current || typeof window === "undefined") return;
      try {
        const payload: StoredState = {
          num: {
            min: next.min,
            max: next.max,
            noRepeat: next.noRepeat,
            bingo: next.bingo,
          },
          drawn: next.drawn,
          history: next.history.slice(0, HISTORY_STORE_CAP),
          updatedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    },
    [],
  );

  useEffect(() => {
    setThemeChoice(loadToolTheme(TOOL_ID));

    const fromHash = readShareFromLocation();
    const numExtra = fromHash?.extra?.num as NumSettings | undefined;
    const chip =
      initialPresetQuery && ALLOWED_NUMBER_PRESET_QUERY.has(initialPresetQuery)
        ? getChipById(initialPresetQuery)
        : null;

    if (numExtra && typeof numExtra.min === "number" && typeof numExtra.max === "number") {
      const v = validate(String(numExtra.min), String(numExtra.max));
      if (v.ok) {
        setMinRaw(String(v.min));
        setMaxRaw(String(v.max));
        setNoRepeat(Boolean(numExtra.noRepeat));
        setBingo(Boolean(numExtra.bingo) && v.min === 1 && v.max === 75);
        setDrawn([]);
        setHistory([]);
        setSharedMode(true);
        allowSaveRef.current = false;
        setStatusNote("");
        track("share_open", { toolId: TOOL_ID, via: "hash" });
      }
    } else if (chip) {
      setMinRaw(String(chip.min));
      setMaxRaw(String(chip.max));
      setNoRepeat(Boolean(chip.forceNoRepeat));
      setBingo(Boolean(chip.forceBingo));
      setDrawn([]);
      setHistory([]);
      allowSaveRef.current = true;
      setStatusNote("");
      track("preset_load", { toolId: TOOL_ID, preset: chip.id });
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredState;
          if (parsed?.num && typeof parsed.num.min === "number") {
            const v = validate(String(parsed.num.min), String(parsed.num.max));
            if (v.ok) {
              setMinRaw(String(v.min));
              setMaxRaw(String(v.max));
              setNoRepeat(Boolean(parsed.num.noRepeat));
              setBingo(Boolean(parsed.num.bingo) && v.min === 1 && v.max === 75);
              setDrawn(Array.isArray(parsed.drawn) ? parsed.drawn.filter((n) => typeof n === "number") : []);
              setHistory(
                Array.isArray(parsed.history)
                  ? parsed.history.filter((n) => typeof n === "number").slice(0, HISTORY_STORE_CAP)
                  : [],
              );
              allowSaveRef.current = true;
              setStatusNote("");
              track("return_visit", { toolId: TOOL_ID });
            }
          }
        }
      } catch {
        /* ignore */
      }
    }

    setHydrated(true);
    requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(rafRef.current);
  }, [initialPresetQuery]);

  useEffect(() => {
    if (!hydrated || !allowSaveRef.current || !validation.ok) return;
    persist({
      min,
      max,
      noRepeat,
      bingo: bingoActive,
      drawn,
      history,
    });
  }, [hydrated, validation.ok, min, max, noRepeat, bingoActive, drawn, history, persist]);

  const finishSpin = useCallback(
    (finalRotation: number, picked: number, poolLenAtSpin: number) => {
      setRotation(finalRotation);
      setDrawn((prev) => (noRepeat ? [...prev, picked] : prev));
      setHistory((prev) => [picked, ...prev].slice(0, HISTORY_STORE_CAP));

      const label = resultLabel(picked, bingoActive, min, max);
      setWinner(label);
      setRevealOpen(true);
      setSpinning(false);
      setLiveResult(`Result: ${label}.`);
      sound.chime();
      setConfettiFire((n) => n + 1);
      track("spin", {
        toolId: TOOL_ID,
        choiceCount: poolLenAtSpin,
        noRepeat,
      });
      if (noRepeat && poolLenAtSpin <= 1) {
        setStatusNote(`All ${rangeSize.toLocaleString("en-US")} numbers have been drawn.`);
        setHighlightReset(true);
      }
    },
    [bingoActive, min, max, noRepeat, sound, rangeSize],
  );

  const spin = useCallback(() => {
    const currentPool = poolRef.current;
    if (spinningRef.current || !validation.ok || currentPool.length < 1) return;
    sound.unlock();

    const idx = randomInt(currentPool.length);
    const picked = currentPool[idx]!;
    const poolLenAtSpin = currentPool.length;

    setStatusNote("");
    setHighlightReset(false);
    setRevealOpen(false);

    if (reduceMotion) {
      finishSpin(rotationRef.current, picked, poolLenAtSpin);
      return;
    }

    setSpinning(true);
    const start = rotationRef.current;
    const target = targetRotationForIndex(idx, currentPool.length, start);
    const duration = spinDurationMs(spinLength, Boolean(reduceMotion));
    const t0 = performance.now();
    let lastSeg = -1;

    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = easeOutCubic(t);
      const rot = start + (target - start) * eased;
      setRotation(rot);
      const seg = Math.floor(
        (((-rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) /
          ((Math.PI * 2) / Math.max(1, currentPool.length)),
      );
      if (seg !== lastSeg) {
        lastSeg = seg;
        sound.tick();
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        finishSpin(target, picked, poolLenAtSpin);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [validation.ok, reduceMotion, finishSpin, sound, spinLength]);

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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onChipClick = (chipId: string) => {
    if (spinning) return;
    const chip = getChipById(chipId);
    if (!chip) return;
    setMinRaw(String(chip.min));
    setMaxRaw(String(chip.max));
    setDrawn([]);
    setHistory([]);
    setRotation(0);
    setHighlightReset(false);
    setStatusNote("Range changed. Draws reset.");
    if (chip.forceNoRepeat) setNoRepeat(true);
    if (chip.forceBingo) setBingo(true);
    else if (!(chip.min === 1 && chip.max === 75)) setBingo(false);
    track("preset_load", { toolId: TOOL_ID, preset: chip.id });
  };

  const onMinMaxCommit = () => {
    if (spinning) return;
    const v = validate(minRaw, maxRaw);
    if (!v.ok) return;
    // Normalize leading zeros in display
    setMinRaw(String(v.min));
    setMaxRaw(String(v.max));
    setDrawn([]);
    setHistory([]);
    setRotation(0);
    setHighlightReset(false);
    if (!(v.min === 1 && v.max === 75)) setBingo(false);
    setStatusNote("Range changed. Draws reset.");
  };

  const onNoRepeatToggle = (next: boolean) => {
    setNoRepeat(next);
    if (!next) {
      // Drawn numbers go back on the wheel; history stays
      setStatusNote("");
      setHighlightReset(false);
    } else {
      // Start with full range — clear drawn so pool is full
      setDrawn([]);
      setHighlightReset(false);
    }
  };

  const resetDraws = () => {
    if (spinning) return;
    setDrawn([]);
    setHistory([]);
    setHighlightReset(false);
    setStatusNote("");
    setLiveResult("");
  };

  const copyResults = async () => {
    const oldestFirst = [...history].reverse();
    const text = oldestFirst
      .map((n) => (bingoActive ? formatBingoCall(n) : formatNumberLabel(n)))
      .join(", ");
    try {
      await navigator.clipboard.writeText(text);
      showToast("Results copied.");
      track("copy_result", { toolId: TOOL_ID });
    } catch {
      showToast("Could not copy.");
    }
  };

  const copyShare = async () => {
    if (!validation.ok) return;
    try {
      const hash = encodeShareHash([], TOOL_ID, {
        num: { min, max, noRepeat, bingo: bingoActive },
      });
      const url = `${window.location.origin}/random-number-wheel${hash}`;
      await navigator.clipboard.writeText(url);
      showToast("Share link copied.");
      track("share_create", { toolId: TOOL_ID });
    } catch {
      showToast("Could not copy share link.");
    }
  };

  const keepShared = () => {
    allowSaveRef.current = true;
    setSharedMode(false);
    showToast("Saved to this device.");
  };

  const statusLine = useMemo(() => {
    if (statusNote) return statusNote;
    if (spinning) return "Spinning…";
    if (!validation.ok) return validation.error;
    if (poolEmpty) return `All ${rangeSize.toLocaleString("en-US")} numbers have been drawn.`;
    if (noRepeat) return `${drawn.length} of ${rangeSize} drawn`;
    return `${pool.length} numbers ready — hit SPIN.`;
  }, [statusNote, spinning, validation, poolEmpty, rangeSize, noRepeat, drawn.length, pool.length]);

  const recent = history.slice(0, HISTORY_CAP);
  const previewLabels = Array.from({ length: 10 }, (_, i) => String(i + 1));

  return (
    <div className="w-full min-w-0 max-w-full">
      {!ready ? (
        <div className="min-h-[520px] w-full min-w-0">
          <StaticWheelPreview choices={previewLabels} />
          <p className="mt-2 text-center text-sm text-muted">10 numbers on the wheel: 1 to 10.</p>
        </div>
      ) : null}

      <div className={ready ? "w-full min-w-0" : "hidden"} aria-hidden={!ready}>
        {sharedMode ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-surface px-3 py-2 text-sm">
            <span className="text-muted">You&apos;re viewing a shared range.</span>
            <button
              type="button"
              onClick={keepShared}
              className="rounded-lg bg-accent-strong px-3 py-1.5 text-xs font-bold text-slate-950"
            >
              Save to this device
            </button>
            <button
              type="button"
              onClick={() => setSharedMode(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div
          className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"
          data-tool-theme={resolvedTheme}
        >
          <div className="flex w-full min-w-0 flex-col items-center">
            <RangeWheelCanvas
              pool={pool}
              rotation={rotation}
              ariaLabel={ariaLabel}
              colors={themeColors}
            />
            <p
              className="mt-3 min-h-[1.25rem] text-center text-sm font-medium text-muted"
              role="status"
            >
              {statusLine}
            </p>
            <p className="sr-only" aria-live="polite">
              {liveResult}
            </p>
            <ResultReveal
              open={revealOpen}
              value={winner}
              label="Number"
              variant="number"
              showRemove={false}
              onSpinAgain={() => {
                setRevealOpen(false);
                spin();
              }}
              onShare={() => void copyShare()}
              onClose={() => setRevealOpen(false)}
              spinBtnRef={spinBtnRef}
            />
            <StickySpinButton
              placement="inline-desktop"
              canSpin={canSpin}
              spinning={spinning}
              onSpin={spin}
              buttonRef={spinBtnRef}
            />
            <div
              role="radiogroup"
              aria-label="Spin length"
              className="mt-2 flex flex-wrap items-center justify-center gap-2"
            >
              {(
                [
                  ["short", "Short"],
                  ["normal", "Normal"],
                  ["long", "Long"],
                ] as const
              ).map(([id, label]) => (
                <label
                  key={id}
                  className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-bold outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                    spinLength === id
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="num-spin-length"
                    className="sr-only"
                    checked={spinLength === id}
                    onChange={() => setSpinLength(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={spinning}
              onClick={() => {
                sound.unlock();
                sound.setEnabled(!sound.enabled);
              }}
              aria-pressed={sound.enabled}
              className="mt-2 min-h-11 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Sound {sound.enabled ? "on" : "off"}
            </button>
            <HistoryRow
              items={recent.map((n) =>
                bingoActive ? formatBingoCall(n) : formatNumberLabel(n),
              )}
              onClear={() => setHistory([])}
            />
            {bingoActive && drawn.length > 0 ? (
              <div className="mt-4 w-full max-w-sm">
                <h2 className="text-center text-xs font-bold uppercase tracking-wide text-muted">
                  Called board
                </h2>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {[...drawn].reverse().slice(0, 15).map((n, i) => (
                    <span
                      key={`${n}-${i}`}
                      className="grid aspect-square place-items-center rounded-full bg-[var(--t-accent,#0891b2)] text-xs font-bold text-slate-950"
                    >
                      {formatBingoCall(n)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Theme</p>
              <ThemeChips
                value={themeChoice}
                onChange={(next) => {
                  setThemeChoice(next);
                  saveToolTheme(TOOL_ID, next);
                }}
              />
              <h2 className="mt-4 text-base font-bold text-foreground">Quick range</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {RANGE_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    disabled={spinning}
                    onClick={() => onChipClick(chip.id)}
                    className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold hover:border-accent disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="font-semibold text-foreground">Min</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minRaw}
                    disabled={spinning}
                    aria-invalid={!validation.ok}
                    aria-describedby="range-error"
                    onChange={(e) => setMinRaw(e.target.value)}
                    onBlur={onMinMaxCommit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onMinMaxCommit();
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-foreground">Max</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxRaw}
                    disabled={spinning}
                    aria-invalid={!validation.ok}
                    aria-describedby="range-error"
                    onChange={(e) => setMaxRaw(e.target.value)}
                    onBlur={onMinMaxCommit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onMinMaxCommit();
                    }}
                    className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>
              </div>
              {!validation.ok ? (
                <p id="range-error" className="mt-2 text-sm text-amber-400" role="alert">
                  {validation.error}
                </p>
              ) : (
                <span id="range-error" className="sr-only" />
              )}

              <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={noRepeat}
                  disabled={spinning}
                  onChange={(e) => onNoRepeatToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                No repeats
              </label>

              {bingoVisible ? (
                <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={bingo}
                    disabled={spinning}
                    onChange={(e) => setBingo(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Show bingo letters
                </label>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => void copyShare()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Share2 className="h-4 w-4" aria-hidden />
                  Copy share link
                </button>
                <button
                  type="button"
                  disabled={spinning || history.length === 0}
                  onClick={() => void copyResults()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Link2 className="h-4 w-4" aria-hidden />
                  Copy results
                </button>
                <button
                  type="button"
                  disabled={spinning}
                  onClick={resetDraws}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    highlightReset
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border bg-surface-2"
                  }`}
                >
                  Reset draws
                </button>
              </div>
              <p className="mt-3 text-xs text-muted">
                Your range and draws are saved in this browser. Share links carry only the range and
                settings, not your draw history.{" "}
                <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      {toast ? (
        <p
          className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg sm:bottom-4"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <StickySpinButton
        placement="fixed-mobile"
        canSpin={canSpin}
        spinning={spinning}
        onSpin={spin}
        buttonRef={spinBtnRef}
      />
      <ToolConfetti fire={confettiFire} colors={[...themeColors]} />
    </div>
  );
}
