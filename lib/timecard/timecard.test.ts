import { describe, expect, it } from "vitest";
import { computePeriod, dayTotals } from "./compute";
import { minutesToDecimal, formatHhMm } from "./decimal";
import { defaultSettings, makeDayRow, makeDays } from "./defaults";
import { computeGrossPay, splitWeekOvertime } from "./overtime";
import { roundPunch } from "./rounding";
import { elapsedMinutes, evaluateDay, from12h, from24h, to12h, to24h } from "./time";
import type { BreakEntry, DayRow, TimeCardSettings } from "./types";

function punch(h12: number, m: number, pm: boolean) {
  return { minutes: from12h(h12, m, pm) };
}
function punch24(h: number, m: number) {
  return { minutes: from24h(h, m) };
}
function lunch(mins: number): BreakEntry {
  return {
    id: "l",
    label: "Lunch",
    mode: "duration",
    durationMinutes: mins,
    start: { minutes: null },
    end: { minutes: null },
  };
}
function day(start: DayRow["start"], end: DayRow["end"], breaks: BreakEntry[] = []): DayRow {
  return { id: "d", date: null, start, end, breaks, note: "" };
}

describe("decimal hours", () => {
  it("maps common minute totals half-up to two places", () => {
    expect(minutesToDecimal(8 * 60 + 15)).toBe(8.25);
    expect(minutesToDecimal(8 * 60 + 6)).toBe(8.1);
    expect(minutesToDecimal(8 * 60 + 3)).toBe(8.05);
    expect(formatHhMm(495)).toBe("8:15");
  });
});

describe("elapsed and overnight", () => {
  it("handles overnight and equal times", () => {
    expect(elapsedMinutes(from12h(10, 0, true), from12h(6, 0, false))).toEqual({
      minutes: 8 * 60,
      overnight: true,
      equal: false,
    });
    expect(elapsedMinutes(from12h(9, 0, false), from12h(9, 0, false))).toEqual({
      minutes: 0,
      overnight: false,
      equal: true,
    });
    expect(elapsedMinutes(from12h(11, 45, true), from12h(12, 15, false))).toEqual({
      minutes: 30,
      overnight: true,
      equal: false,
    });
  });

  it("24h overnight 17:30–02:00 is 8:30", () => {
    expect(elapsedMinutes(from24h(17, 30), from24h(2, 0)).minutes).toBe(8 * 60 + 30);
  });
});

describe("§5.4 overnight fixtures with breaks", () => {
  const settings: TimeCardSettings = { ...defaultSettings(), rounding: "off" };

  it("10pm–6am no break → 8.00", () => {
    const d = day(punch(10, 0, true), punch(6, 0, false));
    const t = dayTotals(d, settings);
    expect(t.status.kind).toBe("ok");
    if (t.status.kind === "ok") expect(t.status.overnight).toBe(true);
    expect(t.netMinutes).toBe(480);
    expect(t.netDecimal).toBe(8);
  });

  it("10pm–6am with 30m break → 7.50", () => {
    const d = day(punch(10, 0, true), punch(6, 0, false), [lunch(30)]);
    expect(dayTotals(d, settings).netDecimal).toBe(7.5);
  });
});

describe("§5.5 rounding fixtures", () => {
  it("15-minute splits", () => {
    expect(roundPunch(from12h(7, 3, false), "15")).toBe(from12h(7, 0, false));
    expect(roundPunch(from12h(3, 36, true), "15")).toBe(from12h(3, 30, true));
    expect(roundPunch(from12h(7, 8, false), "15")).toBe(from12h(7, 15, false));
  });
  it("6-minute and 5-minute splits", () => {
    expect(roundPunch(from12h(8, 2, false), "6")).toBe(from12h(8, 0, false));
    expect(roundPunch(from12h(8, 3, false), "6")).toBe(from12h(8, 6, false));
    expect(roundPunch(from12h(8, 2, false), "5")).toBe(from12h(8, 0, false));
    expect(roundPunch(from12h(8, 3, false), "5")).toBe(from12h(8, 5, false));
  });
  it("15-minute day with lunch matches brief", () => {
    const settings: TimeCardSettings = { ...defaultSettings(), rounding: "15" };
    const d = day(punch(7, 3, false), punch(3, 36, true), [lunch(30)]);
    const t = dayTotals(d, settings);
    expect(t.netMinutes).toBe(8 * 60);
    expect(t.netDecimal).toBe(8);
    const unrounded = dayTotals(d, { ...settings, rounding: "off" });
    expect(unrounded.netMinutes).toBe(8 * 60 + 3);
    expect(unrounded.netDecimal).toBe(8.05);
  });
});

describe("§5.3 overtime split", () => {
  it("Mon–Fri 8.5h weekly only → regular 40 OT 2.5", () => {
    const nets = Array(5).fill(8.5 * 60);
    const w = splitWeekOvertime(nets, { weekly: true, daily: false });
    expect(w.regularDecimal).toBe(40);
    expect(w.overtimeDecimal).toBe(2.5);
  });

  it("Mon–Fri 8.5h weekly+daily → all OT labeled daily, weekly OT 0", () => {
    const nets = Array(5).fill(8.5 * 60);
    const w = splitWeekOvertime(nets, { weekly: true, daily: true });
    expect(w.regularDecimal).toBe(40);
    expect(w.overtimeDecimal).toBe(2.5);
    expect(minutesToDecimal(w.dailyOvertimeMinutes)).toBe(2.5);
    expect(minutesToDecimal(w.weeklyOvertimeMinutes)).toBe(0);
  });

  it("six days of 7h weekly only → OT 2", () => {
    const w = splitWeekOvertime(Array(6).fill(7 * 60), { weekly: true, daily: false });
    expect(w.regularDecimal).toBe(40);
    expect(w.overtimeDecimal).toBe(2);
  });
});

describe("§5.3 end-to-end week with lunch", () => {
  it("9–6 with 30m lunch × 5", () => {
    const settings: TimeCardSettings = {
      ...defaultSettings(),
      weeklyOvertime: true,
      dailyOvertime: false,
      rounding: "off",
    };
    const days = makeDays("week");
    for (let i = 0; i < 5; i++) {
      days[i] = day(punch(9, 0, false), punch(6, 0, true), [lunch(30)]);
    }
    const p = computePeriod(days, settings);
    expect(p.period.totalDecimal).toBe(42.5);
    expect(p.period.regularDecimal).toBe(40);
    expect(p.period.overtimeDecimal).toBe(2.5);
  });
});

describe("pay", () => {
  it("$20 × 42.5 weekly-only → 800 + 75 = 875", () => {
    const pay = computeGrossPay(40 * 60, 2.5 * 60, 20);
    expect(pay.regularPay).toBe(800);
    expect(pay.overtimePay).toBe(75);
    expect(pay.grossPay).toBe(875);
  });
  it("blank rate → null pay", () => {
    expect(computeGrossPay(40 * 60, 0, null).grossPay).toBeNull();
  });
});

describe("edge cases", () => {
  const settings = defaultSettings();

  it("empty row ignored", () => {
    expect(evaluateDay(makeDayRow(), "off").kind).toBe("empty");
  });

  it("start without end is incomplete", () => {
    const d = day(punch(9, 0, false), { minutes: null });
    const s = evaluateDay(d, "off");
    expect(s.kind).toBe("incomplete");
  });

  it("breaks longer than shift invalid", () => {
    const d = day(punch(9, 0, false), punch(10, 0, false), [lunch(90)]);
    expect(evaluateDay(d, "off").kind).toBe("invalid");
  });

  it("12h ↔ 24h preserves instant", () => {
    const m = from12h(8, 30, true);
    const { hour24, minute } = to24h(m);
    expect(hour24).toBe(20);
    expect(minute).toBe(30);
    const back = to12h(from24h(20, 30));
    expect(back).toEqual({ hour12: 8, minute: 30, isPm: true });
  });

  it("biweekly OT is per workweek not 80-hour bucket", () => {
    const settings: TimeCardSettings = {
      ...defaultSettings(),
      period: "biweekly",
      weeklyOvertime: true,
      dailyOvertime: false,
    };
    const days = makeDays("biweekly");
    // Week 1: 42.5h, Week 2: 42.5h → OT 2.5 + 2.5 = 5, not (85-80)=5 coincidentally same but regular 80
    for (let i = 0; i < 5; i++) days[i] = day(punch(9, 0, false), punch(6, 0, true), [lunch(30)]);
    for (let i = 7; i < 12; i++) days[i] = day(punch(9, 0, false), punch(6, 0, true), [lunch(30)]);
    const p = computePeriod(days, settings);
    expect(p.weeks[0]!.overtimeDecimal).toBe(2.5);
    expect(p.weeks[1]!.overtimeDecimal).toBe(2.5);
    expect(p.period.regularDecimal).toBe(80);
    expect(p.period.overtimeDecimal).toBe(5);
    expect(p.period.totalDecimal).toBe(85);
  });
});

describe("worked example §8.5 numbers", () => {
  it("7:03–3:36 with 30m lunch, no rounding", () => {
    const settings: TimeCardSettings = { ...defaultSettings(), rounding: "off" };
    const d = day(punch(7, 3, false), punch(3, 36, true), [lunch(30)]);
    const t = dayTotals(d, settings);
    expect(t.netMinutes).toBe(8 * 60 + 3);
    expect(t.netDecimal).toBe(8.05);
    const days = makeDays("week");
    for (let i = 0; i < 5; i++) {
      days[i] = day(punch(7, 3, false), punch(3, 36, true), [lunch(30)]);
    }
    const p = computePeriod(days, { ...settings, weeklyOvertime: true, hourlyRate: 20 });
    expect(p.period.totalDecimal).toBe(40.25);
    expect(p.period.regularDecimal).toBe(40);
    expect(p.period.overtimeDecimal).toBe(0.25);
    expect(p.regularPay).toBe(800);
    expect(p.overtimePay).toBe(7.5);
    expect(p.grossPay).toBe(807.5);
  });
});
