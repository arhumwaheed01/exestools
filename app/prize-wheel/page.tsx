import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const TITLE = "Prize Wheel Spinner for Giveaways – Free, No Signup";
const META =
  "Free prize wheel spinner for giveaways, events and classrooms. Add prizes or entrant names, spin where everyone can see, and share your wheel. No signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/prize-wheel") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/prize-wheel"),
    imagePath: siteConfig.ogImagePath,
    imageAlt: "ExesTools Spinner Wheel",
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
    q: "How do I use a prize wheel for a giveaway?",
    a: "Paste your prizes or entrant names, one per line, publish the rules and the full list, then press SPIN where everyone can see it. Turn on Remove winner after spin if you need more than one winner. For ticket counts, alternates or a draw record, use the [raffle generator].",
  },
  {
    q: "What are the odds on a prize wheel?",
    a: "Every slice is the same size, so each prize has a 1 in N chance, where N is the number of slices. With 8 prizes, each has a 1 in 8 (12.5%) chance.",
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
    q: "Can I use the prize wheel on a Twitch or YouTube stream?",
    a: "Yes. Open the page in your browser, show that window on your stream, read out the list and spin live. Copy the share link afterwards so viewers can see the exact list.",
  },
  {
    q: "Can others see my wheel?",
    a: "Only if you send them the share link. The link carries your list, so anyone with it can see the entries. Otherwise your list is saved in your own browser.",
  },
  {
    q: 'What happens if the wheel lands on "Bonus spin"?',
    a: "Whatever your rules say. Decide before the first spin, for example spin once more for the same person, and stick to it every time.",
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
    q: "Can I use this for an official lottery draw?",
    a: "No. It's a free random picker. If your platform or local law requires an official or supervised draw, use one. See our [Terms of Service].",
  },
  {
    q: "Can I change the prizes between spins?",
    a: "Yes. Edit the list at any time, for example to delete a prize that has run out. The next spin uses the updated list.",
  },
  {
    q: "How many slices should a prize wheel have?",
    a: "Eight to twelve is easy to read on a laptop or projector. The wheel holds up to 60 if you need more.",
  },
  {
    q: "Can viewers spin my prize wheel themselves?",
    a: "They can open the same list with your share link, but their spins happen on their own device and don't affect yours. For an official result, spin on your screen.",
  },
];

export default function PrizeWheelPage() {
  return (
    <UseCaseToolPage
      toolId="prize-wheel"
      breadcrumbLabel="Prize wheel"
      title="Prize wheel for giveaways"
      intro="Add your prizes, one per line, and spin the wheel where everyone can see it. Start from the Prize rewards list, or switch to Stream giveaway, Classroom rewards, or Entrant names to draw a winner by name. Free, no signup."
      faqs={FAQS}
      schemaName="Prize Wheel Spinner"
      schemaDescription={META}
      schemaAlternateName={["Prize wheel for giveaways", "Event prize wheel"]}
      schemaFeatureList={[
        "Up to 60 prizes or names",
        "Remove winner after spin",
        "Copy share link",
        "Sound on/off",
        "No signup",
      ]}
      pageUpdated="2026-10-19"
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
            tickets, or{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              multiple prizes and alternates
            </Link>
            , use the raffle generator.
          </li>
          <li>Press Copy share link so others can open the same wheel.</li>
        </ol>
      </GuideSection>
      <GuideSection title="What to put on a prize wheel">
        <p>
          Short, specific prizes work best, because every slice has to fit a few words and everyone
          should know what they&apos;d get. Mix one or two big prizes with several small ones, and
          add a &quot;Bonus spin&quot; or &quot;No prize&quot; slice only if you&apos;ve said
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
      <GuideSection title="Prize spins at events, booths and shops">
        <p>
          Use the prize wheel as a prize-spin game at a trade show booth, school fair, fundraiser,
          office party or shop counter. Open it on a laptop or a screen the visitor can see, and let
          them press SPIN.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Mix big and small prizes: &quot;Free coffee&quot;, &quot;10% off&quot;,
            &quot;Sticker&quot;, &quot;Mystery box&quot;.
          </li>
          <li>
            Add &quot;Bonus spin&quot; or &quot;No prize&quot; slices to make the wheel last longer.
            Each slice has an equal chance, so 2 &quot;No prize&quot; slices on a 10-slice wheel give
            a 2 in 10 chance of no prize.
          </li>
          <li>
            Each prize has a 1 in N chance, where N is the number of slices. On a 10-slice wheel with
            one $25 gift card, expect the card about once every 10 spins. If that&apos;s too often,
            stock a fixed number and take the slice off when they&apos;re gone.
          </li>
          <li>The wheel picks the prize. You hand out the real rewards.</li>
        </ul>
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Who wins vs. what they win
        </h3>
        <p>
          Two spins work well together. First, pick the person with the{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            random name picker
          </Link>{" "}
          (or put entrant names on this wheel). Then spin a prize list to see what they win.
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
      <GuideSection title="How to run a fair giveaway on stream or in class">
        <p>
          On a stream, put the wheel on screen before you start, read out the full list of prizes or
          entrant names, and say how many winners you&apos;ll draw. Spin live so viewers see the
          result as it happens, and keep a recording or a share link of the exact list you used in
          case anyone asks later.
        </p>
        <p>
          For a step-by-step checklist on rules, entry lists and no-shows, see{" "}
          <Link
            href="/guides/how-to-run-a-fair-online-giveaway"
            className="font-semibold text-accent hover:underline"
          >
            how to run a fair online giveaway
          </Link>
          .
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
          &quot;Bonus spin&quot; or &quot;No prize&quot;, and stick to it. Changing the rules after
          a result is the quickest way to lose trust.
        </p>
        <p>
          At an event or booth, put the wheel on a laptop or tablet facing visitors, and keep the
          prize list printed or written next to it so people know what&apos;s on the wheel before
          they spin. Restock or edit slices between spins if a prize runs out, and say so out loud.
          Giveaway rules differ by platform and by place, so check the ones that apply to you before
          you announce prizes.
        </p>
      </GuideSection>
      <GuideSection title="How a prize spin is decided">
        <p>
          Every prize or name on the list is one equal slice, up to 60. When you press SPIN, one slice is
          chosen at random from everything currently on the wheel, and the wheel then turns to land on it.
          A spin that looks close to the big prize wasn&apos;t &quot;nearly&quot; anything; the result was
          set before the wheel moved.
        </p>
        <p>
          Because every slice is the same size, the odds come straight from the count. Ten slices, one
          grand prize: a 1 in 10 chance on each spin. If you want the grand prize to be rarer, add more
          small prizes, not thinner slices.
        </p>
        <p>
          Turn on{" "}
          <span className="font-semibold text-foreground">Remove winner after spin</span>{" "}
          when a prize should only be won once. The won slice leaves the wheel, and the next spin is
          between what&apos;s left.
        </p>
        <p>
          Make sure everyone can see the wheel and the full list, and disclose your contest rules
          before you spin. See our{" "}
          <Link href="/terms" className="font-semibold text-accent hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </GuideSection>
      <GuideSection title="Worked example: two wheels, three prizes, 40 entrants">
        <p>
          You have 40 entrants and three prizes: a gift card, a book and a mug. Up to 60 names fit on one
          wheel, so:
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Tap{" "}
            <span className="font-semibold text-foreground">Entrant names</span>
            , paste the 40 names, and turn on{" "}
            <span className="font-semibold text-foreground">Remove winner after spin</span>
            .
          </li>
          <li>
            Spin three times. Each winner leaves, so nobody wins twice. Write the three names down in order.
          </li>
          <li>
            Clear the list, type the three prizes, and keep remove winner on.
          </li>
          <li>
            Spin once for each winner, in the order they were drawn. Each prize leaves after it&apos;s won.
          </li>
        </ol>
        <p>
          Every entrant had the same 3 in 40 chance of winning something, and each winner had an equal
          shot at each prize still left. Press{" "}
          <span className="font-semibold text-foreground">Copy share link</span>{" "}
          on the entrant wheel before you start if you want to post the exact list you used.
        </p>
      </GuideSection>
      <GuideSection title="Tips">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Say the order before the first spin.</span>{" "}
            &quot;Smallest prize first, gift card last&quot; or &quot;first name drawn picks first.&quot;
            Write each winner down as they come up.
          </li>
          <li>
            <span className="font-semibold text-foreground">Show the full list before the first spin.</span>{" "}
            People trust what they&apos;ve seen.
          </li>
          <li>
            <span className="font-semibold text-foreground">Edit between spins</span>{" "}
            if a prize runs out, and say so out loud.
          </li>
          <li>
            <span className="font-semibold text-foreground">Keep prize labels short</span>{" "}
            so they&apos;re readable from across a room.
          </li>
          <li>
            <span className="font-semibold text-foreground">Write results on paper as you go.</span>{" "}
            The wheel shows the current spin, not a history.
          </li>
        </ul>
      </GuideSection>
    </UseCaseToolPage>
  );
}
