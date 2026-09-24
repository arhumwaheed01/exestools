"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { ChoicesEditor } from "@/components/ChoicesEditor";
import { PresetSelector } from "@/components/PresetSelector";
import { SpinControls } from "@/components/SpinControls";
import { WheelCanvas } from "@/components/WheelCanvas";
import { WinnerModal } from "@/components/WinnerModal";
import { DEFAULT_CHOICES, getPresetById, type WheelPreset } from "@/lib/presets";
import {
  decodeChoicesParam,
  encodeChoicesParam,
  loadPrefs,
  loadSession,
  savePrefs,
  saveSession,
} from "@/lib/storage";
import {
  choicesToText,
  easeOutCubic,
  parseChoicesText,
  shuffleArray,
  targetRotationForIndex,
  winnerIndexAt,
} from "@/lib/wheel";

type Props = {
  /** Optional initial choices from URL (?c=) — applied once on mount. */
  initialEncoded?: string | null;
  /** Load this preset when no share URL is present (use-case landings). */
  presetId?: string;
  /** When false, reserve no ad chrome (AdSense not live yet). */
  showAdSlots?: boolean;
};

function defaultTextForPreset(presetId?: string): string {
  const preset = presetId ? getPresetById(presetId) : undefined;
  if (preset) return choicesToText(preset.choices);
  return choicesToText([...DEFAULT_CHOICES]);
}

export function SpinnerWheel({
  initialEncoded = null,
  presetId,
  showAdSlots = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState(() => defaultTextForPreset(presetId));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  const spinningRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const choices = useMemo(() => parseChoicesText(text), [text]);
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

    const fromUrl = initialEncoded ? decodeChoicesParam(initialEncoded) : null;
    if (fromUrl && fromUrl.length >= 1) {
      setText(choicesToText(fromUrl));
    } else if (presetId) {
      const preset = getPresetById(presetId);
      if (preset) setText(choicesToText(preset.choices));
    } else {
      const session = loadSession();
      if (session?.choices?.length) {
        setText(choicesToText(session.choices));
      }
    }
    setHydrated(true);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [initialEncoded, presetId]);

  useEffect(() => {
    if (!hydrated) return;
    saveSession(choices);
  }, [choices, hydrated]);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    },
    [choices, playTick],
  );

  const spin = useCallback(() => {
    if (spinningRef.current || choices.length < 2) return;
    setModalOpen(false);
    setWinner(null);
    setSpinning(true);

    const winner = Math.floor(Math.random() * choices.length);
    const start = rotationRef.current;
    const extra = reduceMotion ? 2 : 5 + Math.floor(Math.random() * 3);
    const end = targetRotationForIndex(winner, choices.length, start, extra);
    const duration = reduceMotion ? 1200 : 4200 + Math.random() * 900;
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
  };

  const onShuffle = () => {
    if (spinningRef.current) return;
    setText(choicesToText(shuffleArray(choices)));
  };

  const onClear = () => {
    if (spinningRef.current) return;
    if (!window.confirm("Clear all choices? This cannot be undone.")) return;
    setText("");
  };

  const onRestoreDefaults = () => {
    if (spinningRef.current) return;
    setText(defaultTextForPreset(presetId));
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
  };

  const onShare = async () => {
    const encoded = encodeChoicesParam(choices);
    if (!encoded) {
      showToast("List too long to share via URL.");
      return;
    }
    const path = window.location.pathname || "/";
    const url = `${window.location.origin}${path}?c=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Share link copied.");
    } catch {
      showToast("Could not copy share link.");
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
  };

  return (
    <div className="space-y-6">
      {showAdSlots ? <AdPlaceholder label="Header banner" sizeClassName="h-20 md:h-24" /> : null}

      <div
        className={`grid gap-6 lg:items-start ${showAdSlots ? "lg:grid-cols-[minmax(0,1fr)_240px]" : ""}`}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="rounded-3xl border border-border bg-surface p-4 sm:p-6">
            <WheelCanvas choices={choices} rotation={rotation} />
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
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void onShare()}
                disabled={choices.length < 1 || spinning}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden />
                Copy share link
              </button>
              <button
                type="button"
                onClick={() => {
                  setText(defaultTextForPreset(presetId));
                  setRotation(0);
                  setWinner(null);
                  setModalOpen(false);
                }}
                disabled={spinning}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-border disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden />
                Fresh wheel
              </button>
            </div>
            {showAdSlots ? (
              <AdPlaceholder label="Below wheel" className="mt-6" sizeClassName="h-24 sm:h-28" />
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <ChoicesEditor
              text={text}
              count={choices.length}
              disabled={spinning}
              onChange={onTextChange}
              onShuffle={onShuffle}
              onClear={onClear}
              onRestoreDefaults={onRestoreDefaults}
              onCopy={() => void onCopy()}
            />
            <PresetSelector disabled={spinning} onSelect={onPreset} />
          </div>
        </div>

        {showAdSlots ? (
          <aside className="hidden lg:block">
            <AdPlaceholder label="Sidebar" sizeClassName="min-h-[480px] sticky top-20" />
          </aside>
        ) : null}
      </div>

      {showAdSlots ? (
        <div className="lg:hidden">
          <AdPlaceholder label="Mobile ad area" sizeClassName="h-36" />
        </div>
      ) : null}

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
        onClose={() => setModalOpen(false)}
        onSpinAgain={() => {
          setModalOpen(false);
          spin();
        }}
        onRemoveWinner={onRemoveWinner}
      />
    </div>
  );
}
