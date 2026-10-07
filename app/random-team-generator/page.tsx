import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { TeamGeneratorMount } from "@/components/teams/TeamGeneratorMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { webAppLd } from "@/lib/seo/jsonld";

type PageProps = {
  searchParams: Promise<{ preset?: string }>;
};

const TITLE = "Random Team Generator: Groups & Pairs from Names | ExesTools";
const META =
  "Paste names and split them into random teams, groups or pairs. Choose the number of teams or people per team, reshuffle, print or share. Free, no signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/random-team-generator") },
  openGraph: {
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-team-generator"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
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
    q: "How does the random team generator pick teams?",
    a: "It shuffles your whole list with a Fisher–Yates shuffle, using your browser's secure random number generator, then deals the names into teams one at a time. Every arrangement is equally likely, and nobody is placed on a team in advance. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "How do I make random partners for my class?",
    a: "Paste your class list, tap Pairs, and press Generate teams. Every student gets a partner, and with an odd number one group has three. Press Reshuffle for a new set.",
  },
  {
    q: "How do I shuffle names into groups?",
    a: "Paste the names one per line, choose how many groups (or how many people per group), and press Generate teams. The list is shuffled and dealt out evenly.",
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
    q: "Can I make groups of 3?",
    a: "Yes. Set People per team to 3. If the class doesn't divide evenly, a few groups have one person fewer.",
  },
  {
    q: "Will it avoid putting the same partners together next time?",
    a: "No. Each split is independent and the tool doesn't keep a history of past pairs. If two people land together again, press Reshuffle.",
  },
  {
    q: "Can I share the teams with my group?",
    a: "Yes. Copy share link makes a link that opens the same names and the same teams. The list is stored in the part of the link after the # sign, which browsers don't send to our server. Copy teams gives you plain text for chat or email.",
  },
  {
    q: "Are the names I enter uploaded anywhere?",
    a: "No. Teams are made in your browser, and your last list is saved only on this device so it's still there next time. See the [Privacy Policy] for details.",
  },
  {
    q: "Can I balance teams by skill or keep certain people together?",
    a: "Not yet. Every split is fully random. If a split doesn't work for your group, press Reshuffle.",
  },
  {
    q: "How is this different from the classroom spinner or name picker?",
    a: "This page splits a whole list into several groups at once. The [classroom spinner] and [random name picker] pick one name at a time with a wheel. Use this tool when you need project groups, lab partners, or game teams in one step.",
  },
  {
    q: "How many names can I add?",
    a: "Up to 200 names. You can make up to 50 teams, or up to 100 people per team. If you only need to call on one person at a time, the wheel tools (60 names max) are a better fit.",
  },
];

export default async function RandomTeamGeneratorPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const preset = typeof sp.preset === "string" && sp.preset === "pairs" ? "pairs" : null;

  const appLd = webAppLd({
    path: "/random-team-generator",
    name: "Random Team Generator",
    description: META,
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
        <Link href="/" className="text-accent hover:underline">
          Home
        </Link>
        <span className="mx-1.5">→</span>
        <span className="text-foreground">Random team generator</span>
      </nav>

      <header className="mb-3 max-w-3xl print:hidden">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Random team generator for groups and pairs
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
              Paste or type names, one per line (up to 200). Empty lines are ignored. If the same
              name appears more than once, you&apos;ll see a notice so you can add an initial and
              tell people apart.
            </li>
            <li>
              Choose Number of teams (2–50) or People per team (1–100). Tap Pairs when you want
              groups of two. Optional team names let you label the cards, for example Red and Blue.
            </li>
            <li>
              Press Generate teams. Each team appears as a card with its members and a count. Team
              sizes stay as even as possible—never more than one person apart.
            </li>
            <li>
              Press Reshuffle for a new random split of the same list, Copy teams to paste the
              result into chat or a document, Print for a paper handout, or Copy share link to send
              the exact same names and teams to someone else.
            </li>
          </ol>
          <p className="mt-3">
            The split runs entirely in your browser. Nothing about your roster is sent to ExesTools
            servers when you generate teams. A share link packs the list into the part of the URL
            after the # sign, so only people who receive that link can open the same result.
          </p>
        </section>

        <section
          id="classroom"
          className="max-w-3xl scroll-mt-24 text-sm leading-relaxed text-muted sm:text-base"
        >
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Random groups for the classroom
          </h2>
          <p className="mt-3">
            Paste your class list once, then set Number of teams for table groups or People per team
            for groups of 3 or 4. Teams never differ by more than one student, so 26 students in
            groups of 4 become five groups of 4 and two groups of 3. Show the result on your board,
            press Print for a paper copy, or Copy share link to send the same groups to a
            co-teacher. Your list stays in this browser, so it&apos;s there next lesson.
          </p>
        </section>

        <section
          id="pairs"
          className="max-w-3xl scroll-mt-24 text-sm leading-relaxed text-muted sm:text-base"
        >
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Random pair generator for partner work
          </h2>
          <p className="mt-3">
            For think-pair-share, lab partners, peer editing or reading buddies, tap{" "}
            <span className="font-semibold text-foreground">Pairs</span> (or set People per team to
            2) and press Generate teams. With an odd number of students, one pair becomes a group of
            three so nobody is left out. Switch on{" "}
            <span className="font-semibold text-foreground">Leave one person out</span> if you need
            strict pairs. Press Reshuffle for new partners. Each reshuffle is a fresh random deal.
            The tool doesn&apos;t remember earlier rounds, so the same two students can be paired
            again.
          </p>
          <p className="mt-3">
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
            Ways to use a random team generator
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Classroom groups.</span> Split a
              class into project teams, lab partners, or reading circles without picking favorites.
              Paste the roster, set the number of groups you need, generate, then Print or Copy
              teams for the board. If you only need to call on one student at a time, use the{" "}
              <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
                classroom spinner
              </Link>{" "}
              instead.
            </li>
            <li>
              <span className="font-semibold text-foreground">Workshops and breakouts.</span>{" "}
              Divide attendees into discussion tables or breakout rooms. Set People per team to the
              room size you want, generate once, and paste the cards into the chat so everyone can
              find their group.
            </li>
            <li>
              <span className="font-semibold text-foreground">Sports and pickup games.</span> Avoid
              the captain pick, where the same people get chosen last. Make two or more sides with
              Number of teams, or use Pairs for doubles. Press Reshuffle if the first split looks
              lopsided by chance—each reshuffle is a fresh, independent deal.
            </li>
            <li>
              <span className="font-semibold text-foreground">Events, trivia, and parties.</span>{" "}
              Split guests into quiz teams or scavenger-hunt crews. Add optional team names so the
              cards match your theme, then Copy share link so phones in the room can open the same
              groups.
            </li>
          </ul>
        </section>

        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Tips for balanced teams and odd counts
          </h2>
          <p className="mt-3">
            Balanced here means sizes that differ by at most one person, not matched skill levels.
            The generator does not know who is strong at math or who should not sit together. It
            shuffles the full list, then deals names into teams like dealing cards, so every fair
            arrangement is equally likely.
          </p>
          <p className="mt-3">
            Odd counts are normal. Eleven people into three teams becomes 4, 4, and 3. With Pairs
            and an odd roster, one group becomes three unless you switch on Leave one person out.
            That option is useful when you need strict pairs and one person can sit out a round.
          </p>
          <p className="mt-3">
            If two people share a first name, add a last initial before you generate—otherwise the
            duplicate notice flags them and the cards can look confusing later. After a generate,
            skim the cards once: typos that split one person into two lines (Maria and Mariah) are
            the most common mistake. Fix the list and press Reshuffle.
          </p>
          <p className="mt-3">
            Reshuffle keeps your settings and list, but builds a completely new random split. Use
            it when chance put close friends on every team together, or when you simply want another
            draw for a second activity. It does not remember previous teams, so the same two people
            can land together again—that is expected with real randomness.
          </p>
        </section>

        <section className="max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            What this tool does not do
          </h2>
          <p className="mt-3">
            It does not weight people by skill, keep partners apart with rules, or sync with Google
            Classroom or a grade book. Those jobs need other systems. ExesTools stays a fast,
            browser-only splitter: paste, choose a size, generate, share or print. For a private
            gift exchange with exclusions, use the{" "}
            <Link href="/secret-santa-generator" className="font-semibold text-accent hover:underline">
              Secret Santa generator
            </Link>
            ; for one name at a time on a wheel, stay with the name picker or classroom spinner.
          </p>
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
