import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { TeamGeneratorMount } from "@/components/teams/TeamGeneratorMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ preset?: string }>;
};

const TITLE = "Random Team Generator — Split Names into Groups";
const META =
  "Paste names, choose the number of teams or people per team, and get balanced random groups. Make pairs, reshuffle, copy or share. Free, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/random-team-generator") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/random-team-generator"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ExesTools`,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "How does the random team generator pick teams?",
    a: "It shuffles your whole list with a Fisher–Yates shuffle, using your browser's secure random number generator, then deals the names into teams one at a time. Every arrangement is equally likely, and nobody is placed on a team in advance.",
  },
  {
    q: "What happens if the names don't split evenly?",
    a: "Teams are kept as even as possible, so sizes never differ by more than one. For example, 11 names in 3 teams gives teams of 4, 4 and 3.",
  },
  {
    q: "Can I make random pairs?",
    a: 'Yes. Tap Pairs, or set People per team to 2. With an odd number of names, the extra person joins one pair to make a group of three. Switch on "Leave one person out" if you\'d rather they sit out.',
  },
  {
    q: "Can I share the teams with my group?",
    a: "Yes. Copy share link makes a link that opens the same names and the same teams. The list is stored in the part of the link after the # sign, which browsers don't send to our server. Copy teams gives you plain text for chat or email.",
  },
  {
    q: "Are the names I enter uploaded anywhere?",
    a: "No. Teams are made in your browser, and your last list is saved only on this device so it's still there next time. See the Privacy Policy for details.",
  },
  {
    q: "Can I balance teams by skill or keep certain people together?",
    a: "Not yet. Every split is fully random. If a split doesn't work for your group, press Reshuffle.",
  },
];

export default async function RandomTeamGeneratorPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const preset = typeof sp.preset === "string" && sp.preset === "pairs" ? "pairs" : null;

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Random team generator | ExesTools",
    url: absoluteUrl("/random-team-generator"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Paste a list of names and split it into balanced random teams or pairs. Choose the number of teams or people per team, reshuffle, copy or share the result. Free, no signup, and the list stays in your browser.",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Random team generator",
        item: absoluteUrl("/random-team-generator"),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />

      <nav className="mb-2 text-xs font-semibold text-muted print:hidden" aria-label="Breadcrumb">
        <Link href="/" className="text-accent hover:underline">
          Home
        </Link>
        <span className="mx-1.5">→</span>
        <span className="text-foreground">Random team generator</span>
      </nav>

      <header className="mb-3 max-w-3xl print:hidden">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Random team generator
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
          Paste one name per line, choose how many teams you need (or how many people per team), and
          press Generate teams. Names are shuffled and dealt out so team sizes never differ by more
          than one. It&apos;s free, there&apos;s no signup, and your list stays in this browser.
        </p>
      </header>

      <TeamGeneratorMount initialPresetQuery={preset} />

      <div className="mt-12 space-y-10 border-t border-border pt-10 print:hidden">
        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to make random teams
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Paste or type names, one per line (up to 200). Repeated names are flagged so you can
              tell people apart.
            </li>
            <li>
              Choose Number of teams or People per team. Tap Pairs for teams of two.
            </li>
            <li>
              Press Generate teams. Each team appears as a card with its members and a count.
            </li>
            <li>
              Press Reshuffle for a new random split, Copy teams to paste the result anywhere, or
              Copy share link to send the exact same teams to someone else.
            </li>
          </ol>
        </section>

        <section className="max-w-3xl" aria-labelledby="team-faq">
          <h2 id="team-faq" className="text-2xl font-bold tracking-tight text-foreground">
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
                  {item.q.startsWith("Are the names") ? (
                    <>
                      No. Teams are made in your browser, and your last list is saved only on this
                      device so it&apos;s still there next time. See the{" "}
                      <Link
                        href="/privacy-policy"
                        className="font-semibold text-accent hover:underline"
                      >
                        Privacy Policy
                      </Link>{" "}
                      for details.
                    </>
                  ) : (
                    item.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Calling on one student at a time instead? Use the{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>
          . Need one winner from a list? Use the{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            random name picker
          </Link>
          .
        </p>

        <RelatedTools toolId="random-team-generator" />
      </div>
    </div>
  );
}
