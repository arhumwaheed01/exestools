"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { SegmentedToggle } from "@/components/timecard/SegmentedToggle";
import {
  combineWeeks,
  computeWeek,
  dayLabelsForWorkweek,
  formatHours,
  formatMoney,
  parseDayHours,
  type OtRule,
  type PeriodKind,
  type WeekMoney,
} from "@/lib/overtime";
import { track } from "@/lib/track";

const fieldCls =
  "min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent tabular-nums";
const btnCls =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50";
const btnPrimaryCls =
  "inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-3 text-sm font-semibold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 lg:w-auto lg:min-w-[14rem]";

const EMPTY_WEEK = ["", "", "", "", "", "", ""] as const;

type WeekFields = {
  hours: string[];
  bonus: string;
};

function blankWeek(): WeekFields {
  return { hours: [...EMPTY_WEEK], bonus: "" };
}

function parseWeekHours(raw: string[]): { hours: number[]; error: boolean } {
  const hours: number[] = [];
  for (const cell of raw) {
    const v = parseDayHours(cell);
    if (v == null) return { hours: [], error: true };
    hours.push(v);
  }
  return { hours, error: false };
}

export function OvertimeTool() {
  const baseId = useId();
  const [rule, setRule] = useState<OtRule>("federal");
  const [period, setPeriod] = useState<PeriodKind>("one_week");
  const [workweekStarts, setWorkweekStarts] = useState(0);
  const [rate, setRate] = useState("");
  const [m1, setM1] = useState("1.5");
  const [m2, setM2] = useState("2");
  const [dailyLimit, setDailyLimit] = useState("8");
  const [doubleAfter, setDoubleAfter] = useState("");
  const [week1, setWeek1] = useState<WeekFields>(blankWeek);
  const [week2, setWeek2] = useState<WeekFields>(blankWeek);
  const [calculated, setCalculated] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);

  const dayLabels = useMemo(() => dayLabelsForWorkweek(workweekStarts), [workweekStarts]);

  const live = useMemo(() => {
    if (!calculated) return null;

    const rateN = Number(rate);
    const m1N = Number(m1);
    const m2N = Number(m2);
    if (!Number.isFinite(rateN) || rateN < 0.01 || rateN > 1000) return null;
    if (!Number.isFinite(m1N) || m1N < 1 || m1N > 4) return null;
    if (!Number.isFinite(m2N) || m2N < m1N || m2N > 4) return null;

    let dailyLim = 8;
    let dtAfter: number | null = null;
    if (rule === "daily_weekly") {
      dailyLim = Number(dailyLimit);
      if (!Number.isFinite(dailyLim) || dailyLim < 1 || dailyLim > 24) return null;
      if (doubleAfter.trim()) {
        const d = Number(doubleAfter);
        if (!Number.isFinite(d) || d <= dailyLim || d > 24) return null;
        dtAfter = d;
      }
    }

    const w1p = parseWeekHours(week1.hours);
    if (w1p.error) {
      return { error: "day_over_24" as const, warnings: [] as string[] };
    }
    const bonus1 = rule === "california" ? 0 : Number(week1.bonus) || 0;

    const r1 = computeWeek({
      rule,
      hours: w1p.hours,
      rate: rateN,
      m1: m1N,
      m2: m2N,
      bonus: bonus1,
      dailyLimit: dailyLim,
      doubleTimeAfter: dtAfter,
    });
    if (!r1.ok) return { error: r1.error, warnings: r1.warnings };

    const weeks: WeekMoney[] = [r1.week];
    const warnings = [...r1.warnings];

    if (period === "two_weeks") {
      const w2p = parseWeekHours(week2.hours);
      if (w2p.error) {
        return { error: "day_over_24" as const, warnings };
      }
      const bonus2 = rule === "california" ? 0 : Number(week2.bonus) || 0;
      const r2 = computeWeek({
        rule,
        hours: w2p.hours,
        rate: rateN,
        m1: m1N,
        m2: m2N,
        bonus: bonus2,
        dailyLimit: dailyLim,
        doubleTimeAfter: dtAfter,
      });
      if (!r2.ok) return { error: r2.error, warnings: [...warnings, ...r2.warnings] };
      weeks.push(r2.week);
      warnings.push(...r2.warnings);
    }

    const periodTotal = combineWeeks(weeks);
    return {
      error: null as null,
      weeks,
      period: periodTotal,
      warnings: [...new Set(warnings)],
      m1: m1N,
      m2: m2N,
      rate: rateN,
      rule,
    };
  }, [
    calculated,
    rule,
    period,
    rate,
    m1,
    m2,
    dailyLimit,
    doubleAfter,
    week1,
    week2,
  ]);

  useEffect(() => {
    if (!copyFlash) return;
    const t = window.setTimeout(() => setCopyFlash(false), 1600);
    return () => window.clearTimeout(t);
  }, [copyFlash]);

  const onCalculate = () => {
    setCalculated(true);
    const hasBonus =
      rule !== "california" &&
      ((Number(week1.bonus) || 0) > 0 || (period === "two_weeks" && (Number(week2.bonus) || 0) > 0));
    const customMult = Number(m1) !== 1.5 || Number(m2) !== 2;
    track("overtime_calculate", {
      rule,
      period,
      has_bonus: hasBonus ? 1 : 0,
      custom_multiplier: customMult ? 1 : 0,
    });
  };

  const onClear = () => {
    setRule("federal");
    setPeriod("one_week");
    setWorkweekStarts(0);
    setRate("");
    setM1("1.5");
    setM2("2");
    setDailyLimit("8");
    setDoubleAfter("");
    setWeek1(blankWeek());
    setWeek2(blankWeek());
    setCalculated(false);
  };

  const buildCopyText = (): string => {
    if (!live || live.error || !live.period) return "";
    const p = live.period;
    const ruleLabel =
      live.rule === "federal"
        ? "Federal rule"
        : live.rule === "california"
          ? "California rule"
          : "Daily and weekly rule";
    const lines = [
      `Overtime pay, week of hours entered (${ruleLabel})`,
      `Regular ${formatHours(p.reg)} h × ${formatMoney(live.rate)} = ${formatMoney(p.regularPay)}`,
      `Overtime ${formatHours(p.ot)} h × ${formatMoney(live.rate * live.m1)} = ${formatMoney(p.overtimePay)}`,
    ];
    if (p.dt > 0) {
      lines.push(
        `Double time ${formatHours(p.dt)} h × ${formatMoney(live.rate * live.m2)} = ${formatMoney(p.doubleTimePay)}`,
      );
    }
    if (p.bonus > 0) {
      lines.push(`Bonus ${formatMoney(p.bonus)} + overtime on bonus ${formatMoney(p.bonusOT)}`);
    }
    lines.push(`Gross pay ${formatMoney(p.gross)}`);
    lines.push(`Extra half on hours over 40: ${formatMoney(p.extraHalf)}`);
    lines.push("Made with exestools.com/overtime-calculator");
    return lines.join("\n");
  };

  const onCopy = async () => {
    const text = buildCopyText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlash(true);
    } catch {
      /* ignore */
    }
  };

  const setHour = (week: 1 | 2, index: number, value: string) => {
    const setter = week === 1 ? setWeek1 : setWeek2;
    setter((prev) => {
      const hours = [...prev.hours];
      hours[index] = value;
      return { ...prev, hours };
    });
  };

  const weekTotal = (fields: WeekFields) => {
    let sum = 0;
    for (const cell of fields.hours) {
      const v = parseDayHours(cell);
      if (v == null) return null;
      sum += v;
    }
    return sum;
  };

  const renderDayGrid = (week: 1 | 2, fields: WeekFields) => {
    const prefix = week === 1 ? "hours-w1" : "hours-w2";
    const total = weekTotal(fields);
    return (
      <div className="mt-4">
        {period === "two_weeks" ? (
          <h3 className="text-sm font-bold text-foreground">Week {week}</h3>
        ) : null}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {dayLabels.map((label, i) => {
            const id = `${baseId}-${prefix}-d${i + 1}`;
            const name = `${prefix}-d${i + 1}`;
            return (
              <div key={name}>
                <label htmlFor={id} className="block text-xs font-semibold text-muted">
                  {label} hours
                </label>
                <input
                  id={id}
                  name={name}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0"
                  value={fields.hours[i] ?? ""}
                  onChange={(e) => setHour(week, i, e.target.value)}
                  className={`mt-1 ${fieldCls}`}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">
          Total this week:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {total == null ? "—" : `${formatHours(total)} h`}
          </span>
        </p>
        {rule !== "california" ? (
          <div className="mt-3 max-w-xs">
            <label
              htmlFor={`${baseId}-bonus-w${week}`}
              className="block text-xs font-semibold text-muted"
            >
              Bonus earned this week ($)
            </label>
            <input
              id={`${baseId}-bonus-w${week}`}
              name={`bonus-w${week}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={fields.bonus}
              onChange={(e) => {
                const v = e.target.value;
                if (week === 1) setWeek1((p) => ({ ...p, bonus: v }));
                else setWeek2((p) => ({ ...p, bonus: v }));
              }}
              className={`mt-1 ${fieldCls}`}
            />
            <p className="mt-1 text-xs text-muted">
              Only bonuses you were promised for attendance, output or targets. Leave gifts and
              surprise bonuses out.
            </p>
          </div>
        ) : null}
      </div>
    );
  };

  const showSticky = calculated && live && !live.error && live.period;

  return (
    <div className="overtime-tool">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <section
            aria-labelledby={`${baseId}-settings`}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <h2 id={`${baseId}-settings`} className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Overtime pay settings
            </h2>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-foreground">Rule</legend>
              <div className="mt-2 grid gap-2" role="radiogroup" aria-label="Overtime rule">
                {(
                  [
                    ["federal", "Federal: over 40 hours a week"],
                    ["daily_weekly", "Daily and weekly"],
                    ["california", "California"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={[
                      "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold",
                      rule === value
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-surface-2 text-muted hover:border-accent",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="ot-rule"
                      value={value}
                      checked={rule === value}
                      onChange={() => setRule(value)}
                      className="h-4 w-4 accent-accent"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {rule === "daily_weekly" ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${baseId}-daily-limit`} className="block text-xs font-semibold text-muted">
                    Overtime after __ hours in a day
                  </label>
                  <input
                    id={`${baseId}-daily-limit`}
                    name="daily-limit"
                    type="number"
                    min={1}
                    max={24}
                    step={0.5}
                    inputMode="decimal"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className={`mt-1 ${fieldCls}`}
                  />
                </div>
                <div>
                  <label htmlFor={`${baseId}-double-after`} className="block text-xs font-semibold text-muted">
                    Double time after __ hours in a day
                  </label>
                  <input
                    id={`${baseId}-double-after`}
                    name="double-after"
                    type="number"
                    min={1}
                    max={24}
                    step={0.5}
                    inputMode="decimal"
                    placeholder="Off"
                    value={doubleAfter}
                    onChange={(e) => setDoubleAfter(e.target.value)}
                    className={`mt-1 ${fieldCls}`}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground">Pay period</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Pay period">
                <SegmentedToggle
                  pressed={period === "one_week"}
                  onClick={() => setPeriod("one_week")}
                  className="min-h-11 flex-1 sm:flex-none"
                >
                  One week
                </SegmentedToggle>
                <SegmentedToggle
                  pressed={period === "two_weeks"}
                  onClick={() => setPeriod("two_weeks")}
                  className="min-h-11 flex-1 sm:flex-none"
                >
                  Two weeks
                </SegmentedToggle>
              </div>
            </div>

            <div className="mt-4 max-w-xs">
              <label htmlFor={`${baseId}-week-start`} className="block text-xs font-semibold text-muted">
                Workweek starts
              </label>
              <select
                id={`${baseId}-week-start`}
                name="workweek-starts"
                value={workweekStarts}
                onChange={(e) => setWorkweekStarts(Number(e.target.value))}
                className={`mt-1 ${fieldCls}`}
              >
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor={`${baseId}-rate`} className="block text-xs font-semibold text-muted">
                Hourly rate ($)
              </label>
              <input
                id={`${baseId}-rate`}
                name="hourly-rate"
                type="text"
                inputMode="decimal"
                required
                autoComplete="off"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className={`mt-1 max-w-xs ${fieldCls}`}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 max-w-md">
              <div>
                <label htmlFor={`${baseId}-m1`} className="block text-xs font-semibold text-muted">
                  Overtime multiplier
                </label>
                <input
                  id={`${baseId}-m1`}
                  name="ot-multiplier"
                  type="number"
                  min={1}
                  max={4}
                  step={0.05}
                  inputMode="decimal"
                  value={m1}
                  onChange={(e) => setM1(e.target.value)}
                  className={`mt-1 ${fieldCls}`}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-m2`} className="block text-xs font-semibold text-muted">
                  Double-time multiplier
                </label>
                <input
                  id={`${baseId}-m2`}
                  name="dt-multiplier"
                  type="number"
                  min={1}
                  max={4}
                  step={0.05}
                  inputMode="decimal"
                  value={m2}
                  onChange={(e) => setM2(e.target.value)}
                  className={`mt-1 ${fieldCls}`}
                />
              </div>
            </div>

            <p className="mt-5 text-sm text-muted">
              Only have clock-in and clock-out times? Add them up on the{" "}
              <Link href="/time-card-calculator" className="font-semibold text-accent hover:underline">
                time card calculator
              </Link>
              , then type the daily totals here.
            </p>

            {renderDayGrid(1, week1)}
            {period === "two_weeks" ? renderDayGrid(2, week2) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <button type="button" className={btnPrimaryCls} onClick={onCalculate}>
                Calculate overtime pay
              </button>
              <button type="button" className={btnCls} onClick={onClear}>
                Clear
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <ResultsCard
            baseId={baseId}
            calculated={calculated}
            live={live}
            dayLabels={dayLabels}
            period={period}
            copyFlash={copyFlash}
            onCopy={onCopy}
            onPrint={() => window.print()}
          />
        </div>
      </div>

      {showSticky ? (
        <>
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur print:hidden lg:hidden"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            aria-live="polite"
          >
            Gross {formatMoney(live.period.gross)} · OT {formatHours(live.period.ot)} h
          </div>
          <div className="h-14 print:hidden lg:hidden" aria-hidden />
        </>
      ) : null}

      <PrintSheet
        calculated={calculated}
        live={live}
        dayLabels={dayLabels}
        period={period}
        rate={rate}
        m1={m1}
        m2={m2}
        rule={rule}
        week1={week1}
        week2={week2}
        dailyLimit={dailyLimit}
        doubleAfter={doubleAfter}
        workweekStarts={workweekStarts}
      />
    </div>
  );
}

type LiveOk = {
  error: null;
  weeks: WeekMoney[];
  period: WeekMoney;
  warnings: string[];
  m1: number;
  m2: number;
  rate: number;
  rule: OtRule;
};

type LiveErr = { error: "day_over_24"; warnings: string[] };

function ResultsCard({
  baseId,
  calculated,
  live,
  dayLabels,
  period,
  copyFlash,
  onCopy,
  onPrint,
}: {
  baseId: string;
  calculated: boolean;
  live: LiveOk | LiveErr | null;
  dayLabels: string[];
  period: PeriodKind;
  copyFlash: boolean;
  onCopy: () => void;
  onPrint: () => void;
}) {
  return (
    <section
      aria-labelledby={`${baseId}-results`}
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5 lg:sticky lg:top-20"
    >
      <h2 id={`${baseId}-results`} className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Your overtime pay breakdown
      </h2>

      {!calculated || !live ? (
        <p className="mt-3 text-sm text-muted">
          Enter your hours and rate, then press Calculate overtime pay.
        </p>
      ) : live.error === "day_over_24" ? (
        <p className="mt-3 text-sm text-foreground" role="status">
          A day can&apos;t have more than 24 hours.
        </p>
      ) : (
        <>
          {live.warnings.map((w) => (
            <p key={w} className="mt-3 text-sm text-foreground" role="status">
              {w}
            </p>
          ))}

          <SummaryTable
            week={live.period}
            rate={live.rate}
            m1={live.m1}
            m2={live.m2}
            rule={live.rule}
          />

          <div className="mt-4 space-y-1 text-sm text-muted">
            {live.period.regularRate != null ? (
              <p>
                Regular rate this week:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatMoney(live.period.regularRate)}
                </span>
              </p>
            ) : null}
            <p>
              Extra half on hours over 40:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatMoney(live.period.extraHalf)}
              </span>
              <span className="block text-xs">
                the part of overtime pay the 2025–2028 federal overtime deduction is based on.
                Estimate only, not tax advice.
              </span>
            </p>
            {live.period.avgPerHour != null ? (
              <p>
                Average per hour worked:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatMoney(live.period.avgPerHour)}
                </span>
              </p>
            ) : null}
          </div>

          {live.weeks.map((w, wi) => (
            <DayTable
              key={wi}
              week={w}
              dayLabels={dayLabels}
              caption={
                period === "two_weeks" ? `Hours by day — Week ${wi + 1}` : "Hours by day"
              }
              m1={live.m1}
              m2={live.m2}
            />
          ))}

          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button type="button" className={btnCls} onClick={onCopy}>
              {copyFlash ? "Copied" : "Copy"}
            </button>
            <button type="button" className={btnCls} onClick={onPrint}>
              Print
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function SummaryTable({
  week,
  rate,
  m1,
  m2,
  rule,
}: {
  week: WeekMoney;
  rate: number;
  m1: number;
  m2: number;
  rule: OtRule;
}) {
  const hideDt = rule === "federal" && week.dt === 0;
  const hideBonus = week.bonus <= 0;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[18rem] border-collapse text-sm">
        <caption className="sr-only">Pay summary</caption>
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="py-2 pr-2 font-semibold">Pay tier</th>
            <th className="py-2 pr-2 text-right font-semibold">Hours</th>
            <th className="py-2 pr-2 text-right font-semibold">Rate</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          <SummaryRow
            label="Regular"
            hours={formatHours(week.reg)}
            rate={formatMoney(rate)}
            amount={formatMoney(week.regularPay)}
            strong={false}
          />
          <SummaryRow
            label={`Overtime (${m1}×)`}
            hours={formatHours(week.ot)}
            rate={formatMoney(rate * m1)}
            amount={formatMoney(week.overtimePay)}
            strong={false}
          />
          {!hideDt ? (
            <SummaryRow
              label={`Double time (${m2}×)`}
              hours={formatHours(week.dt)}
              rate={formatMoney(rate * m2)}
              amount={formatMoney(week.doubleTimePay)}
              strong={false}
            />
          ) : null}
          {!hideBonus ? (
            <>
              <SummaryRow label="Bonus" hours="—" rate="—" amount={formatMoney(week.bonus)} strong={false} />
              <SummaryRow
                label="Overtime on the bonus"
                hours="—"
                rate="—"
                amount={formatMoney(week.bonusOT)}
                strong={false}
              />
            </>
          ) : null}
          <SummaryRow
            label="Gross pay"
            hours={formatHours(week.total)}
            rate="—"
            amount={formatMoney(week.gross)}
            strong
          />
        </tbody>
      </table>
    </div>
  );
}

function SummaryRow({
  label,
  hours,
  rate,
  amount,
  strong,
}: {
  label: string;
  hours: string;
  rate: string;
  amount: string;
  strong: boolean;
}) {
  const cell = strong ? "font-bold text-foreground" : "text-muted";
  return (
    <tr className="border-b border-border/60">
      <td className={`py-2 pr-2 ${cell}`}>{label}</td>
      <td className={`py-2 pr-2 text-right tabular-nums ${cell}`}>{hours}</td>
      <td className={`py-2 pr-2 text-right tabular-nums ${cell}`}>{rate}</td>
      <td className={`py-2 text-right tabular-nums ${cell}`}>{amount}</td>
    </tr>
  );
}

function DayTable({
  week,
  dayLabels,
  caption,
  m1,
  m2,
}: {
  week: WeekMoney;
  dayLabels: string[];
  caption: string;
  m1: number;
  m2: number;
}) {
  return (
    <div
      className="mt-5 overflow-x-auto focus-visible:ring-2 focus-visible:ring-accent"
      tabIndex={0}
      role="region"
      aria-label="Hours by day"
    >
      <table className="w-full min-w-[22rem] border-collapse text-sm">
        <caption className="mb-2 text-left text-xs font-semibold text-muted">{caption}</caption>
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="py-2 pr-2 font-semibold">Day</th>
            <th className="py-2 pr-2 text-right font-semibold">Hours</th>
            <th className="py-2 pr-2 text-right font-semibold">Regular</th>
            <th className="py-2 pr-2 text-right font-semibold">{m1}×</th>
            <th className="py-2 text-right font-semibold">{m2}×</th>
          </tr>
        </thead>
        <tbody>
          {week.days.slice(0, 7).map((d, i) => (
            <tr key={i} className="border-b border-border/60">
              <td className="py-2 pr-2 text-foreground">
                {dayLabels[i]}
                {d.isSeventhDay ? (
                  <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
                    7th day
                  </span>
                ) : null}
              </td>
              <td className="py-2 pr-2 text-right tabular-nums text-muted">{formatHours(d.hours)}</td>
              <td className="py-2 pr-2 text-right tabular-nums text-muted">{formatHours(d.reg)}</td>
              <td className="py-2 pr-2 text-right tabular-nums text-muted">{formatHours(d.ot)}</td>
              <td className="py-2 text-right tabular-nums text-muted">{formatHours(d.dt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PrintSheet({
  calculated,
  live,
  dayLabels,
  period,
  rate,
  m1,
  m2,
  rule,
  week1,
  week2,
  dailyLimit,
  doubleAfter,
  workweekStarts,
}: {
  calculated: boolean;
  live: LiveOk | LiveErr | null;
  dayLabels: string[];
  period: PeriodKind;
  rate: string;
  m1: string;
  m2: string;
  rule: OtRule;
  week1: WeekFields;
  week2: WeekFields;
  dailyLimit: string;
  doubleAfter: string;
  workweekStarts: number;
}) {
  if (!calculated || !live || live.error) return null;
  const printed = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const weekStartName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    workweekStarts
  ];

  return (
    <div className="overtime-print-sheet mt-8 hidden text-black print:block">
      <p className="text-xl font-bold">Overtime calculator</p>
      <p className="mt-1 text-sm">Printed {printed}</p>
      <p className="mt-2 text-sm">
        Rule: {rule}
        {rule === "daily_weekly"
          ? ` (OT after ${dailyLimit}h/day${doubleAfter ? `, DT after ${doubleAfter}h` : ""})`
          : ""}
        · Period: {period === "two_weeks" ? "Two weeks" : "One week"} · Workweek starts{" "}
        {weekStartName} · Rate ${rate} · OT {m1}× · DT {m2}×
      </p>
      {period === "two_weeks" ? (
        <>
          <p className="mt-3 text-sm font-semibold">Week 1 hours: {week1.hours.join(", ")}</p>
          <p className="text-sm font-semibold">Week 2 hours: {week2.hours.join(", ")}</p>
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold">
          Hours ({dayLabels.join("/")}): {week1.hours.join(", ")}
        </p>
      )}
      <div className="mt-4">
        <SummaryTable
          week={live.period}
          rate={live.rate}
          m1={live.m1}
          m2={live.m2}
          rule={live.rule}
        />
      </div>
      {live.weeks.map((w, wi) => (
        <DayTable
          key={wi}
          week={w}
          dayLabels={dayLabels}
          caption={period === "two_weeks" ? `Hours by day — Week ${wi + 1}` : "Hours by day"}
          m1={live.m1}
          m2={live.m2}
        />
      ))}
      <p className="mt-4 text-sm">
        Extra half on hours over 40: {formatMoney(live.period.extraHalf)}
      </p>
    </div>
  );
}
