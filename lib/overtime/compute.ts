import { parseDayHours, roundHours, roundMoney } from "./parse";
import type { DaySplit, OtRule, WeekInput, WeekMoney } from "./types";

export type ComputeWeekResult =
  | { ok: true; week: WeekMoney; warnings: string[] }
  | { ok: false; error: "day_over_24"; warnings: string[] };

function dailySplit(
  h: number,
  dayIndex: number,
  rule: OtRule,
  allSevenWorked: boolean,
  dailyLimit: number,
  doubleTimeAfter: number | null,
): Omit<DaySplit, "hours" | "isSeventhDay"> & { isSeventhDay: boolean } {
  if (rule === "federal") {
    return { reg: h, ot: 0, dt: 0, isSeventhDay: false };
  }

  if (rule === "california" && dayIndex === 6 && allSevenWorked) {
    return {
      reg: 0,
      ot: Math.min(h, 8),
      dt: Math.max(0, h - 8),
      isSeventhDay: true,
    };
  }

  const L = rule === "california" ? 8 : dailyLimit;
  const D =
    rule === "california"
      ? 12
      : doubleTimeAfter != null && Number.isFinite(doubleTimeAfter)
        ? doubleTimeAfter
        : Number.POSITIVE_INFINITY;

  const reg = Math.min(h, L);
  const dt = Math.max(0, h - D);
  const ot = Math.max(0, h - reg - dt);
  return { reg, ot, dt, isSeventhDay: false };
}

/**
 * Split one workweek into regular / OT / DT hours and money.
 * Days must already be in workweek order (index 0 = workweek start).
 */
export function computeWeek(input: WeekInput): ComputeWeekResult {
  const warnings: string[] = [];
  const hours = input.hours.map((h) => Math.max(0, h));
  if (hours.length !== 7) {
    throw new Error("computeWeek expects exactly 7 day hours");
  }
  if (hours.some((h) => h > 24)) {
    return { ok: false, error: "day_over_24", warnings };
  }

  const dailyLimit = input.dailyLimit ?? 8;
  const doubleTimeAfter =
    input.doubleTimeAfter == null || !Number.isFinite(input.doubleTimeAfter)
      ? null
      : input.doubleTimeAfter;

  const allSevenWorked = hours.every((h) => h > 0);

  const days: DaySplit[] = hours.map((h, i) => {
    const split = dailySplit(
      h,
      i,
      input.rule,
      allSevenWorked,
      dailyLimit,
      doubleTimeAfter,
    );
    return { hours: h, ...split };
  });

  // Weekly 40 check: never double-count daily OT/DT.
  let cum = 0;
  for (const day of days) {
    const allowed = Math.max(0, 40 - cum);
    const move = Math.max(0, day.reg - allowed);
    day.reg -= move;
    day.ot += move;
    cum += day.reg;
  }

  const reg = roundHours(days.reduce((a, d) => a + d.reg, 0));
  const ot = roundHours(days.reduce((a, d) => a + d.ot, 0));
  const dt = roundHours(days.reduce((a, d) => a + d.dt, 0));
  const total = roundHours(reg + ot + dt);

  const rate = input.rate;
  const m1 = input.m1;
  const m2 = input.m2;
  const bonus = Math.max(0, input.bonus);

  const regularPay = roundMoney(reg * rate);
  const overtimePay = roundMoney(ot * rate * m1);
  const doubleTimePay = roundMoney(dt * rate * m2);

  const bonusRate = bonus > 0 && total > 0 ? bonus / total : 0;
  const bonusOT = roundMoney(bonusRate * ((m1 - 1) * ot + (m2 - 1) * dt));
  const gross = roundMoney(regularPay + overtimePay + doubleTimePay + bonus + bonusOT);

  const regularRate =
    bonus > 0 && total > 0 ? roundMoney((rate * total + bonus) / total) : null;
  const extraHalf = roundMoney(0.5 * (regularRate ?? rate) * Math.max(0, total - 40));
  const avgPerHour = total > 0 ? roundMoney(gross / total) : null;

  if (m1 < 1.5) {
    warnings.push("Below the 1.5× federal minimum for hours over 40.");
  }
  if (rate > 0 && rate < 7.25) {
    warnings.push("Below the federal minimum wage of $7.25.");
  }
  if (
    input.rule === "california" &&
    hours.filter((h) => h >= 10).length === 4 &&
    hours.filter((h) => h > 0).length === 4 &&
    Math.abs(total - 40) < 0.01
  ) {
    warnings.push(
      "California allows some approved alternative workweek schedules (like four 10-hour days) without daily overtime. If your workplace has one, use the Federal rule.",
    );
  }

  return {
    ok: true,
    warnings,
    week: {
      days,
      reg,
      ot,
      dt,
      total,
      regularPay,
      overtimePay,
      doubleTimePay,
      bonus,
      bonusOT,
      gross,
      regularRate,
      extraHalf,
      avgPerHour,
    },
  };
}

export function combineWeeks(weeks: WeekMoney[]): WeekMoney {
  const sum = (pick: (w: WeekMoney) => number) => weeks.reduce((a, w) => a + pick(w), 0);
  const total = roundHours(sum((w) => w.total));
  const gross = roundMoney(sum((w) => w.gross));
  return {
    days: weeks.flatMap((w) => w.days),
    reg: roundHours(sum((w) => w.reg)),
    ot: roundHours(sum((w) => w.ot)),
    dt: roundHours(sum((w) => w.dt)),
    total,
    regularPay: roundMoney(sum((w) => w.regularPay)),
    overtimePay: roundMoney(sum((w) => w.overtimePay)),
    doubleTimePay: roundMoney(sum((w) => w.doubleTimePay)),
    bonus: roundMoney(sum((w) => w.bonus)),
    bonusOT: roundMoney(sum((w) => w.bonusOT)),
    gross,
    regularRate: null,
    extraHalf: roundMoney(sum((w) => w.extraHalf)),
    avgPerHour: total > 0 ? roundMoney(gross / total) : null,
  };
}

/** Rotate calendar-Sunday-first hours into workweek-start-first order. */
export function rotateToWorkweek(sundayFirst: number[], workweekStarts: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 7; i++) {
    out.push(sundayFirst[(workweekStarts + i) % 7]!);
  }
  return out;
}

export function dayLabelsForWorkweek(workweekStarts: number): string[] {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return Array.from({ length: 7 }, (_, i) => names[(workweekStarts + i) % 7]!);
}

export { parseDayHours };
