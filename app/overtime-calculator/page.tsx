import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { OvertimeMount } from "@/components/overtime/OvertimeMount";
import { imageSizeFor } from "@/lib/imageSizes";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const PAGE_URL = "https://www.exestools.com/overtime-calculator";
const TITLE = "Overtime Calculator: Time and a Half & Double Time | ExesTools";
const DESCRIPTION =
  "Free overtime calculator for hourly pay. Weekly over 40, daily over 8, California double time and seventh-day rules, custom rates and a pay breakdown.";

const UPDATED = "2026-11-24";
const SCREENSHOT_SRC = "/tools/overtime-calculator/1.webp";
const SCREENSHOT_ALT =
  "Overtime calculator breakdown for a 50-hour week at $18.50 an hour with a $60 bonus, showing $1,083.50 gross pay.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    imagePath: siteConfig.ogImagePath,
    imageAlt: "ExesTools Overtime Calculator",
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [siteConfig.ogImagePath],
  },
};

const DOL_OVERTIME = "https://www.dol.gov/agencies/whd/overtime";
const CA_OVERTIME_FAQ = "https://www.dir.ca.gov/dlse/faq_overtime.htm";
const IRS_OVERTIME =
  "https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors";

const FAQ = [
  {
    q: "How do I calculate time and a half?",
    a: "Multiply your hourly rate by 1.5, then by your overtime hours. At $20 an hour, time and a half is $30, so 6 overtime hours add $180 to 40 regular hours at $800, for $980. If you earned a bonus that week, the overtime rate goes up a little; the calculator works that out for you.",
  },
  {
    q: "When does double time apply?",
    a: "Federal law never requires double time. California requires it after 12 hours in one day, and after 8 hours on the seventh straight workday of the workweek. Some union contracts and company policies pay it for holidays or very long shifts; set the double-time line and multiplier to match yours.",
  },
  {
    q: "Is overtime figured per paycheck or per week?",
    a: "Per workweek, which is a fixed seven-day stretch. On a two-week paycheck, 50 hours one week and 30 the next still includes 10 overtime hours, even though the total is exactly 80. Choose Two weeks here and each week is figured separately.",
  },
  {
    q: "Does this show my take-home pay?",
    a: "No. It shows gross pay, before income tax, Social Security, Medicare and any other deductions. The \"extra half\" line is there because the 2025–2028 federal overtime deduction is based on it, but the tool doesn't estimate any tax.",
  },
  {
    q: "How is this different from the time card calculator?",
    a: "The time card calculator turns clock-in and clock-out times into hours, with breaks and rounding. This page starts from hours you already know and works out the money: double time, the seventh-day rule, bonuses and your own multipliers. Plenty of people use both: total the card, then bring the daily hours here.",
  },
] as const;

const RELATED = [
  { href: "/time-card-calculator", label: "Time card calculator: turn punch times into daily hours first" },
  { href: "/random-team-generator", label: "Random team generator: split a crew into shifts or stations" },
  { href: "/random-name-picker", label: "Random name picker: pick who's on call this weekend" },
  {
    href: "/guides/office-secret-santa-planning-timeline",
    label: "Office Secret Santa planning timeline",
  },
  {
    href: "/guides/random-speaking-order-for-meetings",
    label: "Random speaking order for meetings",
  },
];

const linkCls = "font-semibold text-accent hover:underline";
const sectionCls =
  "mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden";
const h2Cls = "text-xl font-bold tracking-tight text-foreground sm:text-2xl";

export default function OvertimeCalculatorPage() {
  const appJsonLd = webAppLd({
    path: "/overtime-calculator",
    name: "Overtime Calculator",
    description: DESCRIPTION,
    category: "FinanceApplication",
    datePublished: UPDATED,
    dateModified: UPDATED,
    authorName: "Arhum Waheed",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Overtime calculator", item: PAGE_URL },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const shot = imageSizeFor(SCREENSHOT_SRC);

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
              <Link href="/" className={`${linkCls} inline-flex min-h-11 items-center`}>
                Home
              </Link>
            </li>
            <li aria-hidden className="text-muted">
              →
            </li>
            <li className="text-foreground">Overtime calculator</li>
          </ol>
        </nav>

        <h1 className="mt-4 max-w-3xl text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Overtime calculator
        </h1>
        <PageMeta updated={UPDATED} />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base print:hidden">
          Overtime calculator for hourly pay: type the hours you worked each day and your hourly
          rate, pick the rule that applies to you, and see what the week is worth at straight time,
          time and a half and double time. It covers the federal 40-hour week, a daily limit such as
          8 hours, and California&apos;s 12-hour and seventh-day rules. If you earned an attendance
          or production bonus, add it and the overtime rate goes up with it, the way federal rules
          require. Nothing you type is saved or sent anywhere.
        </p>

        <div className="overtime-tool-wrap mt-6 min-w-0">
          <OvertimeMount />
        </div>

        <section className={sectionCls}>
          <h2 className={h2Cls}>How this overtime calculator works</h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Choose the rule.</span> Federal only
              counts hours over 40 in the workweek. Daily and weekly adds a per-day line you set (8
              is the usual one) and, if you want it, a double-time line. California fills in its own
              numbers: time and a half after 8 hours in a day, double time after 12, and the
              seventh-day rule.
            </li>
            <li>
              <span className="font-semibold text-foreground">Pick one week or two.</span> On a
              two-week period, each week is figured on its own, because overtime law looks at
              workweeks, not paychecks. Fifty hours one week and thirty the next is 10 hours of
              overtime, even though the two weeks add up to exactly 80.
            </li>
            <li>
              <span className="font-semibold text-foreground">Type each day&apos;s hours.</span>{" "}
              Decimals (8.5) and hours and minutes (8:30) both work. If all you have is punch-in and
              punch-out times, total them on the{" "}
              <Link href="/time-card-calculator" className={linkCls}>
                time card calculator
              </Link>{" "}
              first and bring the daily figures here.
            </li>
            <li>
              <span className="font-semibold text-foreground">Enter your rate, and a bonus if you earned one that week.</span>{" "}
              Leave the multipliers at 1.5 and 2 unless a contract or company policy pays more.
            </li>
            <li>
              <span className="font-semibold text-foreground">Press Calculate overtime pay.</span> You
              get hours and dollars for each pay tier, a day-by-day split, and the &quot;extra
              half&quot; figure. Copy it into a message to payroll, or print it for your records.
            </li>
          </ol>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>Federal, daily and California rules side by side</h2>
          <div
            className="mt-4 overflow-x-auto focus-visible:ring-2 focus-visible:ring-accent"
            tabIndex={0}
            role="region"
            aria-label="Overtime rules compared"
          >
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-3 font-semibold text-foreground">
                    {" "}
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold text-foreground">
                    Federal (FLSA)
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold text-foreground">
                    Daily and weekly
                  </th>
                  <th scope="col" className="py-2 font-semibold text-foreground">
                    California
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60 align-top">
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-foreground">
                    Overtime starts
                  </th>
                  <td className="py-2.5 pr-3">After 40 hours in the workweek</td>
                  <td className="py-2.5 pr-3">After your daily line, or after 40 in the week</td>
                  <td className="py-2.5">
                    After 8 in a day, after 40 in the week, and from the first hour of a seventh
                    straight workday
                  </td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-foreground">
                    Double time
                  </th>
                  <td className="py-2.5 pr-3">Never required</td>
                  <td className="py-2.5 pr-3">After the line you set, if you set one</td>
                  <td className="py-2.5">
                    After 12 in a day, and after 8 on the seventh straight day
                  </td>
                </tr>
                <tr className="align-top">
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-foreground">
                    What gets checked
                  </th>
                  <td className="py-2.5 pr-3">The week as a whole</td>
                  <td className="py-2.5 pr-3">Each day, then the week</td>
                  <td className="py-2.5">Each day, then the week, then the seventh day</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            Under federal law, an 11-hour Monday isn&apos;t overtime on its own. Only the weekly
            total matters, which is why a four-day, 40-hour week pays no overtime under the Federal
            rule. A few states add a daily line, and the details differ from state to state, so check
            your state labor department if you&apos;re not in California. The U.S. Department of
            Labor&apos;s{" "}
            <a href={DOL_OVERTIME} target="_blank" rel="noopener noreferrer" className={linkCls}>
              overtime page
            </a>{" "}
            has the federal basics, and California&apos;s Labor Commissioner explains its rules in
            the{" "}
            <a href={CA_OVERTIME_FAQ} target="_blank" rel="noopener noreferrer" className={linkCls}>
              overtime FAQ
            </a>
            .
          </p>
          <p className="mt-3">
            California&apos;s seventh-day rule only applies when you work all seven days of the same
            workweek. Six days on, a day off, then six more doesn&apos;t trigger it, even though
            that&apos;s twelve workdays out of thirteen. Some jobs and approved alternative schedules
            have exceptions, so treat the result as arithmetic, not a ruling on your job.
          </p>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>Where the overtime rate comes from</h2>
          <p className="mt-3">
            Time and a half means one and a half times your regular rate, and the regular rate
            isn&apos;t always the number on your offer letter. Under federal rules, a bonus you were
            promised for attendance, output or hitting a target gets spread across every hour you
            worked that week. That lifts the rate your overtime is figured on.
          </p>
          <p className="mt-3">
            The calculator does it in two steps. First, the regular rate: your hourly pay for all
            hours, plus the bonus, divided by all hours. Then every overtime hour gets the extra half
            of that regular rate on top of straight time. A holiday gift, or a bonus your manager
            handed out without any promise ahead of time, normally stays out, so leave the bonus box
            empty for those.
          </p>
          <p className="mt-3">
            California figures flat-sum bonuses a different way, so the bonus box is hidden under the
            California rule. If a bonus was part of a California week, ask payroll how they worked it
            out.
          </p>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>The extra half and the 2025–2028 overtime deduction</h2>
          <p className="mt-3">
            For tax years 2025 through 2028, there&apos;s a federal income tax deduction tied to
            overtime. The IRS describes the amount as the &quot;half&quot; part of time and a half
            that the FLSA requires on hours over 40 in a workweek. That&apos;s not the whole overtime
            check, and it doesn&apos;t include overtime paid only because of a state rule or a union
            contract. The breakdown shows this figure on its own line, &quot;Extra half on hours over
            40,&quot; so you can see roughly where yours stands.
          </p>
          <p className="mt-3">
            It&apos;s an estimate for the period you entered, nothing more. The deduction has a yearly
            cap and income limits, and the figure that counts for your return is the one your employer
            reports. The IRS&apos;s{" "}
            <a href={IRS_OVERTIME} target="_blank" rel="noopener noreferrer" className={linkCls}>
              questions and answers on the overtime deduction
            </a>{" "}
            is the place to check the details, or ask whoever prepares your taxes.
          </p>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>Example: a 50-hour warehouse week with an attendance bonus</h2>
          <p className="mt-3">
            Dana picks orders at a distribution center for $18.50 an hour. Last week she worked 9
            hours Monday through Friday and 5 hours on Saturday, 50 hours in all, and she earned the
            $60 perfect-attendance bonus. The rule is Federal and the period is one week.
          </p>
          <Image
            src={SCREENSHOT_SRC}
            alt={SCREENSHOT_ALT}
            width={shot.width}
            height={shot.height}
            sizes="(max-width: 768px) 100vw, 768px"
            loading="lazy"
            className="my-6 h-auto w-full max-w-3xl rounded-xl border border-border"
          />
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Straight time for the first 40 hours: 40 × $18.50 = $740.00.</li>
            <li>Ten overtime hours at time and a half: 10 × $27.75 = $277.50.</li>
            <li>
              The bonus: $60.00. Spread over 50 hours, that&apos;s $1.20 an hour, so her regular rate
              for the week is $19.70.
            </li>
            <li>
              Overtime on the bonus: the extra half of $1.20 is $0.60, times 10 hours = $6.00.
            </li>
            <li>Gross for the week: $1,083.50.</li>
          </ul>
          <p className="mt-3">
            If payroll left the bonus out of the overtime rate, Dana would get $1,077.50 and be $6.00
            short. Six dollars is easy to miss on a pay stub. Over 52 weeks like this one, it&apos;s
            $312.
          </p>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>Example: seven straight days on a California line</h2>
          <p className="mt-3">
            Marco works the line at a restaurant in California for $22.00 an hour. His workweek runs
            Sunday to Saturday, and a staffing gap meant he worked all seven days: Sunday 6 hours,
            Monday 10, Tuesday 8, Wednesday 13, Thursday 8, Friday 6 and Saturday 9. That&apos;s 60
            hours under the California rule.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Monday: 8 regular, 2 at time and a half.</li>
            <li>
              Wednesday: 8 regular, 4 at time and a half (hours 9 to 12), and 1 at double time (hour
              13).
            </li>
            <li>
              Saturday is the seventh straight day, so its first 8 hours are time and a half and the
              ninth is double time. No regular hours that day.
            </li>
            <li>
              Sunday, Tuesday, Thursday and Friday are 8 hours or less, so they start out regular.
            </li>
          </ul>
          <p className="mt-3">
            That leaves 44 regular hours before the weekly check. California also pays overtime past
            40 in the week, without counting daily overtime twice, so the last 4 regular hours, on
            Friday, move to time and a half.
          </p>
          <p className="mt-3">
            Final split: 40 regular hours, 18 at time and a half and 2 at double time. Pay: 40 × $22
            = $880.00, 18 × $33 = $594.00 and 2 × $44 = $88.00, for $1,562.00. Switch the same week to
            the Federal rule and you get 40 regular and 20 overtime hours, or $1,540.00.
            California&apos;s version is $22 more, all of it from the two double-time hours.
          </p>
        </section>

        <section className={sectionCls}>
          <h2 className={h2Cls}>Things to check before you message payroll</h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">When your workweek starts.</span> A
              Wednesday-to-Tuesday workweek can turn the same shifts into a different overtime total.
              If it isn&apos;t on your pay stub, HR can tell you.
            </li>
            <li>
              <span className="font-semibold text-foreground">Holidays, sick days and paid time off.</span>{" "}
              Under federal rules they usually aren&apos;t hours worked. A week with an 8-hour paid
              holiday and 36 hours on the job is 36 hours worked, so no federal overtime, unless your
              employer&apos;s policy counts them. Enter only the hours you actually worked unless you
              know otherwise.
            </li>
            <li>
              <span className="font-semibold text-foreground">Unpaid meal breaks.</span> Leave them
              out of the daily hours. A 9-hour shift with a 30-minute unpaid lunch is 8.5 hours.
            </li>
            <li>
              <span className="font-semibold text-foreground">Two different rates in one week.</span>{" "}
              Say $17 on the register and $20 in the kitchen. Overtime is usually based on the
              weighted average: multiply the hours at each rate by that rate, add them up, divide by
              total hours, and enter the result as your hourly rate.
            </li>
            <li>
              <span className="font-semibold text-foreground">A salary doesn&apos;t settle it.</span>{" "}
              Whether you&apos;re owed overtime depends on your duties and pay level, not your job
              title. This calculator assumes an hourly rate.
            </li>
            <li>
              <span className="font-semibold text-foreground">Keep your own record.</span> Copy or
              print the breakdown each week. A note you made the same day is much better evidence than
              what you remember months later.
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl print:hidden" aria-labelledby="overtime-faq-heading">
          <h2 id="overtime-faq-heading" className={h2Cls}>
            Overtime pay questions
          </h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface open:border-accent/40"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded px-4 py-3 outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <span
                    aria-hidden
                    className="text-lg font-bold text-muted transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 max-w-3xl print:hidden">
          <h2 className={h2Cls}>More for the working week</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            These don&apos;t calculate pay, but they help with the rest of running a shift.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {RELATED.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent"
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
