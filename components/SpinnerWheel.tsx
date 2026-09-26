"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Link2, Share2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { ChoicesEditor } from "@/components/ChoicesEditor";
import { PresetSelector } from "@/components/PresetSelector";
import { RelatedTools } from "@/components/RelatedTools";
import { SpinControls } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { WinnerModal } from "@/components/WinnerModal";
import { encodeShareHash, readShareFromLocation } from "@/lib/share-codec";
import {
  defaultChoicesForTool,
  getPresetById,
  presetsForTool,
  type WheelPreset,
} from "@/lib/presets";
import {
  decodeChoicesParam,
  loadPrefs,
  loadSession,
  savePrefs,
  saveSession,
} from "@/lib/spinner-storage";
import { randomInt, shuffle } from "@/lib/random";
import { track } from "@/lib/track";
import { cleanPathFor, defaultAutoRemoveWinner, type ToolId } from "@/lib/tools";
import {
  choicesToText,
  easeOutCubic,
  parseChoicesWithStats,
  targetRotationForIndex,
  winnerIndexAt,
} from "@/lib/wheel";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [sharedMode, setSharedMode] = useState(false);
  const [autoRemove, setAutoRemove] = useState(() => defaultAutoRemoveWinner(toolId));
  const [ready, setReady] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  const spinningRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const allowSaveRef = useRef(true);

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
    const prefs = loadPrefs();
    setSoundEnabled(prefs.soundEnabled);
    setAutoRemove(defaultAutoRemoveWinner(toolId));

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

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioCtxRef.current ?? new Ctx();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 660;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      /* ignore */
    }
  }, [soundEnabled]);

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
      setModalOpen(Boolean(name));
      setSpinning(false);
      playTick();
      track("spin", { toolId, count: choices.length });

      if (autoRemove && name && allowSaveRef.current) {
        const next = choices.filter((c) => c !== name);
        setText(choicesToText(next));
      } else if (autoRemove && name && !allowSaveRef.current) {
        const next = choices.filter((c) => c !== name);
        setText(choicesToText(next));
      }
    },
    [choices, playTick, autoRemove, toolId],
  );

  const spin = useCallback(() => {
    if (spinningRef.current || choices.length < 2) return;
    setModalOpen(false);
    setWinner(null);
    setSpinning(true);

    const winnerIdx = randomInt(choices.length);
    const start = rotationRef.current;
    const extra = reduceMotion ? 2 : 5 + randomInt(3);
    const end = targetRotationForIndex(winnerIdx, choices.length, start, extra);
    const duration = reduceMotion ? 1200 : 4200 + randomInt(900);
    const t0 = performance.now();

    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOutCubic(t);
      const next = start + (end - start) * e;
      setRotation(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finishSpin(end);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [choices, finishSpin, reduceMotion]);

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
    setModalOpen(false);
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

  const onToggleSound = () => {
    setSoundEnabled((v) => {
      const next = !v;
      savePrefs({ soundEnabled: next });
      return next;
    });
  };

  const onRemoveWinner = () => {
    if (!winner) return;
    const next = choices.filter((c) => c !== winner);
    setText(choicesToText(next));
    setModalOpen(false);
    setWinner(null);
    setRotation(0);
    setShowNextSteps(true);
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
    setModalOpen(false);
    allowSaveRef.current = true;
    setSharedMode(false);
    showToast("Back to your saved wheel.");
  };

  const wheelShellStyle = {
    aspectRatio: "1 / 1",
    width: sharedMode
      ? "min(100%, 300px, calc(100svh - 16rem))"
      : "min(100%, 420px, calc(100svh - 14rem))",
    maxWidth: "420px",
  } as const;

  return (
    <div className="space-y-3">
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
        <div className="rounded-3xl border border-border bg-surface p-3 sm:p-5">
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
              <WheelCanvas choices={choices} rotation={rotation} className="!max-w-none h-full" />
            </div>
          </div>
          <SpinControls
            canSpin={canSpin}
            spinning={spinning}
            soundEnabled={soundEnabled}
            status={status}
            onSpin={spin}
            onReset={() => {
              if (!spinning) setRotation(0);
            }}
            onToggleSound={onToggleSound}
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
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void onShare()}
              disabled={choices.length < 1 || spinning}
              className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                setModalOpen(false);
                setShowNextSteps(false);
                allowSaveRef.current = true;
                setSharedMode(false);
              }}
              disabled={spinning}
              className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    { href: "/prize-wheel", label: "Prize wheel" },
                    { href: "/yes-no-wheel", label: "Yes or no wheel" },
                    { href: "/random-team-generator", label: "Team generator" },
                  ]
                : undefined
            }
          />
        </div>
      </div>

      {toast ? (
        <p
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <WinnerModal
        open={modalOpen}
        winner={winner}
        onClose={() => {
          setModalOpen(false);
          setShowNextSteps(true);
        }}
        onSpinAgain={() => {
          setModalOpen(false);
          setShowNextSteps(false);
          spin();
        }}
        onRemoveWinner={onRemoveWinner}
      />
    </div>
  );
}
