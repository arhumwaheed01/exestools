"use client";

import { TOOL_THEMES, type ToolThemeId } from "@/lib/tools/theme";

const CHOICES: { id: ToolThemeId; label: string; swatch: string[] }[] = [
  {
    id: "auto",
    label: "Auto",
    swatch: ["#0e7490", "#db2777", "#15803d", "#ea580c", "#1d4ed8"],
  },
  ...TOOL_THEMES.map((t) => ({
    id: t.id as ToolThemeId,
    label: t.label,
    swatch: [...t.segs.slice(0, 5)],
  })),
];

export function ThemeChips({
  value,
  onChange,
}: {
  value: ToolThemeId;
  onChange: (next: ToolThemeId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Theme" className="flex flex-wrap gap-2">
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
              name="et-theme"
              className="sr-only"
              checked={checked}
              onChange={() => onChange(c.id)}
            />
            <span aria-hidden className="inline-flex h-5 items-end gap-px">
              {c.swatch.map((color) => (
                <span
                  key={color}
                  className="inline-block h-4 w-1.5 rounded-sm"
                  style={{ background: color }}
                />
              ))}
            </span>
            {c.label}
          </label>
        );
      })}
    </div>
  );
}
