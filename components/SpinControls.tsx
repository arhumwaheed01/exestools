"use client";

import { useEffect, useState, type Ref, type RefObject } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import type { SpinLength } from "@/lib/tools/sound";

type Props = {
  canSpin: boolean;
  spinning: boolean;
  soundEnabled: boolean;
  status: string;
  spinLength: SpinLength;
  onSpin: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onSpinLength: (v: SpinLength) => void;
  /** When true, omit the SPIN button (parent renders StickySpinButton). */
  hideSpinButton?: boolean;
  spinButtonRef?: Ref<HTMLButtonElement>;
};

/** @deprecated Kept for call-site compat. */
type StickyPlacement = "fixed-mobile" | "inline-desktop" | "both";

function assignRef(ref: Ref<HTMLButtonElement> | undefined, el: HTMLButtonElement | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else (ref as RefObject<HTMLButtonElement | null>).current = el;
}

/** Focus the visible SPIN CTA. */
export function focusVisibleSpinButton(fallback?: RefObject<HTMLButtonElement | null>) {
  const nodes = document.querySelectorAll<HTMLButtonElement>("[data-et-spin]");
  for (const btn of nodes) {
    if (btn.disabled) continue;
    if (btn.getClientRects().length === 0) continue;
    btn.focus();
    return;
  }
  fallback?.current?.focus();
}

/**
 * SPIN CTA — centered under the wheel.
 * On phones: sticks to the bottom while the spinner is off-screen; returns under the
 * spinner when it scrolls back into view. Desktop: always centered under the wheel.
 */
export function StickySpinButton({
  canSpin,
  spinning,
  onSpin,
  buttonRef,
  placement: _placement = "both",
  anchorRef,
}: {
  canSpin: boolean;
  spinning: boolean;
  onSpin: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
  placement?: StickyPlacement;
  /** Wheel/stage element — when this leaves the viewport on mobile, SPIN docks to the bottom. */
  anchorRef?: RefObject<HTMLElement | null>;
}) {
  void _placement;
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const update = () => {
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      if (!mobile) {
        setDocked(false);
        return;
      }
      const rect = anchor.getBoundingClientRect();
      // Spinner still has a meaningful chunk on screen → keep SPIN under it.
      const visible = rect.bottom > 80 && rect.top < window.innerHeight - 72;
      setDocked(!visible);
    };

    update();
    const io = new IntersectionObserver(update, {
      root: null,
      threshold: [0, 0.05, 0.15, 0.3],
      rootMargin: "-72px 0px -72px 0px",
    });
    io.observe(anchor);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  const btnClass =
    "inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-accent-strong px-8 text-lg font-extrabold tracking-wide text-slate-950 transition hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55";

  return (
    <>
      <div
        className={`mt-3 flex w-full justify-center ${docked ? "invisible h-0 overflow-hidden m-0 p-0 sm:visible sm:h-auto sm:overflow-visible" : ""}`}
        aria-hidden={docked ? true : undefined}
      >
        <button
          ref={(el) => {
            if (!docked) assignRef(buttonRef, el);
          }}
          type="button"
          data-et-spin={docked ? undefined : ""}
          onClick={onSpin}
          disabled={canSpin === false || spinning}
          tabIndex={docked ? -1 : undefined}
          className={btnClass}
          aria-busy={spinning}
        >
          {spinning ? "Spinning…" : "SPIN (Space)"}
        </button>
      </div>

      {docked ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-border bg-background/95 px-3 pt-2 backdrop-blur pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden print:hidden">
          <button
            ref={(el) => assignRef(buttonRef, el)}
            type="button"
            data-et-spin=""
            onClick={onSpin}
            disabled={canSpin === false || spinning}
            className={btnClass}
            aria-busy={spinning}
          >
            {spinning ? "Spinning…" : "SPIN (Space)"}
          </button>
        </div>
      ) : null}
    </>
  );
}

export function SpinControls({
  canSpin,
  spinning,
  soundEnabled,
  status,
  spinLength,
  onSpin,
  onReset,
  onToggleSound,
  onSpinLength,
  hideSpinButton = false,
  spinButtonRef,
}: Props) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      {!hideSpinButton ? (
        <StickySpinButton
          canSpin={canSpin}
          spinning={spinning}
          onSpin={onSpin}
          buttonRef={spinButtonRef}
        />
      ) : null}

      <div
        role="radiogroup"
        aria-label="Spin length"
        className="flex flex-wrap items-center justify-center gap-2"
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
              name="spin-length"
              className="sr-only"
              checked={spinLength === id}
              onChange={() => onSpinLength(id)}
            />
            {label}
          </label>
        ))}
      </div>

      <p className="hidden text-center text-xs text-muted pointer-fine:block">
        Tip: press <kbd className="rounded border border-border px-1 font-mono">Space</kbd> to
        spin when the wheel is focused.
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={spinning}
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-2 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset rotation
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Mute spin sound" : "Enable spin sound"}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          Sound {soundEnabled ? "on" : "off"}
        </button>
      </div>
      <p className="text-center text-sm text-muted" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
