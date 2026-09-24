"use client";

import { ClipboardCopy, Eraser, RotateCcw, Shuffle } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  text: string;
  count: number;
  disabled?: boolean;
  duplicatesSkipped?: number;
  onChange: (text: string) => void;
  onShuffle: () => void;
  onClear: () => void;
  onRestoreDefaults: () => void;
  onCopy: () => void;
};

export function ChoicesEditor({
  text,
  count,
  disabled,
  duplicatesSkipped = 0,
  onChange,
  onShuffle,
  onClear,
  onRestoreDefaults,
  onCopy,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">Your choices</h2>
          <p className="mt-0.5 text-xs text-muted">
            One name/option per line. Empty lines ignored. Duplicate lines are skipped
            (case-insensitive)—add an initial if two people share a name.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-foreground">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      <label className="sr-only" htmlFor="choices-textarea">
        Choices list
      </label>
      <textarea
        id="choices-textarea"
        value={text}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        spellCheck={false}
        placeholder={"Alex\nJordan\nSam\n…"}
        className="min-h-[220px] w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm leading-relaxed text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
      />

      {duplicatesSkipped > 0 ? (
        <p className="text-xs font-medium text-amber-300" role="status">
          {duplicatesSkipped} duplicate line{duplicatesSkipped === 1 ? "" : "s"} skipped.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ActionBtn disabled={disabled} onClick={onShuffle} icon={<Shuffle className="h-3.5 w-3.5" />} label="Shuffle" />
        <ActionBtn disabled={disabled} onClick={onCopy} icon={<ClipboardCopy className="h-3.5 w-3.5" />} label="Copy" />
        <ActionBtn
          disabled={disabled}
          onClick={onRestoreDefaults}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          label="Defaults"
        />
        <ActionBtn
          disabled={disabled}
          onClick={onClear}
          icon={<Eraser className="h-3.5 w-3.5" />}
          label="Clear all"
          danger
        />
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
        danger
          ? "bg-rose-950/60 text-rose-300 hover:bg-rose-900/70"
          : "bg-surface-2 text-foreground hover:bg-border"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
