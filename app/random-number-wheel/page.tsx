import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { QueryHydratedNumbers } from "@/components/QueryHydratedMounts";
import { RelatedTools } from "@/components/RelatedTools";
import { loadToolPageMarkdown } from "@/lib/toolPageMarkdown";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { faqPageLd, toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const NUMBER_WHEEL_REWRITE = loadToolPageMarkdown("random-number-wheel-rewrite.md");

const TITLE = "Random Number Wheel — Spin 1–100 or Any Range | ExesTools";
const META =
  "Spin a random number wheel for 1–10, 1–100 or any range up to 1,000 numbers. Draw with or without repeats and keep a list of results. Free.";

const FAQ_LINK_HREFS: Record<string, string> = {
  "How ExesTools picks a result": "/about#how-it-works",
  "prize wheel": "/prize-wheel",
  "raffle generator": "/raffle-generator",
  "bingo card generator": "/bingo-card-generator",
};

function FaqAnswer({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]$/.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const label = m[1];
        const href = FAQ_LINK_HREFS[label];
        if (!href) return <span key={i}>{label}</span>;
        return (
          <Link key={i} href={href} className="font-semibold text-accent hover:underline">
            {label}
          </Link>
        );
      })}
    </>
  );
}

export const metadata: Metadata = {
  title: {
    absolute: TITLE,
  },
  description: META,
  alternates: { canonical: absoluteUrl("/random-number-wheel") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-number-wheel"),
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "Is every number equally likely?",
    a: "Yes. Each whole number still on the wheel has the same chance on every spin. The pick comes from your browser's secure random number generator, and the wheel then stops on that number. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "How do I pick a random number between 1 and 100?",
    a: "Tap the 1–100 quick range and press SPIN. Every number has a 1 in 100 chance on each spin.",
  },
  {
    q: "Can I draw several numbers without repeats?",
    a: "Yes. Switch on No repeats. Each drawn number leaves the wheel until you press Reset draws, and your last 20 results are listed under Recent results.",
  },
  {
    q: "What's the biggest range?",
    a: "Up to 1,000 numbers in one range, such as 1–1000. Negative numbers work too.",
  },
  {
    q: "Can I use it as a bingo number caller?",
    a: "Yes, for a simple game. Tap the 1–75 quick range: that switches on No repeats and Show bingo letters, so calls look like B 7 or O 68. You can turn letters off with the toggle. Recent results lists your last 20 calls. For the players' cards, use the [bingo card generator].",
  },
  {
    q: "Can I use it for a raffle?",
    a: "Yes, for up to 1,000 numbered tickets: set Min and Max to your ticket range and switch on No repeats. For bigger ranges, names with several tickets each, or several winners and alternates in one draw, use the [raffle generator]. To spin for names on a wheel, use the [prize wheel].",
  },
  {
    q: "Can the same number come up twice in a row?",
    a: "Yes, when No repeats is off. Each spin is independent, so on 1–10 the same number can land twice in a row about one time in ten. Switch on No repeats if each number should only appear once until you reset.",
  },
  {
    q: "Do negative numbers work on the wheel?",
    a: "Yes. Set a negative Min or Max—for example −10 to 10. The wheel picks one whole number at random from every number still in that range.",
  },
  {
    q: "What happens when every number has been drawn?",
    a: "With No repeats on, each result leaves the wheel until the range is empty. The tool then tells you and offers Reset draws so you can run the range again.",
  },
] as const;

const ALL_FAQS = [...FAQS, ...NUMBER_WHEEL_REWRITE.faqs];

export default function RandomNumberWheelPage() {
  const appLd = webAppLd({
    path: "/random-number-wheel",
    name: "Random Number Wheel",
    description: META,
    featureList: ["Up to 1,000 numbers", "No-repeat draws", "Bingo letters"],
  });

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Random number wheel",
        item: absoluteUrl("/random-number-wheel"),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd([...ALL_FAQS])) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />

      <nav className="mb-2 text-xs text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-accent hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">Random number wheel</li>
        </ol>
      </nav>

      <header className="mb-3 max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Random number wheel
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
          Pick a range and press SPIN, and the wheel stops on a random whole number. Tap 1–10 or
          1–100, or type any Min and Max for up to 1,000 numbers. Every number has the same chance.
          Switch on No repeats to draw each number only once. Tap the 1–75 quick range to switch on
          No repeats and Show bingo letters together, so calls read like B 7 or O 68.
        </p>
        <PageMeta updated="2026-10-13" />
      </header>

      <QueryHydratedNumbers />

      <div className="mt-12 space-y-10 border-t border-border pt-10">
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How to spin a random number
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              Tap a quick range, or type a Min and a Max. Use whole numbers, with up to 1,000 numbers
              in the range. Negative numbers work too.
            </li>
            <li>
              Press SPIN. The number under the pointer is your result, shown in large type under the
              wheel.
            </li>
            <li>
              Switch on No repeats if each number should come up only once. Drawn numbers leave the
              wheel until you press Reset draws.
            </li>
            <li>
              Your last 20 numbers are listed under Recent results. Press Copy results to paste them
              anywhere, or Copy share link to send this range to someone else.
            </li>
          </ol>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ways to use a number wheel
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              In the classroom. Give each student or desk a number and spin to call on someone, pick
              which question to answer first, or choose a page to read aloud. For quick math
              warm-ups, spin twice and have the class add, subtract or multiply the two numbers. To
              number students off into groups, use the{" "}
              <Link
                href="/random-team-generator"
                className="font-semibold text-accent hover:underline"
              >
                random team generator
              </Link>
              .
            </li>
            <li>
              Board games. Tap 1–6 when a die goes missing. Each spin gives one number from 1 to 6
              with the same chance as a fair die.
            </li>
            <li>
              Bingo. Tap the 1–75 quick range for a simple US-style bingo caller. That turns on No
              repeats and Show bingo letters, so each call looks like B 7 or O 68 and is never
              repeated (you can turn letters off with the toggle). For 90-ball bingo, set Min 1 and
              Max 90. To make the cards, use the{" "}
              <Link
                href="/bingo-card-generator"
                className="font-semibold text-accent hover:underline"
              >
                bingo card generator
              </Link>
              : it prints 75-ball or word cards and has its own caller and card checker.
            </li>
            <li>
              Numbered raffle tickets. Set Min and Max to the first and last ticket numbers, switch
              on No repeats, and spin once per prize. For more than 1,000 tickets, unsold numbers to
              leave out, several winners in one go, or a written record, use the{" "}
              <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
                raffle generator
              </Link>
              .
            </li>
            <li>
              Guessing games and everyday picks. Think of a number and let someone guess, pick a
              random page of a book, or choose which day of the month to do something.
            </li>
          </ul>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How the number wheel picks, and what No repeats changes
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <p>
              Each spin picks one number from the numbers still on the wheel, using your
              browser&apos;s secure random number generator, and every one of them has the same
              chance. The wheel then stops on that number, so the number under the pointer is always
              the result. Nothing is decided by how hard or how long the wheel spins.
            </p>
            <p>
              With No repeats off, every spin is independent. The wheel doesn&apos;t remember earlier
              results, so on 1–10 the same number comes up twice in a row about one time in ten.
              Streaks like that are normal with real randomness.
            </p>
            <p>
              With No repeats on, each drawn number leaves the wheel, so the remaining numbers become
              more likely as the pool shrinks. On 1–10, each number has a 1 in 10 chance on the first
              spin, 1 in 9 on the second, and the last number left is certain. That&apos;s how a
              bingo caller or a ticket draw works.
            </p>
            <p>
              Up to 60 numbers, every slice has its own label. On bigger ranges the slices get very
              thin, so the wheel labels every few slices and shows the result in large type. Every
              number is still in the draw.
            </p>
          </div>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Odds on a number wheel
          </h2>
          <div
            className="mt-3 overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Number wheel odds table"
          >
            <table className="w-full min-w-[20rem] border-collapse text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold text-foreground">Range</th>
                  <th className="py-2 pr-3 font-semibold text-foreground">Chance per spin</th>
                  <th className="py-2 pr-3 font-semibold text-foreground">
                    With No repeats: 2nd draw
                  </th>
                  <th className="py-2 font-semibold text-foreground">10th draw</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">1–6</td>
                  <td className="py-2.5 pr-3">1 in 6 (about 16.7%)</td>
                  <td className="py-2.5 pr-3">1 in 5</td>
                  <td className="py-2.5">n/a</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">1–10</td>
                  <td className="py-2.5 pr-3">1 in 10 (10%)</td>
                  <td className="py-2.5 pr-3">1 in 9</td>
                  <td className="py-2.5">1 in 1 (last number)</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">1–75 (bingo)</td>
                  <td className="py-2.5 pr-3">1 in 75 (about 1.3%)</td>
                  <td className="py-2.5 pr-3">1 in 74</td>
                  <td className="py-2.5">1 in 66</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">1–100</td>
                  <td className="py-2.5 pr-3">1 in 100 (1%)</td>
                  <td className="py-2.5 pr-3">1 in 99</td>
                  <td className="py-2.5">1 in 91</td>
                </tr>
                <tr className="align-top">
                  <td className="py-2.5 pr-3">1–1000</td>
                  <td className="py-2.5 pr-3">1 in 1,000 (0.1%)</td>
                  <td className="py-2.5 pr-3">1 in 999</td>
                  <td className="py-2.5">1 in 991</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            With No repeats off, every spin is independent, so the odds stay the same as the first
            column on every spin.
          </p>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Pick a number from 1 to 100
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Tap 1–100 and press SPIN. Each number from 1 to 100 has a 1% chance. To draw several
            different numbers, for example 5 winners from 100 tickets, switch on No repeats and spin
            five times. Press Copy results to paste the list anywhere. For 90-ball bingo, set Min 1
            and Max 90.
          </p>
        </section>

        <GuideMarkdown content={NUMBER_WHEEL_REWRITE.content} />

        <section className="max-w-3xl" aria-labelledby="number-faq-heading">
          <h2 id="number-faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {ALL_FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface px-4 py-3 open:border-accent/40"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-muted transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <FaqAnswer text={item.a} />
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="max-w-3xl text-sm text-muted">
          Choosing between names or options instead of numbers? Use the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            spinner wheel
          </Link>
          .
        </p>

        <RelatedTools toolId="random-number-wheel" />
      </div>
    </div>
  );
}
