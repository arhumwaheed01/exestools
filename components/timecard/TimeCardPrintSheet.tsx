import {
  computePeriod,
  dayTotals,
  formatHhMm,
  formatPunch,
  weekStartLabel,
  weekdayLabel,
  type DayRow,
  type TimeCardSettings,
} from "@/lib/timecard";

function roundingLabel(mode: TimeCardSettings["rounding"]): string {
  if (mode === "off") return "none";
  if (mode === "5") return "nearest 5 min";
  if (mode === "6") return "nearest 6 min";
  return "nearest 15 min";
}

function overtimeLabel(settings: TimeCardSettings): string {
  if (settings.weeklyOvertime && settings.dailyOvertime) return "weekly (+ daily over 8)";
  if (settings.weeklyOvertime) return "weekly";
  if (settings.dailyOvertime) return "daily over 8";
  return "off";
}

export function settingsSummaryLine(settings: TimeCardSettings): string {
  const period = settings.period === "biweekly" ? "Biweekly" : "Week";
  return `${period} · Workweek starts ${weekStartLabel(settings.weekStart)} · Rounding: ${roundingLabel(settings.rounding)} · Overtime: ${overtimeLabel(settings)}`;
}

function dateRangeLabel(days: DayRow[]): string | null {
  const dates = days
    .map((d) => d.date)
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort();
  if (dates.length === 0) return null;
  const first = dates[0]!;
  const last = dates[dates.length - 1]!;
  return first === last ? first : `${first} – ${last}`;
}

type Props = {
  days: DayRow[];
  settings: TimeCardSettings;
};

/** Compact print-only timesheet (hidden on screen). */
export function TimeCardPrintSheet({ days, settings }: Props) {
  const period = computePeriod(days, settings);
  const range = dateRangeLabel(days);
  const rows = days
    .map((day, i) => {
      const t = dayTotals(day, settings);
      if (t.status.kind === "empty") return null;
      const label = weekdayLabel(settings.weekStart, i % 7);
      if (t.status.kind !== "ok") {
        return {
          key: day.id,
          label,
          date: day.date ?? "",
          start: "",
          end: "",
          breaks: "",
          net: t.status.message,
          decimal: "",
          note: day.note,
        };
      }
      return {
        key: day.id,
        label,
        date: day.date ?? "",
        start: formatPunch(t.status.roundedStart, settings.clockFormat),
        end: formatPunch(t.status.roundedEnd, settings.clockFormat),
        breaks: String(t.status.breakMinutes),
        net: formatHhMm(t.netMinutes),
        decimal: t.netDecimal.toFixed(2),
        note: day.note,
      };
    })
    .filter(Boolean);

  const showNote = rows.some((r) => r && r.note.trim());

  return (
    <div className="timecard-print-sheet hidden print:block text-black">
      <h1 className="text-xl font-bold">Time card calculator</h1>
      {range ? <p className="mt-1 text-sm">Date range: {range}</p> : null}
      <p className="mt-2 text-sm">{settingsSummaryLine(settings)}</p>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Day</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Date</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Start</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">End</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Breaks (min)</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Net h:mm</th>
            <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Decimal</th>
            {showNote ? (
              <th className="border border-neutral-400 px-2 py-1 text-left font-semibold">Note</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            r ? (
              <tr key={r.key}>
                <td className="border border-neutral-400 px-2 py-1">{r.label}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.date}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.start}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.end}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.breaks}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.net}</td>
                <td className="border border-neutral-400 px-2 py-1">{r.decimal}</td>
                {showNote ? (
                  <td className="border border-neutral-400 px-2 py-1">{r.note}</td>
                ) : null}
              </tr>
            ) : null,
          )}
        </tbody>
      </table>

      <dl className="mt-4 grid max-w-md grid-cols-2 gap-x-6 gap-y-1 text-sm">
        <div>
          <dt className="font-semibold">Regular</dt>
          <dd>
            {formatHhMm(period.period.regularMinutes)} ({period.period.regularDecimal.toFixed(2)})
          </dd>
        </div>
        {settings.dailyOvertime ? (
          <>
            <div>
              <dt className="font-semibold">Daily overtime</dt>
              <dd>{formatHhMm(period.period.dailyOvertimeMinutes)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Weekly overtime</dt>
              <dd>{formatHhMm(period.period.weeklyOvertimeMinutes)}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt className="font-semibold">Overtime</dt>
            <dd>
              {formatHhMm(period.period.overtimeMinutes)} ({period.period.overtimeDecimal.toFixed(2)})
            </dd>
          </div>
        )}
        <div>
          <dt className="font-semibold">Total</dt>
          <dd>
            {formatHhMm(period.period.totalMinutes)} ({period.period.totalDecimal.toFixed(2)})
          </dd>
        </div>
        {period.grossPay != null ? (
          <div className="col-span-2">
            <dt className="font-semibold">Estimated gross pay (no tax)</dt>
            <dd>${period.grossPay.toFixed(2)}</dd>
            <p className="mt-1 text-xs">
              This is hours times your rate only. It does not take out tax, benefits, or other
              deductions, and it is not a paycheck.
            </p>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
