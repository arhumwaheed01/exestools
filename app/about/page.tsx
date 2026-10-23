import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { aboutPageGraphLd, toolOpenGraph } from "@/lib/seo/jsonld";

const ABOUT_TITLE = "About ExesTools | Who Builds It, How Picks Work, How It's Paid For";
const ABOUT_DESC =
  "ExesTools: free random-pick tools by Arhum Waheed. How picks work, how guides are written, what we will not do, and how the site is funded.";

export const metadata: Metadata = {
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESC,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: toolOpenGraph({
    title: ABOUT_TITLE,
    description: ABOUT_DESC,
    url: absoluteUrl("/about"),
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESC,
    images: [siteConfig.ogImagePath],
  },
};

const linkCls = "font-semibold text-accent hover:underline";

const TOOL_SUMMARIES: { href: string; label: string; text: string }[] = [
  {
    href: "/",
    label: "Spinner wheel",
    text: "a general decision wheel for up to 60 options, with example wheels for meals, weekend plans and word games.",
  },
  {
    href: "/random-name-picker",
    label: "Random name picker",
    text: "one name at a time, with remove-winner on by default, for meeting order, volunteers and simple draws.",
  },
  {
    href: "/classroom-spinner",
    label: "Classroom spinner",
    text: "the same idea set up for teachers, with classroom example wheels and a roster that stays in your browser between lessons.",
  },
  {
    href: "/prize-wheel",
    label: "Prize wheel",
    text: "prizes or entrant names on a wheel everyone can watch, for giveaways, streams, booths and reward days.",
  },
  {
    href: "/yes-no-wheel",
    label: "Yes or no wheel",
    text: "a two-way spin, with a Yes / No / Maybe option and a Heads / Tails coin-toss mode.",
  },
  {
    href: "/random-number-wheel",
    label: "Random number wheel",
    text: "a number from any range, with a no-repeats option for tickets, questions and bingo calls.",
  },
  {
    href: "/random-team-generator",
    label: "Random team generator",
    text: "splits a whole list into even teams or pairs in one step.",
  },
  {
    href: "/secret-santa-generator",
    label: "Secret Santa generator",
    text: "draws names with exclusions for couples and housemates, and gives each person a private link that shows only their match.",
  },
  {
    href: "/raffle-generator",
    label: "Raffle generator",
    text: "draws several winners and alternates for multiple prizes, one ticket at a time from those still in the draw, each with an equal chance.",
  },
  {
    href: "/bingo-card-generator",
    label: "Bingo card generator",
    text: "up to 100 different printable cards from your own words or numbers, with a link per player for phone play.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageGraphLd()) }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        About ExesTools
      </h1>
      <PageMeta updated="2026-10-23" />
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted sm:text-base">
        <section>
          <p>
            ExesTools is a small set of free tools for the moments when a group needs a fair
            decision: who answers next, who wins the prize, which team you&apos;re on, who buys a
            gift for whom. There are ten of them, and each one is built for a specific job rather
            than being one general wheel stretched to cover everything.
          </p>
          <p className="mt-3">
            Everything runs in your browser. There&apos;s no account to create, nothing to install,
            and the lists you type stay on your device unless you choose to share a link.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">The tools, and what each one is for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {TOOL_SUMMARIES.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className={linkCls}>
                  {t.label}
                </Link>
                : {t.text}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            The{" "}
            <Link href="/guides" className={linkCls}>
              Guides
            </Link>{" "}
            section has longer, practical articles on the work around a fair pick: running giveaways,
            calling on students, making teams and more.
          </p>
          <p className="mt-3">
            ExesTools is not affiliated with the reverse-engineering forum that has a similar name.
          </p>
        </section>

        <section>
          <h2 id="arhum" className="text-lg font-bold text-foreground scroll-mt-24">
            Who builds ExesTools
          </h2>
          <p className="mt-2">
            ExesTools is built and maintained by{" "}
            <strong className="text-foreground">Arhum Waheed</strong>, a software engineer. He writes
            the code and every guide on the site.
          </p>
          <p className="mt-2">
            He built ExesTools after needing a fair, on-screen pick for group decisions and finding
            most free wheels either needed an account, hid how they worked, or tried to be one tool
            for every job.
          </p>
          <p className="mt-2">
            The idea behind the site is simple: a fair pick should be easy to run in front of other
            people, and it should be obvious that nobody&apos;s steering it. That&apos;s why every
            tool shows the full list before you pick, lets you remove winners so everyone gets a
            turn, and lets you share a link to the exact list you used.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              Email:{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className={linkCls}>
                {siteConfig.contactEmail}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Who uses ExesTools</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">Teachers and students</strong>, for calling on
              students, classroom jobs, groups and review games.
            </li>
            <li>
              <strong className="text-foreground">Groups, teams and workplaces</strong>, for meeting
              order, door prizes and gift exchanges.
            </li>
            <li>
              <strong className="text-foreground">Streamers and creators</strong>, for on-screen
              giveaways and viewer picks.
            </li>
            <li>
              <strong className="text-foreground">Friends and families</strong>, for games, parties
              and everyday decisions.
            </li>
          </ul>
        </section>

        <section>
          <h2 id="how-it-works" className="text-lg font-bold text-foreground scroll-mt-24">
            How ExesTools picks a result
          </h2>
          <p className="mt-2">
            Every pick uses your browser&apos;s secure random number generator (
            <code className="rounded bg-surface-2 px-1 py-0.5 text-sm text-foreground">
              crypto.getRandomValues
            </code>
            ) with rejection sampling, so each option still in play has exactly the same chance. The
            result is chosen first, and the wheel animation then stops on it, so the slice under the
            pointer is always the pick. How long or how hard the wheel spins changes nothing.
            Cosmetic details such as the spin duration and sound use the browser&apos;s ordinary
            random function, and they can&apos;t affect the result.
          </p>
          <p className="mt-2">
            Each spin is independent, so streaks happen by chance. Switch on remove winner if every
            name should be picked once before any repeats.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Team generator:</strong> shuffles the whole list
              with a Fisher–Yates shuffle using the same generator, then deals names into teams.
            </li>
            <li>
              <strong className="text-foreground">Secret Santa generator:</strong> checks that a
              valid draw exists for your exclusions, then shuffles until everyone has someone
              they&apos;re allowed to draw. Nobody can draw themselves.
            </li>
            <li>
              <strong className="text-foreground">Raffle generator:</strong> draws one ticket at a
              time from the tickets still in the draw, so every ticket has the same chance. By
              default, a winner leaves the draw.
            </li>
            <li>
              <strong className="text-foreground">Bingo card generator:</strong> builds cards from a
              short set code, so the same code always makes the same cards, and checks that every
              card in a set is different. Its caller never repeats a call within a game.
            </li>
          </ul>
          <p className="mt-3">
            ExesTools is a free random picker. For the long version, with worked examples, read{" "}
            <Link href="/guides/how-random-is-a-spinner-wheel" className={linkCls}>
              How random is a spinner wheel?
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">What ExesTools won&apos;t do</h2>
          <p className="mt-2">
            Being clear about limits is part of being trustworthy, so here they are:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">It doesn&apos;t store your lists or results.</strong>{" "}
              Nothing you type is uploaded, which also means there&apos;s nothing to recover if you
              clear your browser.
            </li>
            <li>
              <strong className="text-foreground">It doesn&apos;t collect entries for you.</strong>{" "}
              There&apos;s no connection to social accounts, comment sections or forms. You paste the
              list yourself.
            </li>
            <li>
              <strong className="text-foreground">It doesn&apos;t send messages.</strong> Secret
              Santa links, raffle results and bingo player links are sent by you, through your own
              chat or email.
            </li>
            <li>
              <strong className="text-foreground">
                It isn&apos;t legal advice, and it isn&apos;t an official drawing service.
              </strong>{" "}
              Raffle and giveaway rules vary by place. Check the ones that apply to you.
            </li>
            <li>
              <strong className="text-foreground">
                It doesn&apos;t give some entries better odds than others.
              </strong>{" "}
              Every option on a wheel has the same chance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">How the tools are tested and updated</h2>
          <p className="mt-2">
            The site is actively developed. Changes are checked before release, and automated tests
            cover the important wheel and random-pick behavior, so what you see under the pointer
            stays honest.
          </p>
          <p className="mt-2">
            Every tool page and guide shows an <strong className="text-foreground">Updated</strong>{" "}
            date. When a tool changes in a way that affects a page, the page is revised and the date
            moves. The{" "}
            <a href="#changelog" className={linkCls}>
              changelog
            </a>{" "}
            below lists the bigger changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Your lists stay in your browser</h2>
          <p className="mt-2">
            Your lists are saved only in your browser, on your device, not on ExesTools servers.
            Share links carry the list inside the link itself, so anyone with the link can see it.
            Google Analytics counts visits and tool use, but the names and options you type are never
            sent to it. The{" "}
            <Link href="/privacy-policy" className={linkCls}>
              Privacy Policy
            </Link>{" "}
            has the details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">How ExesTools is paid for</h2>
          <p className="mt-2">
            ExesTools is free, and it&apos;s paid for by ads from Google AdSense on some pages.
            Visitors in the EEA, the UK and Switzerland are asked for consent through Google&apos;s
            consent message before ads use cookies for personalization.
          </p>
          <p className="mt-2">
            Ads don&apos;t decide what gets built or written. Advertisers have no say in the tools,
            the guides or how results are picked, and the text you type into a tool is never used
            for advertising. ExesTools doesn&apos;t accept paid placements or sponsored guides.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Editorial policy</h2>
          <p className="mt-2">Guides on ExesTools are written to help you do one specific thing well.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Written by a named author.</strong> Every guide has
              a byline and a published date. All current guides are written by Arhum Waheed.
            </li>
            <li>
              <strong className="text-foreground">Checked against the live tools.</strong> Any
              feature a guide mentions is checked on the live tool page on the publish date.
            </li>
            <li>
              <strong className="text-foreground">Math shown, not asserted.</strong> Where a guide
              gives odds or percentages, the working is on the page.
            </li>
            <li>
              <strong className="text-foreground">Sources linked.</strong> Research is named and
              cited. No invented statistics, no made-up testimonials.
            </li>
            <li>
              <strong className="text-foreground">Honest limits.</strong> Guides say what the tools
              don&apos;t do.
            </li>
            <li>
              <strong className="text-foreground">Not professional advice.</strong> Raffle, giveaway
              and classroom guides are practical tips, not legal advice.
            </li>
            <li>
              <strong className="text-foreground">Corrections.</strong> Spotted a mistake? Email{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className={linkCls}>
                {siteConfig.contactEmail}
              </a>{" "}
              with the page address. Fixes are made on the page and the Updated date changes.
            </li>
          </ul>
        </section>

        <section>
          <h2 id="changelog" className="text-lg font-bold text-foreground scroll-mt-24">
            Changelog
          </h2>
          <p className="mt-2">Major changes to the site, newest first.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">2026-10-23:</strong> Published{" "}
              <Link href="/guides/classroom-games-with-a-spinner-wheel" className={linkCls}>
                10 classroom games to play with a spinner wheel
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">2026-10-21:</strong> Published{" "}
              <Link href="/guides/office-secret-santa-planning-timeline" className={linkCls}>
                Office Secret Santa: a week-by-week plan for the organizer
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">2026-10-19:</strong> Contact page and Privacy Policy
              updated; worked examples, tips and new FAQs added to every tool page; published{" "}
              <Link href="/guides/bingo-games-for-classrooms-and-parties" className={linkCls}>
                Bingo game ideas for classrooms and parties
              </Link>
              ,{" "}
              <Link href="/guides/secret-santa-rules-and-budget-ideas" className={linkCls}>
                Secret Santa rules and gift exchange ideas
              </Link>
              ,{" "}
              <Link href="/guides/how-to-make-balanced-random-teams" className={linkCls}>
                How to make balanced teams
              </Link>
              , and{" "}
              <Link href="/guides/cold-calling-students-fairly" className={linkCls}>
                Fair ways to call on students
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">2026-10-13:</strong> Guides section launched,
              starting with <em>How random is a spinner wheel?</em> and{" "}
              <em>How to run a fair online giveaway</em>.
            </li>
            <li>
              <strong className="text-foreground">2026-10-13:</strong> Number wheel and classroom
              spinner pages expanded with new examples and FAQs; author bylines and updated dates
              added to tool pages.
            </li>
            <li>
              <strong className="text-foreground">2026-10-12:</strong> Terms of Service and Contact
              page updated.
            </li>
            <li>
              Older developer tools (JWT decoder, blog title generator) removed so the site could
              focus on random-pick tools.
            </li>
            <li>
              Bingo card generator launched, with printable cards, player links, a caller and a card
              checker.
            </li>
            <li>Raffle generator launched, with numbered tickets, alternates and a draw record.</li>
            <li>Secret Santa generator launched, with exclusions and private reveal links.</li>
            <li>Random team generator launched.</li>
            <li>ExesTools launched with the spinner wheel and related random-pick tools.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">For teachers</h2>
          <p className="mt-2">
            Use the{" "}
            <Link href="/classroom-spinner" className={linkCls}>
              classroom spinner
            </Link>{" "}
            for fair turn-taking with no account. Your class list stays in this browser, Remove
            winner makes sure everyone gets a turn before anyone repeats, and you can share a link
            to the same wheel when your school&apos;s policy allows. For the teaching routine, see{" "}
            <Link href="/guides/cold-calling-students-fairly" className={linkCls}>
              fair ways to call on students
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Get in touch</h2>
          <p className="mt-2">
            Found a problem or have an idea? Email{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className={linkCls}>
              {siteConfig.contactEmail}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className={linkCls}>
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
