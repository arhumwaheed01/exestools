"use client";

import { SegmentedToggle } from "@/components/timecard/SegmentedToggle";
import { from12h, from24h, to12h, to24h } from "@/lib/timecard/time";
import type { ClockFormat, TimePunch } from "@/lib/timecard/types";

const selectCls =
  "min-h-11 rounded-lg border border-border bg-surface px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent";

type Props = {
  id: string;
  label: string;
  value: TimePunch;
  format: ClockFormat;
  onChange: (next: TimePunch) => void;
  disabled?: boolean;
};

export function TimePunchInput({ id, label, value, format, onChange, disabled }: Props) {
  const empty = value.minutes == null;

  if (format === "24h") {
    const { hour24, minute } = empty ? { hour24: 9, minute: 0 } : to24h(value.minutes!);
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted" id={`${id}-label`}>
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={`${id}-label`}>
          <select
            className={selectCls}
            aria-label={`${label} hour`}
            disabled={disabled}
            value={empty ? "" : String(hour24)}
            onChange={(e) => {
              if (e.target.value === "") {
                onChange({ minutes: null });
                return;
              }
              const h = Number(e.target.value);
              onChange({ minutes: from24h(h, empty ? 0 : minute) });
            }}
          >
            <option value="">—</option>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-muted" aria-hidden>
            :
          </span>
          <select
            className={selectCls}
            aria-label={`${label} minute`}
            disabled={disabled || empty}
            value={empty ? "0" : String(minute)}
            onChange={(e) => {
              if (empty) return;
              onChange({ minutes: from24h(hour24, Number(e.target.value)) });
            }}
          >
            {Array.from({ length: 60 }, (_, m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const { hour12, minute, isPm } = empty
    ? { hour12: 9, minute: 0, isPm: false }
    : to12h(value.minutes!);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-muted" id={`${id}-label`}>
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-labelledby={`${id}-label`}>
        <select
          className={selectCls}
          aria-label={`${label} hour`}
          disabled={disabled}
          value={empty ? "" : String(hour12)}
          onChange={(e) => {
            if (e.target.value === "") {
              onChange({ minutes: null });
              return;
            }
            const h = Number(e.target.value);
            onChange({ minutes: from12h(h, empty ? 0 : minute, empty ? false : isPm) });
          }}
        >
          <option value="">—</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-muted" aria-hidden>
          :
        </span>
        <select
          className={selectCls}
          aria-label={`${label} minute`}
          disabled={disabled || empty}
          value={empty ? "0" : String(minute)}
          onChange={(e) => {
            if (empty) return;
            onChange({ minutes: from12h(hour12, Number(e.target.value), isPm) });
          }}
        >
          {Array.from({ length: 60 }, (_, m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
        <div className="flex gap-1" role="group" aria-label={`${label} AM or PM`}>
          <SegmentedToggle
            className="min-w-11 px-2"
            disabled={disabled || empty}
            pressed={!empty && !isPm}
            onClick={() => {
              if (empty) return;
              onChange({ minutes: from12h(hour12, minute, false) });
            }}
          >
            AM
          </SegmentedToggle>
          <SegmentedToggle
            className="min-w-11 px-2"
            disabled={disabled || empty}
            pressed={!empty && isPm}
            onClick={() => {
              if (empty) return;
              onChange({ minutes: from12h(hour12, minute, true) });
            }}
          >
            PM
          </SegmentedToggle>
        </div>
      </div>
    </div>
  );
}
