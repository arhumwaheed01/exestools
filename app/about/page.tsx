import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { aboutPageLd, toolOpenGraph } from "@/lib/seo/jsonld";

const ABOUT_TITLE =
  "About ExesTools: Who Builds It, How Picks Work, Editorial Policy";
const ABOUT_DESC =
  "ExesTools is a set of free random-pick tools built by Arhum Waheed. How results are picked, why your lists stay in your browser, how ads keep it free, and how our guides are written.";

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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageLd()) }}
      />
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        About ExesTools
      </h1>
      <PageMeta updated="2026-10-13" />
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          ExesTools makes free online tools for everyday random picks: a{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            spinner wheel
          </Link>
          , a{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            random name picker
          </Link>
          , a{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>
          , a{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel
          </Link>
          , a{" "}
          <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
            yes or no wheel
          </Link>
          , a{" "}
          <Link href="/random-number-wheel" className="font-semibold text-accent hover:underline">
            random number wheel
          </Link>
          , a{" "}
          <Link href="/random-team-generator" className="font-semibold text-accent hover:underline">
            random team generator
          </Link>
          , a{" "}
          <Link
            href="/secret-santa-generator"
            className="font-semibold text-accent hover:underline"
          >
            Secret Santa generator
          </Link>
          , a{" "}
          <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
            raffle generator
          </Link>{" "}
          and a{" "}
          <Link
            href="/bingo-card-generator"
            className="font-semibold text-accent hover:underline"
          >
            bingo card generator
          </Link>
          . They run in your browser, with no account to create and nothing to install. Alongside
          the tools, the{" "}
          <Link href="/guides" className="font-semibold text-accent hover:underline">
            Guides
          </Link>{" "}
          section has longer articles on running giveaways, calling on students, making teams and
          more.
        </p>

        <p>ExesTools is not affiliated with the reverse-engineering forum that has a similar name.</p>

        <section>
          <h2 id="arhum" className="text-lg font-bold text-foreground scroll-mt-24">
            Who builds ExesTools
          </h2>
          <p className="mt-2">
            ExesTools is built and maintained by <strong className="text-foreground">Arhum Waheed</strong>
            , a software engineer based in Karachi, Pakistan.
          </p>
          <p className="mt-2">
            He started ExesTools so that anyone could spin a fair wheel with their own text and
            settings, save it in the browser, share a link, or go straight to a ready-made tool for
            names, classrooms, prizes, yes-or-no decisions and teams. Each tool is set up for one
            job, with its own presets and limits, rather than one general wheel stretched to cover
            everything.
          </p>
          <p className="mt-2">
            He writes the code and the guides on this site himself. The site is actively developed:
            changes are checked before release, and automated tests cover important wheel and
            random-pick behaviour, so what you see under the pointer stays honest.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              Email:{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-semibold text-accent hover:underline"
              >
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
            ) with rejection sampling, so each option still on the wheel has exactly the same
            chance. The result is chosen first, and the wheel animation then stops on it, so the
            slice under the pointer is always the pick. Nothing is decided by how long or how hard
            the wheel spins. Cosmetic details such as the exact spin duration and the spin sound use
            the browser&apos;s ordinary random function; they can&apos;t change the result.
          </p>
          <p className="mt-2">
            Each spin is independent, so streaks happen by chance. Switch on Remove winner if you
            want every name picked once before any repeats.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Team generator:</strong> shuffles the whole list
              with a Fisher–Yates shuffle using the same generator, then deals names into teams.
            </li>
            <li>
              <strong className="text-foreground">Secret Santa generator:</strong> first checks that
              a valid draw exists for your exclusions, then shuffles with the same generator until
              everyone has someone they&apos;re allowed to draw. For heavily restricted lists it
              falls back to a backtracking search. Nobody can draw themselves.
            </li>
            <li>
              <strong className="text-foreground">Raffle generator:</strong> draws one ticket at a
              time from the tickets still in the draw, so someone with three tickets is exactly
              three times as likely as someone with one to win that pick. By default, a winner&apos;s
              other tickets leave the draw.
            </li>
            <li>
              <strong className="text-foreground">Bingo card generator:</strong> builds cards from a
              short set code, so the same code always makes the same cards, and every card in a set
              is checked to be different. Its caller uses the secure generator separately and never
              repeats a call within a game.
            </li>
          </ul>
          <p className="mt-3">
            ExesTools is a free random picker, not a certified drawing service. For the longer
            version, with worked examples, read{" "}
            <Link
              href="/guides/how-random-is-a-spinner-wheel"
              className="font-semibold text-accent hover:underline"
            >
              How random is a spinner wheel?
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Your lists stay in your browser</h2>
          <p className="mt-2">
            Your lists are saved only in your browser, on your device, not on our servers. Share
            links carry the list inside the link itself, so anyone with the link can see it. We use
            Google Analytics to count visits and tool use, but we never send the names or options
            you type. See the{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">How ExesTools is paid for</h2>
          <p className="mt-2">
            ExesTools is free, and it is paid for by ads from Google AdSense on some pages. Visitors
            in the EEA, the UK and Switzerland are asked for consent before ads use cookies for
            personalisation.
          </p>
          <p className="mt-2">
            Ads don&apos;t decide what we build or write. Advertisers have no say in the tools, the
            guides or how results are picked, and the text you type into a tool is never used for
            advertising. ExesTools does not accept paid placements or sponsored guides.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Editorial policy</h2>
          <p className="mt-2">
            The guides on ExesTools are written to help you do something specific: run a draw people
            trust, call on students fairly, set up a gift exchange. This is how they&apos;re made.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Written by a named author.</strong> Every guide
              carries a byline and a published date. Today, all guides are written by Arhum Waheed.
            </li>
            <li>
              <strong className="text-foreground">Checked against the live tools.</strong> Any
              feature a guide mentions is checked against the live tool page on the publish date. If
              a tool changes, the guide is updated and its &quot;Updated&quot; date changes.
            </li>
            <li>
              <strong className="text-foreground">Maths shown, not asserted.</strong> Where a guide
              gives odds or percentages, it shows the working so you can check it.
            </li>
            <li>
              <strong className="text-foreground">Sources linked.</strong> Research and outside
              claims are named and cited. We don&apos;t invent statistics or testimonials.
            </li>
            <li>
              <strong className="text-foreground">Honest limits.</strong> Guides say what the tools
              don&apos;t do, and they don&apos;t present ExesTools as a certified or legally
              compliant drawing service.
            </li>
            <li>
              <strong className="text-foreground">Not professional advice.</strong> Guides about
              raffles, giveaways or classrooms are practical tips, not legal advice. Check the rules
              that apply where you are.
            </li>
            <li>
              <strong className="text-foreground">Corrections.</strong> Spotted a mistake? Email{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-semibold text-accent hover:underline"
              >
                {siteConfig.contactEmail}
              </a>{" "}
              with the page address. Corrections are made on the page and the Updated date changes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Changelog</h2>
          <p className="mt-2">Major changes to the site, newest first.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">2026-10-13:</strong> Guides section launched,
              starting with{" "}
              <em>How random is a spinner wheel?</em> and{" "}
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
            <li>
              Raffle generator launched, with multiple tickets per person, alternates and a draw
              record.
            </li>
            <li>
              Secret Santa generator launched, with exclusions and private reveal links.
            </li>
            <li>Random team generator launched.</li>
            <li>
              ExesTools launched with the spinner wheel and related random-pick tools.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">For teachers</h2>
          <p className="mt-2">
            Use the{" "}
            <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
              classroom spinner
            </Link>{" "}
            for fair turn-taking with no account. Your class list stays in this browser, Remove
            winner makes sure everyone gets a turn before anyone repeats, and you can share a link
            to the same wheel when your school&apos;s policy allows.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <p className="mt-2">
            Found a problem or have an idea? Email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
