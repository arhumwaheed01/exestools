import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";
import PageMeta from "@/components/PageMeta";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { RelatedTools } from "@/components/RelatedTools";
import { QueryHydratedSpinner } from "@/components/QueryHydratedMounts";
import { preprocessGuideBody } from "@/lib/guideBody";
import { getPublishedGuides } from "@/lib/guides";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { faqPageLd, siteGraphLd, toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const HOME_PAGE_BLOCK_PATH = path.join(
  process.cwd(),
  "public/content/site-pages/homepage-block.md",
);

function loadHomepageBlockMarkdown(): string {
  const raw = fs.readFileSync(HOME_PAGE_BLOCK_PATH, "utf8");
  const { content } = matter(raw);
  const body = preprocessGuideBody(content);
  const latestIdx = body.search(/^### Latest guides\s*$/m);
  return latestIdx === -1 ? body : body.slice(0, latestIdx).trim();
}

const HOME_TITLE = "ExesTools – Free Spinner Wheel, Name Picker & Party Tools";
const HOME_META =
  "Free spinner wheel, name picker, classroom spinner, prize wheel, team generator, Secret Santa, raffle and bingo. No account; lists stay in your browser.";

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
    openGraph: toolOpenGraph({
      title: HOME_TITLE,
      description: HOME_META,
      url: absoluteUrl("/"),
      imagePath: siteConfig.ogImagePath,
      imageAlt: "ExesTools Spinner Wheel",
    }),
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
  {
    q: "Can I remove the winner after each spin?",
    a: 'Yes. Switch on "Remove winner after spin (no repeats)" before you spin, or press Remove & continue when the result appears. The picked option leaves the wheel, so it can\'t come up again until you add it back.',
  },
  {
    q: "Can I put an option on the wheel twice to make it more likely?",
    a: "No. Duplicate lines are skipped, so each option appears once and every slice has the same chance. If you want an option to come up more often, add a different label for it, such as \"Pizza\" and \"Pizza night.\"",
  },
  {
    q: "Does spinning harder or longer change the result?",
    a: "No. The result is picked at random before the animation starts, and the wheel then stops on it. Spin length and speed are only for show.",
  },
  {
    q: "What happens to my wheel if I clear my browser data?",
    a: "It's deleted, because the list is stored in your browser on that device. If you want to keep a wheel, press Copy share link first and save the link somewhere safe.",
  },
  {
    q: "If I send a share link, will we see the same result?",
    a: "You'll see the same list of options, but each spin on each device is separate. If a group needs one shared result, spin on one screen everyone can see.",
  },
  {
    q: "How do I bring back an option I removed?",
    a: "Type it back in as a new line. Fresh wheel brings back the starter list, and pasting your original list restores everything at once.",
  },
  {
    q: "Does the spinner wheel cost anything?",
    a: "No. It's free, there's no account or signup, and it runs in your browser.",
  },
] as const;

export default function HomePage() {
  const homepageBlock = loadHomepageBlockMarkdown();
  const latestGuides = getPublishedGuides();

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
        <PageMeta updated="2026-10-19" />
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted sm:line-clamp-none sm:text-base sm:leading-relaxed">
          Add one option per line, hit SPIN, and land on a fair result. It works as a multi-option
          decision wheel when you have several choices, and there&apos;s no account to create. For
          names, classrooms, prizes, yes-or-no questions and teams, try the related tools below.
        </p>
      </header>

      <QueryHydratedSpinner toolId="home" />

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
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Because every slice is the same size, the same tool works as a wheel of names for turn
            order, a decision wheel when you have several choices, or a quick random picker when you
            want the spin to settle it instead of debating.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            You may know it as a wheel of names, a decision wheel or a random picker wheel.
            They&apos;re all the same idea. ExesTools has versions set up for{" "}
            <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
              names
            </Link>
            ,{" "}
            <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
              classrooms
            </Link>
            ,{" "}
            <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
              prizes
            </Link>
            ,{" "}
            <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
              yes or no
            </Link>{" "}
            and{" "}
            <Link href="/random-number-wheel" className="font-semibold text-accent hover:underline">
              numbers
            </Link>
            .
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
              Quick number picks. Tap Numbers 1–10 for a fast pick. For bigger ranges like 1–100, or
              to draw numbers without repeats, use the{" "}
              <Link href="/random-number-wheel" className="font-semibold text-accent hover:underline">
                random number wheel
              </Link>
              .
            </li>
            <li>
              Turn order. Add everyone&apos;s name and switch on &quot;Remove winner after
              spin&quot;. The order in which names come off the wheel is your turn order.
            </li>
            <li>
              Small jobs. List the chores or tasks and spin to see which one gets done first, or who
              picks first.
            </li>
            <li>
              Planning a gift exchange? Use the{" "}
              <Link
                href="/secret-santa-generator"
                className="font-semibold text-accent hover:underline"
              >
                Secret Santa generator with exclusions
              </Link>
              .
            </li>
            <li>
              Need groups instead of one pick?{" "}
              <Link
                href="/random-team-generator"
                className="font-semibold text-accent hover:underline"
              >
                Split a list into random groups or pairs
              </Link>
              .
            </li>
            <li>
              Running a giveaway with prizes on screen? Use the{" "}
              <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
                prize wheel for giveaways
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What happens when you press SPIN
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            The wheel doesn&apos;t decide anything by how it spins. When you press SPIN, the page first
            picks one option at random from everything currently on the wheel, with every option getting the
            same chance. Then it animates the wheel so it stops on that option. That&apos;s why a long spin,
            a short spin or a second press of the button can&apos;t nudge the result.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Each line in your list becomes one equal slice. Blank lines are ignored, and a line that repeats
            an earlier one is skipped, with capital letters not counting as a difference. So
            &quot;Pizza&quot; and &quot;pizza&quot; make one slice, not two. You can have up to 60 slices,
            and you need at least two for the wheel to spin.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            What you type is saved in your browser, so the same wheel is waiting next time you open the page
            on that device. Nothing needs an account.
          </p>
        </section>
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Small jobs this wheel is good at
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              <span className="font-semibold text-foreground">The weekly dinner rut.</span>{" "}
              Put eight meals you actually know how to cook on the wheel. Spin on Sunday for Monday to
              Thursday, with remove-winner on so nothing repeats in a week.
            </li>
            <li>
              <span className="font-semibold text-foreground">The reading pile.</span>{" "}
              List the books stacked by your bed and let the wheel choose the next one. It ends the
              &quot;I&apos;ll start something tomorrow&quot; loop.
            </li>
            <li>
              <span className="font-semibold text-foreground">Workout variety.</span>{" "}
              Rowing, a run, a bike ride, yoga, a rest day. Spin each morning.
            </li>
            <li>
              <span className="font-semibold text-foreground">Game night.</span>{" "}
              Put the group&apos;s games on the wheel so the same person doesn&apos;t always choose.
            </li>
            <li>
              <span className="font-semibold text-foreground">Writing prompts.</span>{" "}
              A list of opening lines or settings, one per slice, for a class or for yourself.
            </li>
          </ul>
        </section>
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Worked example: planning a weekend
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            You have seven ideas for Saturday: farmers market, hike, museum, beach, bike ride, movie, a new
            café. Type them in, one per line, and switch on{" "}
            <span className="font-semibold text-foreground">Remove winner after spin</span>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            The first spin gives each idea a 1 in 7 chance. Say it lands on &quot;hike.&quot; That slice
            leaves, so Sunday&apos;s spin is from the six that remain, each with a 1 in 6 chance. If it
            lands on something you really don&apos;t want to do, that&apos;s useful information too. Delete
            it and spin again; it&apos;s your weekend.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Want a partner to see the same options? Press{" "}
            <span className="font-semibold text-foreground">Copy share link</span>{" "}
            and send it. The link carries the list, so they&apos;ll open the exact same wheel.
          </p>
        </section>
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Tips for a better wheel
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              <span className="font-semibold text-foreground">Keep labels to a few words.</span>{" "}
              Long text gets cramped on narrow slices.
            </li>
            <li>
              <span className="font-semibold text-foreground">Decide what a result means before you spin.</span>{" "}
              If you&apos;re going to ignore an answer, take it off the wheel first.
            </li>
            <li>
              <span className="font-semibold text-foreground">Use Shuffle for looks, not luck.</span>{" "}
              It changes the order around the rim, not the odds.
            </li>
            <li>
              <span className="font-semibold text-foreground">Save useful wheels as links.</span>{" "}
              The page keeps one list in your browser. For others, copy a share link and bookmark it.
            </li>
          </ul>
        </section>

        <section id="about-exestools" className="max-w-3xl">
          <GuideMarkdown content={homepageBlock} />
          {latestGuides.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-bold tracking-tight text-foreground">Latest guides</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
                {latestGuides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="font-semibold text-accent hover:underline"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section id="which-tool" className="max-w-3xl scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Which ExesTools tool should I use?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            All ten tools pick at random with the same secure generator, but each one is set up for a
            different job. Pick the one that matches what you&apos;re doing:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[18rem] border-collapse text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold text-foreground">You want to…</th>
                  <th className="py-2 pr-3 font-semibold text-foreground">Use</th>
                  <th className="py-2 font-semibold text-foreground">Why this one</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">
                    Choose between a few options, like where to eat or what to do
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/" className="text-accent hover:underline">
                      Spinner wheel
                    </Link>{" "}
                    (this page)
                  </td>
                  <td className="py-2.5">Up to 60 options, example wheels, share link</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">
                    Pick a person from a list for meetings, parties or turn order
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/random-name-picker" className="text-accent hover:underline">
                      Random name picker
                    </Link>
                  </td>
                  <td className="py-2.5">Name-focused presets and a &quot;no repeats&quot; round</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Call on students fairly in class</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/classroom-spinner" className="text-accent hover:underline">
                      Classroom spinner
                    </Link>
                  </td>
                  <td className="py-2.5">
                    Remove-winner is on by default so everyone gets a turn; roster stays in your
                    browser
                  </td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Show a giveaway or prize spin on screen</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/prize-wheel" className="text-accent hover:underline">
                      Prize wheel
                    </Link>
                  </td>
                  <td className="py-2.5">Prize and stream presets, tips for running a fair giveaway</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Get a quick yes, no or maybe</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/yes-no-wheel" className="text-accent hover:underline">
                      Yes or no wheel
                    </Link>
                  </td>
                  <td className="py-2.5">Two- or three-way wheel, running tally, coin-toss mode</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Pick a number from any range, or call bingo</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/random-number-wheel" className="text-accent hover:underline">
                      Random number wheel
                    </Link>
                  </td>
                  <td className="py-2.5">Ranges up to 1,000 numbers, no-repeat draws, bingo letters</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Split a list into teams, groups or pairs</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/random-team-generator" className="text-accent hover:underline">
                      Random team generator
                    </Link>
                  </td>
                  <td className="py-2.5">Set team count or team size, then print or share</td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Run a gift exchange</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/secret-santa-generator" className="text-accent hover:underline">
                      Secret Santa generator
                    </Link>
                  </td>
                  <td className="py-2.5">
                    Exclusions for couples and private reveal links, no emails needed
                  </td>
                </tr>
                <tr className="border-b border-border/60 align-top">
                  <td className="py-2.5 pr-3">Draw raffle winners from tickets</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/raffle-generator" className="text-accent hover:underline">
                      Raffle generator
                    </Link>
                  </td>
                  <td className="py-2.5">
                    Numbered tickets, several winners, alternates and a draw record to copy or print
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="py-2.5 pr-3">Make printable bingo cards or play on phones</td>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">
                    <Link href="/bingo-card-generator" className="text-accent hover:underline">
                      Bingo card generator
                    </Link>
                  </td>
                  <td className="py-2.5">
                    Your own words or 1–75 numbers, up to 100 different cards, print or share a set
                    link
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Not sure? Start with the spinner wheel. You can paste the same list into any other tool
            later.
          </p>
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
