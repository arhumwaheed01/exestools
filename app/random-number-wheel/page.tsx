import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { QueryHydratedNumbers } from "@/components/QueryHydratedMounts";
import { RelatedLinks } from "@/components/RelatedLinks";
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
  {
    q: "Can I use the number wheel as a dice roller for tabletop games?",
    a: "Yes. Set the range to match the die, such as 1–20 for a d20 or 1–8 for a d8, and leave No repeats off so numbers can repeat like real dice.",
  },
  {
    q: "How do I pick a random day of the month?",
    a: "Set Min 1 and Max 28 for a day that exists in every month, or 1–31 if you're happy to respin when a date doesn't exist.",
  },
  {
    q: "Can I share my range with a class or a friend?",
    a: "Yes. Copy share link sends your range and settings. The other person opens the same wheel on their device.",
  },
  {
    q: "Is the number wheel good for picking a random seat?",
    a: "Yes. Set the range to your seat or table numbers and spin. Nothing on the page identifies anyone, which is handy when you'd rather not type names.",
  },
  {
    q: "Does the wheel keep the numbers I've already drawn?",
    a: "With No repeats on, drawn numbers stay out until you press Reset draws, and your recent results are listed under the wheel.",
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
        <PageMeta updated="2026-10-20" />
        <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
          Pick a range and press SPIN, and the wheel stops on a random whole number. Tap 1–10 or
          1–100, or type any Min and Max for up to 1,000 numbers. Every number has the same chance.
          Switch on No repeats to draw each number only once. Tap the 1–75 quick range to switch on
          No repeats and Show bingo letters together, so calls read like B 7 or O 68.
        </p>
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

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Even more number wheel ideas
          </h2>
          <h3 className="text-xl font-bold tracking-tight text-foreground">The short version of how it works</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Set a Min and a Max and the wheel holds every whole number between them, both ends included.
            Each spin picks one of those numbers at random with the same chance for each, and the wheel then
            stops on it. Switch on{" "}
            <span className="font-semibold text-foreground">No repeats</span>{" "}
            and a drawn number leaves the wheel, so it works like pulling numbered balls from a bag without
            putting them back. It&apos;s free and there&apos;s no account to create.
          </p>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Fresh ways to use it</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              <span className="font-semibold text-foreground">Tabletop dice:</span>{" "}
              set 1–4, 1–8, 1–10, 1–12 or 1–20 for the dice a role-playing game uses. Keep No repeats off,
              because real dice can repeat.
            </li>
            <li>
              <span className="font-semibold text-foreground">Rounding practice:</span>{" "}
              spin 1–1000 and have students round to the nearest 10 and 100. A spin of 649 rounds to 650 and
              600, which starts a nice argument about the middle.
            </li>
            <li>
              <span className="font-semibold text-foreground">Random day of the month:</span>{" "}
              1–28 for a fair pick that works in every month, or 1–31 if you&apos;ll skip invalid dates.
            </li>
            <li>
              <span className="font-semibold text-foreground">Seat numbers at events:</span>{" "}
              pick a lucky seat or table without handling anyone&apos;s name.
            </li>
            <li>
              <span className="font-semibold text-foreground">Practice problems:</span>{" "}
              spin a question number from a review sheet, with No repeats on so each one comes up once.
            </li>
          </ul>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Worked example: a rounding warm-up</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Set Min 100 and Max 999, leave No repeats off, and spin five times. Say you get 312, 845, 650,
            199 and 503.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[18rem] border-collapse text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold text-foreground">Spin</th>
                  <th className="py-2 pr-3 font-semibold text-foreground">Nearest 10</th>
                  <th className="py-2 pr-3 font-semibold text-foreground">Nearest 100</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">312</td>
                  <td className="py-2.5 pr-3">310</td>
                  <td className="py-2.5 pr-3">300</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">845</td>
                  <td className="py-2.5 pr-3">850</td>
                  <td className="py-2.5 pr-3">800</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">650</td>
                  <td className="py-2.5 pr-3">650</td>
                  <td className="py-2.5 pr-3">700</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">199</td>
                  <td className="py-2.5 pr-3">200</td>
                  <td className="py-2.5 pr-3">200</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">503</td>
                  <td className="py-2.5 pr-3">500</td>
                  <td className="py-2.5 pr-3">500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Students write their answers on whiteboards before you reveal each row. The 650 row is the one
            that sparks discussion: it&apos;s already a multiple of 10, and it sits exactly halfway between
            600 and 700, so the usual round-half-up rule sends it to 700. Using a fresh spin each time means
            nobody can memorize the answers from yesterday&apos;s worksheet.
          </p>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Tips</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              <span className="font-semibold text-foreground">Decide on No repeats before the first spin.</span>{" "}
              Changing it mid-draw makes it hard to explain which numbers were still in play.
            </li>
            <li>
              <span className="font-semibold text-foreground">Remember both ends count.</span>{" "}
              Min 1 and Max 10 is ten numbers.
            </li>
            <li>
              <span className="font-semibold text-foreground">Copy results</span>{" "}
              at the end of a draw if you need a record of what came up.
            </li>
            <li>
              <span className="font-semibold text-foreground">Send the range</span>{" "}
              with Copy share link. The link carries the range and settings, not any names.
            </li>
          </ul>
        </section>

        <RelatedLinks toolId="random-number-wheel" />

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
