"use client";

import { THEMES, type ThemeChoice, type ThemeId } from "@/lib/bingo/themes";

function Swatch({ themeId }: { themeId: ThemeId | "auto" }) {
  if (themeId === "auto") {
    return (
      <span
        aria-hidden
        className="inline-flex h-7 w-7 items-end justify-center gap-px rounded-md bg-surface-2 p-1"
      >
        {["#0e7490", "#b91c1c", "#6b21a8", "#1d4ed8", "#047857"].map((c) => (
          <span key={c} className="h-4 w-1 rounded-sm" style={{ background: c }} />
        ))}
      </span>
    );
  }
  const meta = THEMES.find((t) => t.id === themeId)!;
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 flex-col overflow-hidden rounded-md"
      style={{ background: meta.band }}
    >
      <span className="flex flex-1 items-end justify-center gap-px px-0.5 pb-0.5">
        {meta.letters.map((c, i) => (
          <span key={i} className="h-3.5 w-1 rounded-sm" style={{ background: c }} />
        ))}
      </span>
    </span>
  );
}

const CHOICES: { id: ThemeChoice; label: string }[] = [
  { id: "auto", label: "Auto" },
  ...THEMES.map((t) => ({ id: t.id as ThemeChoice, label: t.label })),
];

export function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeChoice;
  onChange: (next: ThemeChoice) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Card style" className="mt-2 flex flex-wrap gap-2">
      {CHOICES.map((c) => {
        const checked = value === c.id;
        return (
          <label
            key={c.id}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border py-1 pl-1.5 pr-3 text-xs font-bold outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
              checked ? "bg-accent/10 ring-2 ring-accent" : "hover:bg-surface-2"
            }`}
          >
            <input
              type="radio"
              name="bg-theme"
              className="sr-only"
              checked={checked}
              onChange={() => onChange(c.id)}
            />
            <Swatch themeId={c.id === "auto" ? "auto" : c.id} />
            {c.label}
          </label>
        );
      })}
    </div>
  );
}
