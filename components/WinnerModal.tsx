"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EyeOff, RefreshCw, Trophy, X } from "lucide-react";
import { fireCelebrationConfetti } from "@/components/tools/Confetti";

type Props = {
  open: boolean;
  winner: string | null;
  entryCount?: number;
  showRemoveContinue?: boolean;
  titleBarText?: string;
  onClose: () => void;
  /** Quiet dismiss — no next-steps strip. */
  onHide: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
};

export function WinnerModal({
  open,
  winner,
  entryCount,
  showRemoveContinue = true,
  titleBarText = "We have a winner!",
  onClose,
  onHide,
  onSpinAgain,
  onRemoveWinner,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !winner) {
      firedFor.current = null;
      return;
    }
    if (firedFor.current === winner) return;
    firedFor.current = winner;
    fireCelebrationConfetti();
  }, [open, winner]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onHide();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onHide]);

  const subtitle =
    typeof entryCount === "number" && entryCount > 0
      ? `Picked fairly from ${entryCount} ${entryCount === 1 ? "entry" : "entries"}.`
      : "Nice pick! Spin again anytime.";

  return (
    <AnimatePresence>
      {open && winner ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onHide();
          }}
        >
          <motion.div
            className="relative mx-auto w-full max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-border bg-surface text-center shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-center gap-2 text-white">
                <Trophy className="h-5 w-5 drop-shadow" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.2em] drop-shadow">
                  {titleBarText}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-white/90 outline-none hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
              <h2
                id={titleId}
                className="break-words text-3xl font-extrabold text-foreground sm:text-4xl"
              >
                {winner}
              </h2>
              <p className="mt-3 text-sm text-muted">{subtitle}</p>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Close
                </button>
                {showRemoveContinue ? (
                  <button
                    type="button"
                    onClick={onRemoveWinner}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Remove
                  </button>
                ) : (
                  <span className="hidden sm:block" aria-hidden />
                )}
                <button
                  type="button"
                  onClick={onHide}
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <EyeOff className="h-4 w-4" aria-hidden />
                  Hide
                </button>
                <button
                  type="button"
                  onClick={onSpinAgain}
                  className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-accent-strong px-3 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent col-span-2 sm:col-span-1"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Spin again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
