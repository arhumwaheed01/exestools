"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";
import {
  DEFAULT_WHEEL_V2_SETTINGS,
  type WheelV2Settings,
} from "@/lib/wheel-v2/settings";
import { TOOL_THEMES } from "@/lib/tools/theme";

type Tab = "during" | "after" | "appearance";

type Props = {
  open: boolean;
  value: WheelV2Settings;
  onCancel: () => void;
  onOk: (next: WheelV2Settings) => void;
  onPreviewTick?: () => void;
  onStopTick?: () => void;
  onPreviewWinner?: () => void;
  onStopWinner?: () => void;
};

export function CustomizeDialog({
  open,
  value,
  onCancel,
  onOk,
  onPreviewTick,
  onStopTick,
  onPreviewWinner,
  onStopWinner,
}: Props) {
  const titleId = useId();
  const [tab, setTab] = useState<Tab>("during");
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setTab("during");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  const set = <K extends keyof WheelV2Settings>(key: K, v: WheelV2Settings[K]) => {
    setDraft((d) => ({ ...d, [key]: v }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-extrabold text-foreground">
            Customize
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 border-b border-border" role="tablist">
          {(
            [
              ["during", "During spin"],
              ["after", "After spin"],
              ["appearance", "Appearance"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`min-h-11 flex-1 px-2 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:text-sm ${
                tab === id
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
          {tab === "during" ? (
            <div className="space-y-4">
              <Field label="Tick sound">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onPreviewTick}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold"
                  >
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={onStopTick}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold"
                  >
                    Stop
                  </button>
                  <label className="flex flex-1 items-center gap-2 text-xs text-muted">
                    Volume
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={draft.tickVolume}
                      onChange={(e) => set("tickVolume", Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
              </Field>
              <Field label={`Spin time (${draft.spinSeconds}s)`}>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={draft.spinSeconds}
                  onChange={(e) => set("spinSeconds", Number(e.target.value))}
                  className="w-full"
                />
              </Field>
              <Toggle
                label="Spin slowly"
                checked={draft.spinSlowly}
                onChange={(v) => set("spinSlowly", v)}
              />
              <Toggle
                label="Show title"
                checked={draft.showTitle}
                onChange={(v) => set("showTitle", v)}
              />
              <Toggle
                label="Display duplicates"
                checked={draft.displayDuplicates}
                onChange={(v) => set("displayDuplicates", v)}
              />
            </div>
          ) : null}

          {tab === "after" ? (
            <div className="space-y-4">
              <Field label="Winner sound">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onPreviewWinner}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold"
                  >
                    Play
                  </button>
                  <button
                    type="button"
                    onClick={onStopWinner}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold"
                  >
                    Stop
                  </button>
                  <label className="flex flex-1 items-center gap-2 text-xs text-muted">
                    Volume
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={draft.winnerVolume}
                      onChange={(e) => set("winnerVolume", Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
              </Field>
              <Toggle label="Confetti" checked={draft.confetti} onChange={(v) => set("confetti", v)} />
              <Toggle
                label="Animate winning entry"
                checked={draft.animateWinner}
                onChange={(v) => set("animateWinner", v)}
              />
              <Toggle
                label="Auto-remove winner after 5 seconds"
                checked={draft.autoRemoveAfterSec === 5}
                onChange={(v) => set("autoRemoveAfterSec", v ? 5 : 0)}
              />
              <Field label="Popup message">
                <input
                  type="text"
                  value={draft.popupMessage}
                  onChange={(e) => set("popupMessage", e.target.value.slice(0, 80))}
                  className="min-h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </Field>
              <Toggle
                label="Display the Remove button"
                checked={draft.showRemoveButton}
                onChange={(v) => set("showRemoveButton", v)}
              />
            </div>
          ) : null}

          {tab === "appearance" ? (
            <div className="space-y-4">
              <Field label="Theme">
                <div className="flex flex-wrap gap-1.5">
                  <ThemeBtn
                    active={draft.themeId === "auto"}
                    onClick={() => set("themeId", "auto")}
                    label="Auto"
                  />
                  <ThemeBtn
                    active={draft.themeId === "custom"}
                    onClick={() => set("themeId", "custom")}
                    label="Custom"
                  />
                  {TOOL_THEMES.slice(0, 10).map((t) => (
                    <ThemeBtn
                      key={t.id}
                      active={draft.themeId === t.id}
                      onClick={() => set("themeId", t.id)}
                      label={t.label}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Color swatches">
                <div className="flex flex-wrap gap-2">
                  {draft.swatches.map((c, i) => (
                    <label key={i} className="inline-flex flex-col items-center gap-1 text-[10px] text-muted">
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(c) ? c : "#888888"}
                        onChange={(e) => {
                          const next = [...draft.swatches];
                          next[i] = e.target.value;
                          setDraft((d) => ({ ...d, swatches: next, themeId: "custom" }));
                        }}
                        className="h-9 w-9 cursor-pointer rounded border border-border bg-transparent"
                      />
                      {i + 1}
                    </label>
                  ))}
                </div>
                {draft.themeId === "custom" ? (
                  <p className="mt-1 text-[11px] font-semibold text-accent">Theme: Custom</p>
                ) : null}
              </Field>
              <Field label="Center image size">
                <div className="flex gap-2">
                  {(["S", "M", "L"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("centerImageSize", s)}
                      className={`min-h-9 rounded-lg border px-3 text-xs font-bold ${
                        draft.centerImageSize === s
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-surface-2 text-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  Upload a center image from Add image next to Shuffle.
                </p>
              </Field>
              <Field label="Page background">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(draft.pageBg) ? draft.pageBg : "#0b0f17"}
                  onChange={(e) => set("pageBg", e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-border"
                />
              </Field>
              <Toggle
                label="Page gradient"
                checked={draft.pageGradient}
                onChange={(v) => set("pageGradient", v)}
              />
              <Toggle
                label="Wheel contours"
                checked={draft.wheelContours}
                onChange={(v) => set("wheelContours", v)}
              />
              <Toggle label="Shadow" checked={draft.shadow} onChange={(v) => set("shadow", v)} />
              <Toggle
                label="Pointer color change"
                checked={draft.pointerColorChange}
                onChange={(v) => set("pointerColorChange", v)}
              />
              <Field label={`Max names visible on the wheel (${draft.maxNamesVisible})`}>
                <input
                  type="range"
                  min={2}
                  max={60}
                  value={draft.maxNamesVisible}
                  onChange={(e) => set("maxNamesVisible", Number(e.target.value))}
                  className="w-full"
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...DEFAULT_WHEEL_V2_SETTINGS,
                    swatches: [...DEFAULT_WHEEL_V2_SETTINGS.swatches],
                  })
                }
                className="text-xs font-semibold text-accent hover:underline"
              >
                Reset appearance defaults
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onOk(draft)}
            className="inline-flex min-h-11 items-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-foreground">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--t-accent,#22d3ee)]"
      />
    </label>
  );
}

function ThemeBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
        active
          ? "border-accent bg-accent/15 text-foreground"
          : "border-border bg-surface-2 text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
