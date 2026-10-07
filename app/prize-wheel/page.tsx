import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Prize Wheel Spinner for Giveaways (Free Online) | ExesTools";
const META =
  "Free prize wheel spinner for giveaways, classrooms and streams. Add prizes or entrant names, spin where everyone can see, and share your wheel. No signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/prize-wheel") },
  openGraph: {
    title: TITLE,
    description: META,
    url: absoluteUrl("/prize-wheel"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
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
    q: "What should I put on a prize wheel?",
    a: "Short, clear prizes that suit your audience, like gift cards or discount codes for an online giveaway, shout-outs on a stream, or homework passes in class. See the ideas above, or load one of the example wheels and edit it.",
  },
  {
    q: "How many prizes or names can I add?",
    a: "Up to 60, one per line. Empty lines are ignored and duplicate lines are skipped. For bigger lists, use the [raffle generator].",
  },
  {
    q: "Can I make some prizes more likely to win?",
    a: "No. Every slice has the same chance, and if you add the same prize twice the duplicate is skipped. If you want a rare grand prize, add fewer big prizes and more small ones.",
  },
  {
    q: "Can I make a prize wheel with names?",
    a: "Yes. Tap Entrant names, paste one name per line, and spin. If two people share a name, add an initial so both stay on the wheel.",
  },
  {
    q: "How do I pick more than one winner?",
    a: 'Turn on "Remove winner after spin". Each winner leaves the wheel, so you can keep spinning until you have enough winners without repeats.',
  },
  {
    q: "Can I use the prize wheel on a Twitch or YouTube stream?",
    a: "Yes. Open the page in your browser, show that window on your stream, read out the list and spin live. Copy the share link afterwards so viewers can see the exact list.",
  },
  {
    q: "Can others see my wheel?",
    a: "Only if you send them the share link. The link carries your list, so anyone with it can see the entries. Otherwise your list is saved in your own browser.",
  },
  {
    q: 'What happens if the wheel lands on "Try again"?',
    a: "Whatever your rules say. Decide before the first spin, for example spin once more for the same person, and stick to it every time.",
  },
  {
    q: "Is this an online prize wheel generator?",
    a: "Yes. It's a free online prize wheel that runs in your browser. Type your prizes or entrant names, one per line, and spin. No signup and no download.",
  },
  {
    q: "Is this a physical prize wheel for sale?",
    a: "No. ExesTools doesn't sell or rent physical wheels. This is a free on-screen spinner you can show at an event, in class, or on a stream.",
  },
  {
    q: "Can I spin for prizes or for entrant names?",
    a: 'Both. Use the Prize rewards or Stream giveaway example to spin for a prize, or Entrant names to draw a winner from a list of people. To draw several winners, turn on "Remove winner after spin" so nobody wins twice. If some entrants have more than one ticket, use the [raffle generator with multiple entries].',
  },
  {
    q: "Can I use it for an Instagram, TikTok, or Facebook giveaway?",
    a: "Yes, as long as you follow the platform's rules. Paste the entrant names you collected, for example from comments, then spin on screen or record the spin so entrants can see the result. ExesTools doesn't connect to social accounts or import comments.",
  },
  {
    q: "How do I keep a giveaway fair?",
    a: 'Publish your rules before you spin, let everyone see the full list of prizes or names, and explain any "Try again" slices up front. Every slice has the same chance on each spin. Learn more: [How ExesTools picks a result].',
  },
  {
    q: "Is this a certified lottery or raffle draw?",
    a: "No. It's a free random picker, not a certified drawing service. If the law or your platform requires a certified draw, use one. See our [Terms of Service].",
  },
];

export default async function PrizeWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="prize-wheel"
      breadcrumbLabel="Prize wheel"
      title="Prize wheel for giveaways"
      intro="Add your prizes, one per line, and spin the wheel where everyone can see it. Start from the Prize rewards list, or switch to Stream giveaway, Classroom rewards, or Entrant names to draw a winner by name. Free, no signup."
      faqs={FAQS}
      schemaName="Online Prize Wheel"
      schemaDescription={META}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to run a giveaway spin">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Pick an Example wheel, or type your own prizes or entrant names, one per line.
          </li>
          <li>Share your rules and the full list with entrants before you spin.</li>
          <li>Press SPIN where everyone can see it, or record your screen.</li>
          <li>
            Drawing more than one winner? Turn on &quot;Remove winner after spin&quot; so each winner
            leaves the wheel. For a ticket raffle with hundreds of numbers, people with several
            tickets, or a written record, use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
          <li>Press Copy share link so others can open the same wheel.</li>
        </ol>
      </GuideSection>
      <GuideSection title="What to put on a prize wheel">
        <p>
          Short, specific prizes work best, because every slice has to fit a few words and everyone
          should know what they&apos;d get. Mix one or two big prizes with several small ones, and
          add a &quot;Try again&quot; or &quot;Extra spin&quot; slice only if you&apos;ve said
          beforehand what it means.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Online giveaways:</span> gift card, free
            product, discount code, free month of your service, signed print, merch bundle.
          </li>
          <li>
            <span className="font-semibold text-foreground">Streams:</span> shout-out, pick the next
            game, viewer joins the next match, custom emote vote, song request, mod for a day.
          </li>
          <li>
            <span className="font-semibold text-foreground">Classrooms:</span> homework pass, pick the
            class song, sit anywhere for a day, extra reading time, line leader, sticker or fidget
            toy, first to choose at recess.
          </li>
          <li>
            <span className="font-semibold text-foreground">Events and booths:</span> branded swag,
            free coffee, raffle ticket, discount voucher, mystery box, &quot;spin again&quot;.
          </li>
        </ul>
        <p>
          Every slice has the same chance, so a big prize is just as likely as a small one. Plan your
          budget around that. To start fast, tap{" "}
          <span className="font-semibold text-foreground">Prize rewards</span>,{" "}
          <span className="font-semibold text-foreground">Stream giveaway</span> or{" "}
          <span className="font-semibold text-foreground">Classroom rewards</span> under Example
          wheels and edit the list.
        </p>
      </GuideSection>
      <GuideSection title="Spin for a prize or pick a winner by name">
        <p>
          A prize wheel can be used two ways.{" "}
          <span className="font-semibold text-foreground">Spin for a prize:</span> someone has already
          won a turn, and the wheel decides what they get. List your prizes, one per line.{" "}
          <span className="font-semibold text-foreground">Pick a winner:</span> you have one prize and
          many entrants, and the wheel decides who gets it. Tap{" "}
          <span className="font-semibold text-foreground">Entrant names</span> and paste the people who
          entered, one per line, up to 60.
        </p>
        <p>
          Before you paste, clean up the list. Blank lines are ignored, and duplicate lines are
          skipped (capital letters don&apos;t count as different), so if two people share a name, add
          an initial or their handle. That also means you can&apos;t give someone a second chance by
          pasting their name twice. If people have several entries, or you have more than 60
          entrants, use the{" "}
          <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
            raffle generator with multiple entries
          </Link>{" "}
          instead. Press{" "}
          <span className="font-semibold text-foreground">Copy share link</span> when you&apos;re done
          so entrants can open the exact list you spun.
        </p>
      </GuideSection>
      <GuideSection title="Drawing several winners">
        <p>
          To give away more than one prize, turn on{" "}
          <span className="font-semibold text-foreground">Remove winner after spin (no repeats)</span>
          . Each name leaves the wheel after it wins, so nobody wins twice. Decide the order up
          front: many hosts draw the smallest prize first and the main prize last, or say
          &quot;first name drawn gets first pick&quot;.
        </p>
        <p>
          Announce how many winners you&apos;ll draw before the first spin, and write each winner
          down as they come up. If a winner doesn&apos;t reply or turns out not to qualify, say in
          your rules how long they have to claim and whether you&apos;ll spin again for a
          replacement. Before the next giveaway, paste the full list back in so the removed names
          return.
        </p>
        <p>
          Hosting a gift exchange instead of a giveaway? The{" "}
          <Link
            href="/secret-santa-generator"
            className="font-semibold text-accent hover:underline"
          >
            Secret Santa generator
          </Link>{" "}
          matches people so everyone gives and receives one gift.
        </p>
      </GuideSection>
      <GuideSection title="How to run a fair giveaway on stream or in class">
        <p>
          On a stream, put the wheel on screen before you start, read out the full list of prizes or
          entrant names, and say how many winners you&apos;ll draw. Spin live so viewers see the
          result as it happens, and keep a recording or a share link of the exact list you used in
          case anyone asks later.
        </p>
        <p>
          In class, keep the rewards small, like extra reading time or picking the class song, and
          let students see the list before you spin. Turn on &quot;Remove winner after spin&quot; if
          each student should win only once, and paste the full list back in for the next round. If
          you&apos;re picking students rather than prizes, the{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>{" "}
          is set up for that.
        </p>
        <p>
          Either way, decide before the first spin what happens when the wheel lands on a slice like
          &quot;Try again&quot; or &quot;Extra spin&quot;, and stick to it. Changing the rules after
          a result is the quickest way to lose trust.
        </p>
        <p>
          At an event or booth, put the wheel on a laptop or tablet facing visitors, and keep the
          prize list printed or written next to it so people know what&apos;s on the wheel before
          they spin. Restock or edit slices between spins if a prize runs out, and say so out loud.
          Platform rules and local laws for giveaways differ, so check the ones that apply to you.
          This wheel picks a result. It doesn&apos;t make your giveaway compliant with any rule.
        </p>
      </GuideSection>
      <GuideSection title="Fairness">
        <p>
          Every slice has the same chance on each spin, and the result is always the slice under the
          pointer. Make sure everyone can see the wheel and the full list, and disclose your contest
          rules before you spin. See our{" "}
          <Link href="/terms" className="font-semibold text-accent hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
