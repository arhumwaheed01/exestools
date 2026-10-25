"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Gauge, MoreVertical, Share2, Volume2, VolumeX } from "lucide-react";
import type { SpinLength } from "@/lib/tools/sound";

const SPEEDS: { id: SpinLength; label: string; hint: string }[] = [
  { id: "short", label: "Short", hint: "Quick spin" },
  { id: "normal", label: "Normal", hint: "Default" },
  { id: "long", label: "Long", hint: "Dramatic spin" },
];

type Props = {
  onEmbed: () => void;
  onShare: () => void;
  shareDisabled?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  spinLength: SpinLength;
  onSpinLength: (v: SpinLength) => void;
  disabled?: boolean;
  className?: string;
};

/** Top-left ⋮ menu on the wheel stage (Sound, Spin speed, Share, Embed). */
export function WheelOverflowMenu({
  onEmbed,
  onShare,
  shareDisabled,
  soundEnabled,
  onToggleSound,
  spinLength,
  onSpinLength,
  disabled,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const speedTitleId = useId();

  useEffect(() => {
    if (!open && !speedOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSpeedOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (speedOpen) setSpeedOpen(false);
        else setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, speedOpen]);

  const itemCls =
    "flex w-full min-h-10 items-center gap-2 px-3 text-left text-sm font-semibold text-foreground outline-none hover:bg-surface-2 focus-visible:bg-surface-2 disabled:opacity-40";

  const speedLabel = SPEEDS.find((s) => s.id === spinLength)?.label ?? "Normal";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="More wheel options"
        title="More options"
        onClick={() => {
          setSpeedOpen(false);
          setOpen((v) => !v);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-foreground outline-none hover:bg-surface-2/60 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>

      {open && !speedOpen ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-40 mt-1 min-w-[13rem] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleSound();
                setOpen(false);
              }}
              className={itemCls}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-accent" aria-hidden />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted" aria-hidden />
              )}
              Sound {soundEnabled ? "on" : "off"}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setSpeedOpen(true);
              }}
              className={itemCls}
            >
              <Gauge className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span className="flex-1">Spin speed</span>
              <span className="text-xs font-bold text-muted">{speedLabel}</span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              disabled={shareDisabled}
              onClick={() => {
                setOpen(false);
                onShare();
              }}
              className={itemCls}
            >
              <Share2 className="h-3.5 w-3.5 text-accent" aria-hidden />
              Share
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEmbed();
              }}
              className={itemCls}
            >
              Embed this wheel
            </button>
          </li>
        </ul>
      ) : null}

      {speedOpen ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={speedTitleId}
          className="absolute left-0 top-full z-40 mt-1 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-xl"
        >
          <p id={speedTitleId} className="text-sm font-bold text-foreground">
            Spin speed
          </p>
          <p className="mt-0.5 text-xs text-muted">How long the wheel turns.</p>
          <div role="radiogroup" aria-label="Spin speed" className="mt-3 space-y-1.5">
            {SPEEDS.map((s) => {
              const active = spinLength === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    onSpinLength(s.id);
                    setSpeedOpen(false);
                  }}
                  className={`flex w-full min-h-11 items-center justify-between rounded-xl border px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border bg-surface-2 text-foreground hover:border-accent/60"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-bold">{s.label}</span>
                    <span className="block text-xs text-muted">{s.hint}</span>
                  </span>
                  {active ? (
                    <span className="text-xs font-bold text-accent">Selected</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSpeedOpen(false)}
            className="mt-2 w-full text-center text-xs font-semibold text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
