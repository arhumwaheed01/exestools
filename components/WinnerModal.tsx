"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  winner: string | null;
  /** When remove-winner is already on, the winner is off the list — hide the redundant button. */
  showRemoveContinue?: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
};

export function WinnerModal({
  open,
  winner,
  showRemoveContinue = true,
  onClose,
  onSpinAgain,
  onRemoveWinner,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

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
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl sm:p-8"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {!reduceMotion ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="confetti-piece absolute h-2.5 w-2 rounded-sm"
                    style={{
                      left: `${(i * 17) % 100}%`,
                      top: `${(i * 11) % 40}%`,
                      background: ["#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"][i % 5],
                      animationDelay: `${i * 0.04}s`,
                    }}
                  />
                ))}
              </div>
            ) : null}

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Winner</p>
            <h2
              id={titleId}
              className="mt-2 break-words text-3xl font-extrabold text-foreground sm:text-4xl"
            >
              {winner}
            </h2>
            <p className="mt-3 text-sm text-muted">Nice pick! Spin again anytime.</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <button
                type="button"
                onClick={onSpinAgain}
                className="rounded-xl bg-accent-strong px-5 py-3 text-sm font-bold text-slate-950 hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Spin again
              </button>
              {showRemoveContinue ? (
                <button
                  type="button"
                  onClick={onRemoveWinner}
                  className="rounded-xl border border-border bg-surface-2 px-5 py-3 text-sm font-bold text-foreground hover:bg-border outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Remove &amp; continue
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-background px-5 py-3 text-sm font-bold text-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
