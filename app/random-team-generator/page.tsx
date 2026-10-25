import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RelatedTools } from "@/components/RelatedTools";
import { QueryHydratedTeams } from "@/components/QueryHydratedMounts";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const TITLE = "Random Team Generator – Free Group & Pair Maker | ExesTools";
const META =
  "Paste names, pick team count or size, and get random teams, groups or pairs in one click. Reshuffle, print or share the link. Free, no account needed.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/random-team-generator") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-team-generator"),
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

const FAQ_LINK_HREFS: Record<string, string> = {
  "How ExesTools picks a result": "/about#how-it-works",
  "Privacy Policy": "/privacy-policy",
  "classroom spinner": "/classroom-spinner",
  "random name picker": "/random-name-picker",
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

const FAQS = [
  {
    q: "How do I split a list into random teams?",
    a: "Paste the names one per line, choose a number of teams or a team size, and press Generate teams. Reshuffle for a new split.",
  },
  {
    q: "Can it make random pairs?",
    a: "Yes. Use the pairs preset, or set 2 people per team. With an odd number, one group gets three.",
  },
  {
    q: "What happens if the names don't divide evenly?",
    a: "Teams are filled as evenly as possible, so sizes differ by at most one person.",
  },
  {
    q: "Can I share the teams with my group?",
    a: "Yes. Copy share link sends the same names and teams, Copy teams gives plain text for chat, and Print makes a handout.",
  },
  {
    q: "Can I name the teams?",
    a: "Yes. Add your own team names before you generate.",
  },
  {
    q: "Is it free, and are my names saved?",
    a: "It's free with no account. Your list stays in your browser.",
  },
];

export default function RandomTeamGeneratorPage() {
  const appLd = webAppLd({
    path: "/random-team-generator",
    name: "Random Team Generator",
    description: META,
    featureList: ["Number of teams or team size", "Pairs", "Reshuffle", "Print"],
  });

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a.replace(/\[|\]/g, "") },
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
        <Link
          href="/"
          className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
        >
          Home
        </Link>
        <span className="mx-1.5">→</span>
        <span className="text-foreground">Random team generator</span>
      </nav>

      <header className="mb-3 max-w-3xl print:hidden">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Random Team Generator: Split Names into Teams, Groups or Pairs
        </h1>
        <PageMeta updated="2026-10-21" />
        <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
          Paste your names, choose how many teams (or how many people per team), and hit Generate.
          Don&apos;t like the split? Reshuffle. Then print it, copy it into the group chat, or send a
          link so everyone sees the same teams. It&apos;s free and there&apos;s no account; your list
          stays in your browser.
        </p>
      </header>

      <QueryHydratedTeams />

      <div className="mt-12 space-y-10 border-t border-border pt-10 print:hidden">
        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to make random teams
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Paste names, one per line. A column copied from a spreadsheet works.</li>
            <li>
              Choose <span className="font-semibold text-foreground">number of teams</span>{" "}
              (&quot;4 teams&quot;) or{" "}
              <span className="font-semibold text-foreground">people per team</span> (&quot;3
              each&quot;).
            </li>
            <li>
              Press <span className="font-semibold text-foreground">Generate teams</span>. Want
              partners instead? Open the{" "}
              <Link
                href="/random-team-generator?preset=pairs"
                className="font-semibold text-accent hover:underline"
              >
                pairs preset
              </Link>
              .
            </li>
            <li>
              Press <span className="font-semibold text-foreground">Reshuffle</span> if you want a
              different mix, <span className="font-semibold text-foreground">Print</span> for a
              handout, <span className="font-semibold text-foreground">Copy teams</span> to paste
              into chat, or{" "}
              <span className="font-semibold text-foreground">Copy share link</span>.
            </li>
          </ol>
        </section>

        <section
          id="classroom"
          className="max-w-3xl scroll-mt-24 text-sm leading-relaxed text-muted sm:text-base"
        >
          <h2 id="pairs" className="scroll-mt-24 text-xl font-bold tracking-tight text-foreground">
            Random group generator for classrooms and pairs
          </h2>
          <p className="mt-3">
            For table groups, set Number of teams; for groups of 3 or 4, set People per team. With 26
            students in groups of 4 you get five groups of 4 and two groups of 3. For think-pair-share
            or lab partners, tap <span className="font-semibold text-foreground">Pairs</span>. With an
            odd class, one pair becomes a three unless you switch on{" "}
            <span className="font-semibold text-foreground">Leave one person out</span>.{" "}
            <Link
              href="/random-team-generator?preset=pairs"
              className="font-semibold text-accent hover:underline"
            >
              Make random pairs →
            </Link>
          </p>
        </section>

        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Where people actually use it
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Thursday five-a-side.</span> Twelve
              people turn up, so you need two sides of six. Paste the WhatsApp list, choose 2 teams,
              and post the share link before anyone starts a captain argument.
            </li>
            <li>
              <span className="font-semibold text-foreground">Year 8 science lab.</span> 29 students,
              groups of 4. Choose People per team = 4 and you get eight groups: five of 4 and three of
              3. Prefer fewer groups? Choose 7 teams instead and you get six groups of 4 and one of 5.
              Print it and stick it on the door.
            </li>
            <li>
              <span className="font-semibold text-foreground">Workshop breakouts.</span> 40
              attendees across 5 rooms. Generate, Copy teams, and paste into the facilitator doc
              before the coffee break ends.
            </li>
            <li>
              <span className="font-semibold text-foreground">Quiz night.</span> Names on the left,
              team names like &quot;Quizteama Aguilera&quot; on top, then generate and read the teams
              out.
            </li>
          </ul>
        </section>

        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Tips</h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              Odd number? Pick the number of teams, not the team size, and the extra people get
              spread across teams.
            </li>
            <li>
              If two people must not be together, reshuffle until they&apos;re apart. The tool has no
              keep-apart rule, and we&apos;d rather say so.
            </li>
            <li>
              To pick a captain or the first presenter for each team, paste that team into the{" "}
              <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
                random name picker
              </Link>
              .
            </li>
          </ul>
          <p className="mt-3">
            For odd counts, how often pure random goes lopsided, and a tiered method for mixing skill
            levels, read{" "}
            <Link
              href="/guides/how-to-make-balanced-random-teams"
              className="font-semibold text-accent hover:underline"
            >
              how to make balanced teams
            </Link>
            .
          </p>
        </section>

        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How it compares</h2>
          <p className="mt-3">
            Some generators let you lock players to a team, balance by skill or import Excel files. If
            you need those, use them. ExesTools is the quick option: paste, split, print or share,
            with a one-click pairs mode and no sign-up screen. For a gift exchange with exclusions,
            use the{" "}
            <Link href="/secret-santa-generator" className="font-semibold text-accent hover:underline">
              Secret Santa generator
            </Link>
            . Hosting Friendsgiving or Thanksgiving games? See{" "}
            <Link
              href="/guides/friendsgiving-thanksgiving-team-games"
              className="font-semibold text-accent hover:underline"
            >
              Friendsgiving and Thanksgiving team games
            </Link>
            .
          </p>
        </section>
        <RelatedLinks toolId="random-team-generator" />

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
                  <FaqAnswer text={item.a} />
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
