import { describe, expect, it } from "vitest";
import { combineWeeks, computeWeek, parseDayHours } from "./compute";
import type { WeekInput } from "./types";

function fed(partial: Partial<WeekInput> & { hours: number[] }): WeekInput {
  return {
    rule: "federal",
    rate: 20,
    m1: 1.5,
    m2: 2,
    bonus: 0,
    ...partial,
  };
}

describe("parseDayHours", () => {
  it("F11: 8:30 → 8.5", () => {
    expect(parseDayHours("8:30")).toBe(8.5);
  });
  it("accepts decimals and blank", () => {
    expect(parseDayHours("8.5")).toBe(8.5);
    expect(parseDayHours("")).toBe(0);
    expect(parseDayHours("  ")).toBe(0);
  });
  it("F12: 25 is invalid", () => {
    expect(parseDayHours("25")).toBeNull();
  });
});

describe("computeWeek fixtures", () => {
  it("F1: Federal 5×8h @ $20", () => {
    const r = computeWeek(
      fed({ hours: [0, 8, 8, 8, 8, 8, 0], rate: 20 }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.reg).toBe(40);
    expect(r.week.ot).toBe(0);
    expect(r.week.gross).toBe(800);
    expect(r.week.extraHalf).toBe(0);
  });

  it("F2: Federal 50h @ $18.50 + $60 bonus", () => {
    const r = computeWeek(
      fed({
        hours: [0, 9, 9, 9, 9, 9, 5],
        rate: 18.5,
        bonus: 60,
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.reg).toBe(40);
    expect(r.week.ot).toBe(10);
    expect(r.week.regularPay).toBe(740);
    expect(r.week.overtimePay).toBe(277.5);
    expect(r.week.bonus).toBe(60);
    expect(r.week.bonusOT).toBe(6);
    expect(r.week.gross).toBe(1083.5);
    expect(r.week.regularRate).toBe(19.7);
    expect(r.week.extraHalf).toBe(98.5);
  });

  it("F3: California 60h week starting Sunday", () => {
    const r = computeWeek({
      rule: "california",
      hours: [6, 10, 8, 13, 8, 6, 9],
      rate: 22,
      m1: 1.5,
      m2: 2,
      bonus: 0,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const d = r.week.days;
    // Mon 10 → 8/2/0
    expect(d[1]).toMatchObject({ reg: 8, ot: 2, dt: 0 });
    // Wed 13 → 8/4/1
    expect(d[3]).toMatchObject({ reg: 8, ot: 4, dt: 1 });
    // Fri after weekly move: 2/4/0
    expect(d[5]).toMatchObject({ reg: 2, ot: 4, dt: 0 });
    // Sat 7th day: 0/8/1
    expect(d[6]).toMatchObject({ reg: 0, ot: 8, dt: 1, isSeventhDay: true });
    expect(r.week.reg).toBe(40);
    expect(r.week.ot).toBe(18);
    expect(r.week.dt).toBe(2);
    expect(r.week.regularPay).toBe(880);
    expect(r.week.overtimePay).toBe(594);
    expect(r.week.doubleTimePay).toBe(88);
    expect(r.week.gross).toBe(1562);
    expect(r.week.extraHalf).toBe(220);
  });

  it("F4: same hours as F3 under Federal", () => {
    const r = computeWeek(
      fed({ hours: [6, 10, 8, 13, 8, 6, 9], rate: 22 }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.reg).toBe(40);
    expect(r.week.ot).toBe(20);
    expect(r.week.gross).toBe(1540);
  });

  it("F5: two weeks 50h + 30h @ $20 → $1,700 period", () => {
    const w1 = computeWeek(
      fed({ hours: [0, 9, 9, 9, 9, 9, 5], rate: 20 }),
    );
    const w2 = computeWeek(
      fed({ hours: [0, 6, 6, 6, 6, 6, 0], rate: 20 }),
    );
    expect(w1.ok && w2.ok).toBe(true);
    if (!w1.ok || !w2.ok) return;
    expect(w1.week.gross).toBe(1100);
    expect(w2.week.gross).toBe(600);
    const period = combineWeeks([w1.week, w2.week]);
    expect(period.reg).toBe(70);
    expect(period.ot).toBe(10);
    expect(period.gross).toBe(1700);
  });

  it("F6: daily+weekly limit 8, Mon–Thu 10h @ $25", () => {
    const r = computeWeek({
      rule: "daily_weekly",
      hours: [0, 10, 10, 10, 10, 0, 0],
      rate: 25,
      m1: 1.5,
      m2: 2,
      bonus: 0,
      dailyLimit: 8,
      doubleTimeAfter: null,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.reg).toBe(32);
    expect(r.week.ot).toBe(8);
    expect(r.week.gross).toBe(1100);

    const fedSame = computeWeek(
      fed({ hours: [0, 10, 10, 10, 10, 0, 0], rate: 25 }),
    );
    expect(fedSame.ok && fedSame.week.gross).toBe(1000);
  });

  it("F7: Federal 45h @ $20, m1=1.75", () => {
    const r = computeWeek(
      fed({
        hours: [0, 9, 9, 9, 9, 9, 0],
        rate: 20,
        m1: 1.75,
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.regularPay).toBe(800);
    expect(r.week.overtimePay).toBe(175);
    expect(r.week.gross).toBe(975);
    expect(r.week.extraHalf).toBe(50);
    expect(r.warnings).toHaveLength(0);
  });

  it("F8: California Mon–Sat 9h (no 7th-day tag)", () => {
    const r = computeWeek({
      rule: "california",
      hours: [0, 9, 9, 9, 9, 9, 9],
      rate: 20,
      m1: 1.5,
      m2: 2,
      bonus: 0,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.days[6]?.isSeventhDay).toBe(false);
    expect(r.week.days[6]).toMatchObject({ reg: 0, ot: 9, dt: 0 });
    expect(r.week.reg).toBe(40);
    expect(r.week.ot).toBe(14);
    expect(r.week.gross).toBe(1220);
  });

  it("F9: California 7 days, 7th day 4h, others 6h", () => {
    const r = computeWeek({
      rule: "california",
      hours: [6, 6, 6, 6, 6, 6, 4],
      rate: 20,
      m1: 1.5,
      m2: 2,
      bonus: 0,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.week.days[6]).toMatchObject({ reg: 0, ot: 4, dt: 0, isSeventhDay: true });
    expect(r.week.reg).toBe(36);
    expect(r.week.ot).toBe(4);
    expect(r.week.gross).toBe(840);
  });

  it("F10: overtime multiplier 1.25 warns", () => {
    const r = computeWeek(
      fed({ hours: [0, 8, 8, 8, 8, 8, 0], m1: 1.25 }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.warnings).toContain("Below the 1.5× federal minimum for hours over 40.");
  });

  it("F12: day over 24 errors", () => {
    const r = computeWeek(fed({ hours: [0, 25, 0, 0, 0, 0, 0] }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toBe("day_over_24");
  });
});
