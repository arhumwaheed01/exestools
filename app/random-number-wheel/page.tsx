import type { Metadata } from "next";
import Link from "next/link";
import { NumberWheelMount } from "@/components/number/NumberWheelMount";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { faqPageLd, webAppLd } from "@/lib/seo/jsonld";
import { ALLOWED_NUMBER_PRESET_QUERY } from "@/lib/range";

type PageProps = {
  searchParams: Promise<{ preset?: string }>;
};

const TITLE = "Random Number Wheel — Spin 1–100 or Any Range | ExesTools";
const META =
  "Spin a random number wheel for 1–10, 1–100 or any range up to 1,000 numbers. Draw with or without repeats and keep a list of results. Free.";

const FAQ_LINK_HREFS: Record<string, string> = {
  "How ExesTools picks a result": "/about#how-it-works",
  "prize wheel": "/prize-wheel",
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
  openGraph: {
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-number-wheel"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
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
    q: "How do I spin a number between 1 and 100?",
    a: "Tap 1–100, then press SPIN. For any other range, type the lowest number in Min and the highest in Max.",
  },
  {
    q: "Can I stop numbers from repeating?",
    a: "Yes. Switch on No repeats. Each drawn number comes off the wheel until you press Reset draws, and when every number has been drawn, the wheel tells you and offers a reset.",
  },
  {
    q: "What's the largest range I can use?",
    a: "Up to 1,000 numbers at once, for example 1–1000 or 500–1499. Negative numbers work too, like −10 to 10. On big ranges the wheel shows fewer labels so it stays readable, but every number is still in the draw.",
  },
  {
    q: "Can I use it as a bingo number caller?",
    a: "Yes, for a simple game. Tap 1–75, which also switches on No repeats, then turn on Show bingo letters to see calls like B 7 or O 68. Recent results lists your last 20 calls. You'll still need bingo cards for the players.",
  },
  {
    q: "Can I use it for a raffle?",
    a: "Yes, if your tickets are numbered: set Min and Max to your ticket range and switch on No repeats. If your entries are names, use the [prize wheel] instead.",
  },
] as const;

export default async function RandomNumberWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const preset =
    typeof sp.preset === "string" && ALLOWED_NUMBER_PRESET_QUERY.has(sp.preset)
      ? sp.preset
      : null;

  const appLd = webAppLd({
    path: "/random-number-wheel",
    name: "Random Number Wheel",
    description: META,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd([...FAQS])) }}
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
          Pick a range, press SPIN, and the wheel stops on a random whole number. Use a quick range
          like 1–10, 1–100 or 1–1000, or type your own Min and Max. Switch on No repeats to draw each
          number only once, for bingo, numbered raffle tickets, or calling on numbered seats. It&apos;s
          free, and there&apos;s no signup.
        </p>
      </header>

      <NumberWheelMount initialPresetQuery={preset} />

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
              warm-ups, spin twice and have the class add, subtract or multiply the two numbers.
            </li>
            <li>
              Board games. Tap 1–6 when a die goes missing. Each spin gives one number from 1 to 6
              with the same chance as a fair die.
            </li>
            <li>
              Bingo. Tap 1–75 for a simple US-style bingo caller. No repeats and bingo letters switch
              on, so each call looks like B 7 or O 68 and is never repeated. For 90-ball bingo, set
              Min 1 and Max 90.
            </li>
            <li>
              Numbered raffle tickets. Set Min and Max to the first and last ticket numbers, switch
              on No repeats, and spin once per prize. If your entries are names, use the{" "}
              <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
                prize wheel
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

        <section className="max-w-3xl" aria-labelledby="number-faq-heading">
          <h2 id="number-faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((item) => (
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
