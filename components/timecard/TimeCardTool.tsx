"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { SegmentedToggle } from "@/components/timecard/SegmentedToggle";
import { TimeCardPrintSheet } from "@/components/timecard/TimeCardPrintSheet";
import { TimePunchInput } from "@/components/timecard/TimePunchInput";
import {
  buildCopySummary,
  buildCsv,
  clearTimeCardStorage,
  computePeriod,
  csvFilename,
  dayTotals,
  formatHhMm,
  freshState,
  isDefaultEmptyState,
  loadTimeCard,
  makeDays,
  MAX_BREAKS_PER_DAY,
  newId,
  resizeDaysForPeriod,
  saveTimeCard,
  weekdayLabel,
  emptyBreak,
  formatPunch,
  type BreakEntry,
  type DayRow,
  type PeriodType,
  type RoundingMode,
  type TimeCardSettings,
  type TimeCardState,
  type WeekStartDay,
} from "@/lib/timecard";
import { track } from "@/lib/track";

const STORAGE_UNAVAILABLE_NOTE =
  "Saving isn't available in this browser, so your card will be cleared when you close the page.";

const fieldCls =
  "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent";
const btnCls =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50";
const btnPrimaryCls =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-3 text-sm font-semibold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50";

function updateDay(days: DayRow[], index: number, next: DayRow): DayRow[] {
  return days.map((d, i) => (i === index ? next : d));
}

export function TimeCardTool() {
  const baseId = useId();
  const [state, setState] = useState<TimeCardState>(() => freshState());
  const [hydrated, setHydrated] = useState(false);
  const [persistNote, setPersistNote] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState(false);
  const [confirmReset, setConfirmReset] = useState<null | "all" | "week">(null);

  useEffect(() => {
    const loaded = loadTimeCard();
    if (loaded.ok) setState(loaded.state);
    else if (loaded.reason === "unavailable") {
      setPersistNote(STORAGE_UNAVAILABLE_NOTE);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (isDefaultEmptyState(state)) {
      clearTimeCardStorage();
      return;
    }
    const result = saveTimeCard(state);
    if (!result.ok && result.unavailable) {
      setPersistNote(STORAGE_UNAVAILABLE_NOTE);
    }
  }, [state, hydrated]);

  const period = useMemo(
    () => computePeriod(state.days, state.settings),
    [state.days, state.settings],
  );

  const setSettings = (patch: Partial<TimeCardSettings>) => {
    setState((prev) => {
      let settings = { ...prev.settings, ...patch };
      let days = prev.days;
      if (patch.period && patch.period !== prev.settings.period) {
        days = resizeDaysForPeriod(days, patch.period);
        track("timecard_period_change", { period: patch.period });
      }
      return { settings, days };
    });
  };

  const onCopy = async () => {
    const text = buildCopySummary(state.days, state.settings);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash(true);
      setTimeout(() => setCopyFlash(false), 2000);
    } catch {
      /* ignore */
    }
    track("timecard_copy", {
      period: state.settings.period,
      rounding: state.settings.rounding,
      overtime: state.settings.dailyOvertime ? "weekly_daily" : state.settings.weeklyOvertime ? "weekly" : "off",
      has_rate: state.settings.hourlyRate != null ? 1 : 0,
    });
  };

  const onCsv = () => {
    const csv = buildCsv(state.days, state.settings);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFilename(state.days.find((d) => d.date)?.date);
    a.click();
    URL.revokeObjectURL(url);
    track("timecard_csv", {
      period: state.settings.period,
      rounding: state.settings.rounding,
      overtime: state.settings.dailyOvertime ? "weekly_daily" : state.settings.weeklyOvertime ? "weekly" : "off",
      has_rate: state.settings.hourlyRate != null ? 1 : 0,
    });
  };

  const onPrint = () => {
    track("timecard_print", {
      period: state.settings.period,
      rounding: state.settings.rounding,
      overtime: state.settings.dailyOvertime ? "weekly_daily" : state.settings.weeklyOvertime ? "weekly" : "off",
      has_rate: state.settings.hourlyRate != null ? 1 : 0,
    });
    window.print();
  };

  const onResetAll = () => {
    clearTimeCardStorage();
    setState(freshState());
    setConfirmReset(null);
    track("timecard_reset", { period: state.settings.period, scope: "all" });
  };

  const onResetWeek = () => {
    setState((prev) => ({
      settings: { ...prev.settings, hourlyRate: null },
      days: makeDays(prev.settings.period),
    }));
    setConfirmReset(null);
    track("timecard_reset", { period: state.settings.period, scope: "week" });
  };

  return (
    <div className="timecard-tool space-y-4">
      <div className="timecard-interactive space-y-4 print:hidden">
        {/* Settings */}
        <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-bold text-foreground">Timesheet settings</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <fieldset>
              <legend className="text-xs font-semibold text-muted">Period</legend>
              <div className="mt-1 flex gap-2">
                {(["week", "biweekly"] as PeriodType[]).map((p) => (
                  <SegmentedToggle
                    key={p}
                    className="flex-1"
                    pressed={state.settings.period === p}
                    onClick={() => setSettings({ period: p })}
                  >
                    {p === "week" ? "Week" : "Biweekly"}
                  </SegmentedToggle>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs font-semibold text-muted">
              Workweek starts
              <select
                className={`${fieldCls} mt-1`}
                value={state.settings.weekStart}
                onChange={(e) => setSettings({ weekStart: Number(e.target.value) as WeekStartDay })}
              >
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (name, i) => (
                    <option key={name} value={i}>
                      {name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <fieldset>
              <legend className="text-xs font-semibold text-muted">Clock</legend>
              <div className="mt-1 flex gap-2">
                {(["12h", "24h"] as const).map((f) => (
                  <SegmentedToggle
                    key={f}
                    className="flex-1"
                    pressed={state.settings.clockFormat === f}
                    onClick={() => setSettings({ clockFormat: f })}
                  >
                    {f === "12h" ? "12-hour" : "24-hour"}
                  </SegmentedToggle>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs font-semibold text-muted">
              Rounding
              <select
                className={`${fieldCls} mt-1`}
                value={state.settings.rounding}
                onChange={(e) => setSettings({ rounding: e.target.value as RoundingMode })}
              >
                <option value="off">No rounding</option>
                <option value="5">Nearest 5 minutes</option>
                <option value="6">Nearest 6 minutes</option>
                <option value="15">Nearest 15 minutes</option>
              </select>
            </label>

            <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[var(--accent)]"
                checked={state.settings.weeklyOvertime}
                onChange={(e) => setSettings({ weeklyOvertime: e.target.checked })}
              />
              Weekly overtime (over 40 hours)
            </label>

            <label className="flex min-h-11 items-start gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-[var(--accent)]"
                checked={state.settings.dailyOvertime}
                onChange={(e) => setSettings({ dailyOvertime: e.target.checked })}
              />
              <span>
                Daily overtime (over 8 hours in a day). Some states use a daily rule; this is only a
                math helper.
              </span>
            </label>

            <label className="block text-xs font-semibold text-muted sm:col-span-2 lg:col-span-1">
              Hourly rate (optional)
              <div className="mt-1 flex items-center gap-2">
                <span className="text-muted" aria-hidden>
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="Leave blank"
                  className={fieldCls}
                  value={state.settings.hourlyRate ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") setSettings({ hourlyRate: null });
                    else {
                      const n = Number(v);
                      if (Number.isFinite(n) && n >= 0) setSettings({ hourlyRate: n });
                    }
                  }}
                />
              </div>
            </label>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Breaks you add here are treated as unpaid and come out of the day’s hours. If a break is
            paid at your job, don’t add it.
          </p>
          {persistNote ? (
            <p className="mt-2 text-xs text-muted" role="status">
              {persistNote}
            </p>
          ) : null}
        </section>

        {/* Day rows */}
        <div className="space-y-3">
          {state.days.map((day, index) => (
            <DayCard
              key={day.id}
              baseId={`${baseId}-${index}`}
              index={index}
              day={day}
              settings={state.settings}
              weekNumber={state.settings.period === "biweekly" ? (index < 7 ? 1 : 2) : null}
              onChange={(next) => setState((s) => ({ ...s, days: updateDay(s.days, index, next) }))}
            />
          ))}
        </div>

        {state.settings.period === "biweekly" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {period.weeks.map((w, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                <p className="font-semibold text-foreground">Week {i + 1} subtotal</p>
                <p className="mt-1 text-muted">
                  {formatHhMm(w.totalMinutes)} ({w.totalDecimal.toFixed(2)}h) · regular{" "}
                  {w.regularDecimal.toFixed(2)} · OT {w.overtimeDecimal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimaryCls} onClick={onCopy}>
            {copyFlash ? "Copied" : "Copy summary"}
          </button>
          <button type="button" className={btnCls} onClick={onPrint}>
            Print / Save as PDF
          </button>
          <button type="button" className={btnCls} onClick={onCsv}>
            Download CSV
          </button>
          <button type="button" className={btnCls} onClick={() => setConfirmReset("week")}>
            Reset week
          </button>
          <button type="button" className={btnCls} onClick={() => setConfirmReset("all")}>
            Reset all
          </button>
        </div>

        {confirmReset ? (
          <div
            className="rounded-xl border border-border bg-surface p-4 text-sm"
            role="alertdialog"
            aria-labelledby={`${baseId}-reset-title`}
          >
            <p id={`${baseId}-reset-title`} className="font-semibold text-foreground">
              {confirmReset === "all" ? "Clear this timesheet?" : "Clear the week’s times?"}
            </p>
            <p className="mt-1 text-muted">
              {confirmReset === "all"
                ? "This removes the saved card in this browser only."
                : "Clears day rows and the hourly rate. Settings stay the same."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={btnPrimaryCls}
                onClick={confirmReset === "all" ? onResetAll : onResetWeek}
              >
                Reset
              </button>
              <button type="button" className={btnCls} onClick={() => setConfirmReset(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {/* Sticky summary — compact on mobile when daily OT + rate add extra rows */}
        <div className="sticky bottom-2 z-20 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur sm:p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted sm:text-xs">
            Summary
          </p>
          <dl
            className={`mt-1.5 grid gap-x-3 gap-y-1 text-xs sm:mt-2 sm:gap-x-6 sm:text-sm ${
              state.settings.dailyOvertime
                ? "grid-cols-3 sm:grid-cols-4"
                : "grid-cols-3 sm:grid-cols-4"
            }`}
          >
            <div>
              <dt className="text-muted">Regular</dt>
              <dd className="font-semibold text-foreground">
                {formatHhMm(period.period.regularMinutes)}
                <span className="hidden sm:inline">
                  {" "}
                  ({period.period.regularDecimal.toFixed(2)})
                </span>
              </dd>
            </div>
            {state.settings.dailyOvertime ? (
              <>
                <div>
                  <dt className="text-muted">
                    <span className="sm:hidden">Daily OT</span>
                    <span className="hidden sm:inline">Daily overtime</span>
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {formatHhMm(period.period.dailyOvertimeMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">
                    <span className="sm:hidden">Weekly OT</span>
                    <span className="hidden sm:inline">Weekly overtime</span>
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {formatHhMm(period.period.weeklyOvertimeMinutes)}
                  </dd>
                </div>
              </>
            ) : (
              <div>
                <dt className="text-muted">Overtime</dt>
                <dd className="font-semibold text-foreground">
                  {formatHhMm(period.period.overtimeMinutes)}
                  <span className="hidden sm:inline">
                    {" "}
                    ({period.period.overtimeDecimal.toFixed(2)})
                  </span>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Total</dt>
              <dd className="font-semibold text-foreground">
                {formatHhMm(period.period.totalMinutes)}
                <span className="hidden sm:inline">
                  {" "}
                  ({period.period.totalDecimal.toFixed(2)})
                </span>
              </dd>
            </div>
            {period.grossPay != null ? (
              <div>
                <dt className="text-muted">
                  <span className="sm:hidden">Gross (no tax)</span>
                  <span className="hidden sm:inline">Estimated gross pay (no tax)</span>
                </dt>
                <dd className="font-semibold text-foreground">${period.grossPay.toFixed(2)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        {period.grossPay != null ? (
          <p className="text-xs text-muted">
            This is hours times your rate only. It does not take out tax, benefits, or other
            deductions, and it is not a paycheck.
          </p>
        ) : null}
      </div>

      <TimeCardPrintSheet days={state.days} settings={state.settings} />
    </div>
  );
}

function DayCard({
  baseId,
  index,
  day,
  settings,
  weekNumber,
  onChange,
}: {
  baseId: string;
  index: number;
  day: DayRow;
  settings: TimeCardSettings;
  weekNumber: 1 | 2 | null;
  onChange: (next: DayRow) => void;
}) {
  const totals = dayTotals(day, settings);
  const label = weekdayLabel(settings.weekStart, index % 7);

  const setBreak = (bi: number, next: BreakEntry) => {
    onChange({ ...day, breaks: day.breaks.map((b, i) => (i === bi ? next : b)) });
  };

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`${baseId}-title`} className="text-base font-bold text-foreground">
          {weekNumber ? `Week ${weekNumber} · ` : null}
          {label}
        </h3>
        {totals.status.kind === "ok" ? (
          <p className="text-sm font-semibold text-foreground">
            {formatHhMm(totals.netMinutes)}{" "}
            <span className="font-normal text-muted">({totals.netDecimal.toFixed(2)}h)</span>
            {totals.status.overnight ? (
              <span className="ml-2 rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                Overnight shift
              </span>
            ) : null}
            {totals.status.equalTimes ? (
              <span className="ml-2 text-xs font-normal text-muted">
                Start equals end → 0:00 hours
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          Date (optional)
          <input
            type="date"
            className={`${fieldCls} mt-1`}
            value={day.date ?? ""}
            onChange={(e) => onChange({ ...day, date: e.target.value || null })}
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          Note (optional)
          <input
            type="text"
            maxLength={120}
            placeholder="e.g. store close"
            className={`${fieldCls} mt-1`}
            value={day.note}
            onChange={(e) => onChange({ ...day, note: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TimePunchInput
          id={`${baseId}-start`}
          label="Start"
          value={day.start}
          format={settings.clockFormat}
          onChange={(start) => onChange({ ...day, start })}
        />
        <TimePunchInput
          id={`${baseId}-end`}
          label="End"
          value={day.end}
          format={settings.clockFormat}
          onChange={(end) => onChange({ ...day, end })}
        />
      </div>

      {totals.status.kind === "ok" &&
      (totals.status.startRoundedFrom != null || totals.status.endRoundedFrom != null) ? (
        <p className="mt-2 text-xs text-muted" role="status">
          Rounded from{" "}
          {totals.status.startRoundedFrom != null
            ? `start ${formatPunchHint(totals.status.startRoundedFrom, settings.clockFormat)}`
            : null}
          {totals.status.startRoundedFrom != null && totals.status.endRoundedFrom != null
            ? ", "
            : null}
          {totals.status.endRoundedFrom != null
            ? `end ${formatPunchHint(totals.status.endRoundedFrom, settings.clockFormat)}`
            : null}
          .
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-muted">Unpaid breaks</p>
        {day.breaks.map((b, bi) => (
          <div key={b.id} className="rounded-xl border border-border/70 bg-background/40 p-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="block min-w-[6rem] flex-1 text-xs font-semibold text-muted">
                Label
                <input
                  className={`${fieldCls} mt-1`}
                  value={b.label}
                  onChange={(e) => setBreak(bi, { ...b, label: e.target.value })}
                />
              </label>
              <fieldset className="flex gap-1">
                <legend className="sr-only">Break entry mode</legend>
                <SegmentedToggle
                  pressed={b.mode === "duration"}
                  onClick={() => setBreak(bi, { ...b, mode: "duration" })}
                >
                  Length
                </SegmentedToggle>
                <SegmentedToggle
                  pressed={b.mode === "range"}
                  onClick={() => setBreak(bi, { ...b, mode: "range" })}
                >
                  Start/end
                </SegmentedToggle>
              </fieldset>
              {day.breaks.length > 1 ? (
                <button
                  type="button"
                  className={btnCls}
                  onClick={() =>
                    onChange({ ...day, breaks: day.breaks.filter((_, i) => i !== bi) })
                  }
                >
                  Remove
                </button>
              ) : null}
            </div>
            {b.mode === "duration" ? (
              <label className="mt-2 block text-xs font-semibold text-muted">
                Minutes
                <input
                  type="number"
                  min={0}
                  max={24 * 60}
                  className={`${fieldCls} mt-1 max-w-[8rem]`}
                  value={b.durationMinutes ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBreak(bi, {
                      ...b,
                      durationMinutes: v === "" ? null : Math.max(0, Math.round(Number(v)) || 0),
                    });
                  }}
                />
              </label>
            ) : (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <TimePunchInput
                  id={`${baseId}-brk-${bi}-s`}
                  label="Break start"
                  value={b.start}
                  format={settings.clockFormat}
                  onChange={(start) => setBreak(bi, { ...b, start })}
                />
                <TimePunchInput
                  id={`${baseId}-brk-${bi}-e`}
                  label="Break end"
                  value={b.end}
                  format={settings.clockFormat}
                  onChange={(end) => setBreak(bi, { ...b, end })}
                />
              </div>
            )}
          </div>
        ))}
        {day.breaks.length < MAX_BREAKS_PER_DAY ? (
          <button
            type="button"
            className={btnCls}
            onClick={() =>
              onChange({
                ...day,
                breaks: [...day.breaks, emptyBreak(newId("brk"), "Break")],
              })
            }
          >
            Add break
          </button>
        ) : null}
      </div>

      {totals.status.kind === "incomplete" || totals.status.kind === "invalid" ? (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400" role="alert">
          {totals.status.message}
        </p>
      ) : null}
    </section>
  );
}

function formatPunchHint(minutes: number, format: TimeCardSettings["clockFormat"]): string {
  return formatPunch(minutes, format);
}
