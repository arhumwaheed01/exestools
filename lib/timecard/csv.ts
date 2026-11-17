import { formatHhMm, minutesToDecimal } from "./decimal";
import { dayTotals, computePeriod } from "./compute";
import { formatPunch, weekdayLabel } from "./time";
import type { DayRow, TimeCardSettings } from "./types";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildCsv(
  days: DayRow[],
  settings: TimeCardSettings,
): string {
  const period = computePeriod(days, settings);
  const hasRate = settings.hourlyRate != null;
  const headers = [
    "date",
    "weekday",
    "start",
    "end",
    "breaks_minutes",
    "net_hhmm",
    "net_decimal",
    "regular_decimal",
    "overtime_decimal",
    "note",
  ];
  if (hasRate) headers.push("regular_pay", "overtime_pay", "gross_pay");

  const lines = [headers.join(",")];

  days.forEach((day, i) => {
    const t = dayTotals(day, settings);
    const ok = t.status.kind === "ok";
    const start =
      ok && t.status.kind === "ok"
        ? formatPunch(t.status.roundedStart, settings.clockFormat)
        : day.start.minutes != null
          ? formatPunch(day.start.minutes, settings.clockFormat)
          : "";
    const end =
      ok && t.status.kind === "ok"
        ? formatPunch(t.status.roundedEnd, settings.clockFormat)
        : day.end.minutes != null
          ? formatPunch(day.end.minutes, settings.clockFormat)
          : "";
    const breaks =
      ok && t.status.kind === "ok" ? String(t.status.breakMinutes) : "";
    const netHhmm = ok ? formatHhMm(t.netMinutes) : "";
    const netDec = ok ? t.netDecimal.toFixed(2) : "";

    // Attribute week-level OT roughly: daily OT on the day; remaining OT not per-day in CSV —
    // use day-level daily OT for overtime_decimal when daily is on; else leave blank for weekly-only days.
    let regDec = "";
    let otDec = "";
    if (ok) {
      if (settings.dailyOvertime) {
        regDec = minutesToDecimal(t.regularMinutes).toFixed(2);
        otDec = minutesToDecimal(t.dailyOvertimeMinutes).toFixed(2);
      } else {
        // Weekly-only: put all hours as regular at day level; week OT is in summary row conceptually.
        regDec = t.netDecimal.toFixed(2);
        otDec = "0.00";
      }
    }

    const row = [
      day.date ?? "",
      weekdayLabel(settings.weekStart, i % 7),
      start,
      end,
      breaks,
      netHhmm,
      netDec,
      regDec,
      otDec,
      day.note,
    ];
    if (hasRate) {
      // Pay only on a footer-style last data concept — per brief, columns exist when rate set.
      // Day rows leave pay blank; append period summary as a final row.
      row.push("", "", "");
    }
    lines.push(row.map((c) => csvEscape(String(c))).join(","));
  });

  // Period summary row
  const summary = [
    "",
    "PERIOD TOTAL",
    "",
    "",
    "",
    formatHhMm(period.period.totalMinutes),
    period.period.totalDecimal.toFixed(2),
    period.period.regularDecimal.toFixed(2),
    period.period.overtimeDecimal.toFixed(2),
    "",
  ];
  if (hasRate) {
    summary.push(
      period.regularPay != null ? period.regularPay.toFixed(2) : "",
      period.overtimePay != null ? period.overtimePay.toFixed(2) : "",
      period.grossPay != null ? period.grossPay.toFixed(2) : "",
    );
  }
  lines.push(summary.map((c) => csvEscape(String(c))).join(","));

  return lines.join("\r\n") + "\r\n";
}

export function csvFilename(anchorDate?: string | null): string {
  const d = anchorDate && /^\d{4}-\d{2}-\d{2}$/.test(anchorDate)
    ? anchorDate
    : new Date().toISOString().slice(0, 10);
  return `timecard-${d}.csv`;
}

export function buildCopySummary(days: DayRow[], settings: TimeCardSettings): string {
  const period = computePeriod(days, settings);
  const lines: string[] = ["Time card summary", ""];
  days.forEach((day, i) => {
    const t = dayTotals(day, settings);
    if (t.status.kind === "empty") return;
    const label = `${weekdayLabel(settings.weekStart, i % 7)}${day.date ? ` ${day.date}` : ""}`;
    if (t.status.kind !== "ok") {
      lines.push(`${label}: ${t.status.message}`);
      return;
    }
    lines.push(
      `${label}: ${formatPunch(t.status.roundedStart, settings.clockFormat)} – ${formatPunch(t.status.roundedEnd, settings.clockFormat)} → ${formatHhMm(t.netMinutes)} (${t.netDecimal.toFixed(2)}h)${t.status.overnight ? " [overnight]" : ""}`,
    );
  });
  lines.push("");
  if (settings.period === "biweekly" && period.weeks.length === 2) {
    lines.push(
      `Week 1: ${formatHhMm(period.weeks[0]!.totalMinutes)} (${period.weeks[0]!.totalDecimal.toFixed(2)}h) — regular ${period.weeks[0]!.regularDecimal.toFixed(2)}, OT ${period.weeks[0]!.overtimeDecimal.toFixed(2)}`,
    );
    lines.push(
      `Week 2: ${formatHhMm(period.weeks[1]!.totalMinutes)} (${period.weeks[1]!.totalDecimal.toFixed(2)}h) — regular ${period.weeks[1]!.regularDecimal.toFixed(2)}, OT ${period.weeks[1]!.overtimeDecimal.toFixed(2)}`,
    );
  }
  lines.push(
    `Regular: ${formatHhMm(period.period.regularMinutes)} (${period.period.regularDecimal.toFixed(2)}h)`,
  );
  lines.push(
    `Overtime: ${formatHhMm(period.period.overtimeMinutes)} (${period.period.overtimeDecimal.toFixed(2)}h)`,
  );
  lines.push(
    `Total: ${formatHhMm(period.period.totalMinutes)} (${period.period.totalDecimal.toFixed(2)}h)`,
  );
  if (period.grossPay != null) {
    lines.push(
      `Estimated gross pay (no tax): $${period.regularPay!.toFixed(2)} regular + $${period.overtimePay!.toFixed(2)} OT = $${period.grossPay.toFixed(2)}`,
    );
  }
  return lines.join("\n");
}
