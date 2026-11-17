import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { TimeCardMount } from "@/components/timecard/TimeCardMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const PAGE_URL = "https://www.exestools.com/time-card-calculator";
const TITLE = "Time Card Calculator — Work Hours & Overtime | ExesTools";
const DESCRIPTION =
  "Free time card calculator. Log start and end times, subtract lunch, and see weekly or biweekly hours, overtime, and a printable timesheet. No signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    imagePath: siteConfig.ogImagePath,
    imageAlt: "ExesTools Time Card Calculator",
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [siteConfig.ogImagePath],
  },
};

const DOL_OVERTIME = "https://www.dol.gov/agencies/whd/overtime";
const DOL_FS22 = "https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked";

const FAQ = [
  {
    q: "How do I use this time card calculator?",
    a: "Enter a start time and an end time for each day you worked, add unpaid lunch or other unpaid breaks, and read the totals at the bottom. You can switch between a week and a two-week timesheet, show hours as minutes or decimals, and copy, print, or download the card.",
    aPlain:
      "Enter a start time and an end time for each day you worked, add unpaid lunch or other unpaid breaks, and read the totals at the bottom. You can switch between a week and a two-week timesheet, show hours as minutes or decimals, and copy, print, or download the card.",
  },
  {
    q: "How are overtime hours counted?",
    a: "By default, hours over 40 in a workweek are overtime, which is the usual federal FLSA weekly line. You can also mark hours over 8 in a single day. If both are on, daily overtime is applied first so the same hour is not counted twice. This is a math helper, not a ruling on your workplace or state. The U.S. Department of Labor’s overtime page has the federal overview.",
    aPlain:
      "By default, hours over 40 in a workweek are overtime, which is the usual federal FLSA weekly line. You can also mark hours over 8 in a single day. If both are on, daily overtime is applied first so the same hour is not counted twice. This is a math helper, not a ruling on your workplace or state. The U.S. Department of Labor’s overtime page has the federal overview.",
  },
  {
    q: "What are decimal hours?",
    a: "Decimal hours are minutes written as a fraction of an hour, which many payroll forms ask for. Divide minutes by 60: 15 minutes is 0.25, 30 minutes is 0.50. An 8-hour, 15-minute day is 8.25 decimal hours. The card lists both formats together.",
    aPlain:
      "Decimal hours are minutes written as a fraction of an hour, which many payroll forms ask for. Divide minutes by 60: 15 minutes is 0.25, 30 minutes is 0.50. An 8-hour, 15-minute day is 8.25 decimal hours. The card lists both formats together.",
  },
  {
    q: "Can I enter a shift that goes past midnight?",
    a: "Yes. If the end time is earlier than the start time, the calculator treats the end as the next morning. A 10:00 PM to 6:00 AM shift is 8 hours before any unpaid break. If that was not an overnight shift, check the AM/PM setting or switch to 24-hour time.",
    aPlain:
      "Yes. If the end time is earlier than the start time, the calculator treats the end as the next morning. A 10:00 PM to 6:00 AM shift is 8 hours before any unpaid break. If that was not an overnight shift, check the AM/PM setting or switch to 24-hour time.",
  },
  {
    q: "Does this time card calculator keep my timesheet?",
    a: "The current card is saved only in this browser, on this device, so you can come back and finish it. ExesTools does not keep a copy on a server. If you need a record, print the timesheet or download the CSV. Clearing the site’s data in your browser deletes the saved card.",
    aPlain:
      "The current card is saved only in this browser, on this device, so you can come back and finish it. ExesTools does not keep a copy on a server. If you need a record, print the timesheet or download the CSV. Clearing the site’s data in your browser deletes the saved card.",
  },
  {
    q: "Will this tell me my take-home pay?",
    a: "No. If you enter an hourly rate, you only get estimated gross pay: regular hours times the rate, plus overtime hours at time-and-a-half. Tax, benefits, and other deductions are not subtracted, and the number is not a paycheck.",
    aPlain:
      "No. If you enter an hourly rate, you only get estimated gross pay: regular hours times the rate, plus overtime hours at time-and-a-half. Tax, benefits, and other deductions are not subtracted, and the number is not a paycheck.",
  },
] as const;

const RELATED = [
  { href: "/random-team-generator", label: "Random team generator" },
  { href: "/random-name-picker", label: "Random name picker" },
  { href: "/raffle-generator", label: "Raffle generator" },
  { href: "/secret-santa-generator", label: "Secret Santa generator" },
  { href: "/prize-wheel", label: "Prize wheel" },
  {
    href: "/guides/office-secret-santa-planning-timeline",
    label: "Office Secret Santa planning timeline (guide)",
  },
  {
    href: "/guides/random-speaking-order-for-meetings",
    label: "Random speaking order for meetings (guide)",
  },
];

const linkCls = "font-semibold text-accent hover:underline";

export default function TimeCardCalculatorPage() {
  const appJsonLd = webAppLd({
    path: "/time-card-calculator",
    name: "Time Card Calculator",
    description: DESCRIPTION,
    dateModified: "2026-11-17",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Time card calculator",
        item: PAGE_URL,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.aPlain },
    })),
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <nav aria-label="Breadcrumb" className="print:hidden text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className={linkCls}>
                Home
              </Link>
            </li>
            <li aria-hidden className="text-muted">
              →
            </li>
            <li className="text-foreground">Time card calculator</li>
          </ol>
        </nav>

        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Time card calculator
        </h1>
        <PageMeta updated="2026-11-17" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Time card calculator for a full work week: type each day’s start and end, take out unpaid
          lunch or other breaks, and read the total as hours and minutes or as decimal hours. You
          can run a single week or a two-week timesheet, flag overtime after 40 hours, and print or
          download the card. Everything is added up in your browser, so the times stay on this
          device unless you copy, print, or export them yourself.
        </p>

        <div className="timecard-tool-wrap mt-6 min-w-0">
          <TimeCardMount />
        </div>

        <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to add up a work week
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              Choose Week or Biweekly, and set the first day of your workweek if it isn’t Monday. The
              federal rule looks at a fixed seven-day window, not a calendar month, so the start day
              should match what your job uses.
            </li>
            <li>
              For each day you worked, enter a start time and an end time. Use AM/PM or switch the
              card to 24-hour time. A shift that begins at night and ends after midnight is fine; the
              calculator carries it into the next morning.
            </li>
            <li>
              Add unpaid lunch or other unpaid breaks. Anything you add here is subtracted. If a
              short rest is paid at your workplace, leave it off the card so the hours stay in the
              total.
            </li>
            <li>
              Check the summary. You’ll see regular hours, overtime hours if you turned that on, and
              a timesheet you can copy, print, or save as a CSV file for your own records.
            </li>
            <li>
              There is no signup. If you come back in the same browser, the last card you edited is
              still there. Clearing this site’s data in the browser clears the card too.
            </li>
          </ol>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How overtime hours are counted
          </h2>
          <p className="mt-3">
            Under the U.S. Fair Labor Standards Act (FLSA), overtime for most hourly employees is
            figured on a workweek: hours actually worked over 40 in that seven-day period are
            overtime hours. A workweek is any fixed period of 168 hours; it does not have to start on
            Sunday, but it should not slide around from week to week. The U.S. Department of Labor
            explains this in its{" "}
            <a href={DOL_OVERTIME} target="_blank" rel="noopener noreferrer" className={linkCls}>
              overtime overview
            </a>{" "}
            and in{" "}
            <a href={DOL_FS22} target="_blank" rel="noopener noreferrer" className={linkCls}>
              Fact Sheet 22 on hours worked
            </a>
            .
          </p>
          <p className="mt-3">
            This calculator’s default follows that weekly 40-hour line. If you also switch on daily
            overtime, hours over 8 in a single day are marked first, and any leftover regular hours
            are then checked against the 40-hour week, so the same hour is not counted twice. Some
            states have their own daily rules, including rules this page does not try to model, such
            as double time or a seventh-day rule. The daily option is only a helper.
          </p>
          <p className="mt-3">
            Two weeks of pay is not the same thing as one 80-hour bucket. A biweekly timesheet still
            has two workweeks. Forty hours of overtime math is applied to each week on its own, then
            the two weeks are added for your period total.
          </p>
          <p className="mt-3">
            If you type an hourly rate, the page can show estimated gross pay at regular time and at
            time-and-a-half for overtime hours. That figure is hours times the rate only. It does not
            withhold tax or anything else, and it is not legal, tax, or payroll advice. Your
            employer’s policy, a union contract, or a state rule can be stricter than the federal
            baseline. When in doubt, read the Department of Labor pages linked above or ask payroll.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Decimal hours, minutes, and rounding
          </h2>
          <p className="mt-3">
            Payroll systems often want decimal hours, not a clock reading. To get the decimal, divide
            the minutes by 60. Fifteen minutes is 0.25, thirty minutes is 0.50, and six minutes is
            0.10. This timesheet shows both: 8:15 and 8.25.
          </p>
          <p className="mt-3">
            Some workplaces also round each punch to a short increment, commonly 5, 6, or 15 minutes.
            A widely used 15-minute pattern is to leave a punch as-is when it is 1 to 7 minutes past
            the increment, and to move it forward when it is 8 to 14 minutes past. The 6-minute
            setting (a tenth of an hour) moves forward at 3 minutes past the increment; the 5-minute
            setting moves forward at 3 minutes past. Rounding here is applied to clock-in and
            clock-out times, not to a break you already entered as a length.
          </p>
          <p className="mt-3">
            Whether a given rounding rule is allowed at your job is a policy question, not something
            this page can settle. The Department of Labor’s hours-worked guidance is the better
            source for the federal baseline, and your employee handbook is the source for what your
            workplace actually does. If you need the exact minutes you typed, leave rounding off.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-foreground">A worked example</h2>
          <p className="mt-3">
            Say you worked Monday through Friday, 7:03 AM to 3:36 PM, with a 30-minute unpaid lunch,
            and the card is set to a Monday workweek with weekly overtime only and no rounding.
          </p>
          <p className="mt-3">
            Each day runs 8 hours and 33 minutes before lunch, then 8 hours and 3 minutes after lunch,
            which is 8.05 decimal hours. Five days come to 40 hours and 15 minutes, or 40.25. Regular
            hours are 40.00 and overtime is 0.25. If your rate is $20, estimated gross pay is $800.00
            plus $7.50, or $807.50, before any tax.
          </p>
          <p className="mt-3">
            Turn on 15-minute rounding and the same punches become 7:00 AM and 3:30 PM. After the
            30-minute lunch, each day is exactly 8.00 hours, and the week has no overtime.
          </p>
          <p className="mt-3">
            On Saturday you add a 10:00 PM to 6:00 AM shift with no break. That row is flagged as
            overnight and adds 8.00 hours. The week total becomes 48.25 without rounding, of which
            8.25 is overtime.
          </p>
        </section>

        <section
          className="mt-10 max-w-3xl print:hidden"
          aria-labelledby="timecard-faq-heading"
        >
          <h2
            id="timecard-faq-heading"
            className="text-xl font-bold tracking-tight text-foreground"
          >
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.q === "How are overtime hours counted?" ? (
                    <>
                      By default, hours over 40 in a workweek are overtime, which is the usual federal
                      FLSA weekly line. You can also mark hours over 8 in a single day. If both are
                      on, daily overtime is applied first so the same hour is not counted twice. This
                      is a math helper, not a ruling on your workplace or state. The U.S. Department
                      of Labor’s{" "}
                      <a
                        href={DOL_OVERTIME}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkCls}
                      >
                        overtime page
                      </a>{" "}
                      has the federal overview.
                    </>
                  ) : (
                    item.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 max-w-3xl print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Related ExesTools tools
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            These other ExesTools pages don’t add hours, but they can help with the rest of a
            workday: split a roster with the{" "}
            <Link href="/random-team-generator" className={linkCls}>
              random team generator
            </Link>
            , pick who is on call with the{" "}
            <Link href="/random-name-picker" className={linkCls}>
              random name picker
            </Link>
            , or run a staff raffle, prize spin, or office gift exchange when you need a fair draw.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {RELATED.map((l) => (
              <li key={l.href + l.label}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
