"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Trophy, X } from "lucide-react";
import { fireCelebrationConfetti } from "@/components/tools/Confetti";

type Props = {
  open: boolean;
  winner: string | null;
  entryCount?: number;
  showRemoveContinue?: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
};

export function WinnerModal({
  open,
  winner,
  entryCount,
  showRemoveContinue = true,
  onClose,
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
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

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
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative mx-auto w-full max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl sm:p-8"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 shadow-[0_0_32px_rgba(251,191,36,0.45)]">
              <Trophy className="h-8 w-8 text-amber-300" aria-hidden />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-accent">
              We have a winner
            </p>
            <h2
              id={titleId}
              className="mt-2 break-words text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              Winner: {winner}
            </h2>
            <p className="mt-3 text-sm text-muted">{subtitle}</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onSpinAgain}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-strong px-5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Spin again
              </button>
              {showRemoveContinue ? (
                <button
                  type="button"
                  onClick={onRemoveWinner}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-2 px-5 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Remove winner
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
