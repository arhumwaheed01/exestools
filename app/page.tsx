import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { SpinnerMount } from "@/components/SpinnerMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { faqPageLd, siteGraphLd, webAppLd } from "@/lib/seo/jsonld";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const HOME_TITLE = "Free Spinner Wheel Online — Spin & Decide | ExesTools";
const HOME_META =
  "Free online spinner wheel. Add options, hit SPIN, get a fair pick. Works as a multi-option decision wheel too. No signup on ExesTools.";

const FAQ_LINK_HREFS: Record<string, string> = {
  "Yes or no wheel": "/yes-no-wheel",
  "How ExesTools picks a result": "/about#how-it-works",
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      absolute: HOME_TITLE,
    },
    description: HOME_META,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title: HOME_TITLE,
      description: HOME_META,
      url: absoluteUrl("/"),
      images: [
        {
          url: siteConfig.ogImagePath,
          width: 1200,
          height: 630,
          alt: "ExesTools Spinner Wheel",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_META,
      images: [siteConfig.ogImagePath],
    },
  };
}

const HOME_FAQS = [
  {
    q: "Is the ExesTools spinner wheel free?",
    a: "Yes. The spinner wheel is free to use, with no account or signup. It runs in your browser, so there's nothing to download or install.",
  },
  {
    q: "How is the winner chosen?",
    a: "Each spin picks one option at random, and every option has the same chance. The pick comes from your browser's built-in random number generator, and the wheel then stops on it, so the slice under the pointer is always the result. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "Can results repeat?",
    a: 'Yes. By default any option can come up again, and streaks can happen by chance. To stop repeats, switch on "Remove winner after spin (no repeats)", or choose Remove & continue when the result appears.',
  },
  {
    q: "Why can't I spin with one option?",
    a: "A spin needs at least two options. Add another line and SPIN works again. Up to 60 options fit on the wheel.",
  },
  {
    q: "Can I use this as a decision wheel?",
    a: "Yes. Put each option on its own line, such as places to eat or tasks to do, and spin. For a simple yes-or-no question, use the [Yes or no wheel].",
  },
  {
    q: "Can I save or share my wheel?",
    a: "Your list is saved in this browser automatically, so it's there next time you visit. Press Copy share link to send the same wheel to someone else. Anyone with the link can see the list.",
  },
  {
    q: "Can I spin a random letter?",
    a: 'Yes. Under Example wheels, tap Letters A–Z to load all 26 letters, or Word game letters for a 20-letter set without Q, U, V, X, Y and Z. Every letter on the wheel has the same chance. Switch on "Remove winner after spin" if you don\'t want the same letter twice in one game.',
  },
] as const;

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const encoded = typeof sp.c === "string" ? sp.c : null;
  const preset = typeof sp.preset === "string" ? sp.preset : null;

  const appLd = webAppLd({
    path: "/",
    name: "ExesTools Spinner Wheel",
    description: HOME_META,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd([...HOME_FAQS])) }}
      />

      <header className="mb-3 max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Free spinner wheel online
        </h1>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted sm:line-clamp-none sm:text-base sm:leading-relaxed">
          Add one option per line, hit SPIN, and land on a fair result. It works as a multi-option
          decision wheel when you have several choices, and there&apos;s no account to create. For
          names, classrooms, prizes, yes-or-no questions and teams, try the related tools below.
        </p>
      </header>

      <SpinnerMount toolId="home" initialEncoded={encoded} initialPresetQuery={preset} />

      <div className="mt-12 space-y-10 border-t border-border pt-10">
        <section id="how-to" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How to use the spinner wheel
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              Type one option per line, or load an Example wheel such as What to eat or Weekend
              activity.
            </li>
            <li>
              Press SPIN to spin the wheel. The option under the pointer when it stops is your
              result. Use Sound to turn spin sounds on or off, and Reset rotation to put the wheel
              back to its starting position.
            </li>
            <li>When the wheel stops, choose Spin again, Remove &amp; continue, or Close.</li>
            <li>
              Use Shuffle, Copy, Defaults, or Clear all to manage your list. Copy share link creates
              a link to this exact wheel, and Fresh wheel brings back the starter list.
            </li>
          </ol>
        </section>

        <section id="what-is" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What is a spinner wheel?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            A spinner wheel (also called a wheel spinner, random wheel, or picker wheel) turns a list
            into equal slices, so when you spin the wheel, every option has the same chance. When the
            wheel stops, the slice under the fixed pointer is the result. ExesTools picks the result
            with your browser&apos;s built-in random number generator and then turns the wheel so it
            stops on that slice, so what you see is always what was picked.
          </p>
        </section>

        <section id="multi-option" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Multi-option decision wheel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            When you need to choose among several options—not just yes or no—list each choice and
            spin. For a binary yes/no answer only, use the{" "}
            <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
              Yes or no wheel
            </Link>
            .
          </p>
        </section>

        <section id="ways-to-use" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ways to use the spinner wheel
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              Settle everyday choices. Load What to eat or Weekend activity, change the options to
              suit you, and spin instead of debating.
            </li>
            <li>
              Word games. Tap Letters A–Z to pick a starting letter for games like Scattergories or
              &quot;name an animal that starts with…&quot;. Word game letters leaves out Q, U, V, X,
              Y and Z, the same six letters the classic Scattergories letter die skips. Switch on
              &quot;Remove winner after spin&quot; so a letter doesn&apos;t come up twice in one
              game.
            </li>
            <li>
              Turn order. Add everyone&apos;s name and switch on &quot;Remove winner after
              spin&quot;. The order in which names come off the wheel is your turn order.
            </li>
            <li>
              Small jobs. List the chores or tasks and spin to see which one gets done first, or who
              picks first.
            </li>
          </ul>
        </section>

        <RelatedTools toolId="home" />

        <section className="max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {HOME_FAQS.map((item) => (
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
          Privacy details:{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
