import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const TITLE = "Random Name Picker – Free Name Wheel, Remove Winner & Share";
const META =
  "Paste up to 60 names and spin to pick one at random. Remove each winner, share the wheel with a link, and keep your list in your browser. Free, no account.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-name-picker"),
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
    q: "How do I pick a random name from a list?",
    a: "Paste or type your list in the Your choices box, one name per line, then press SPIN. You can paste a column straight from a spreadsheet or document. Empty lines are ignored, and up to 60 names fit on the wheel.",
  },
  {
    q: "Can the random name picker avoid repeats?",
    a: 'Yes. "Remove winner after spin (no repeats)" is on by default on this page, so each picked name comes off the wheel until you reset the list. Turn it off if you want every name to stay in for every spin.',
  },
  {
    q: "Can I pick more than one winner?",
    a: "Yes, one at a time. With remove-winner on, spin once for each winner you need. Each winner leaves the wheel, so nobody can be picked twice.",
  },
  {
    q: "What happens with duplicate names?",
    a: 'Duplicate lines are skipped, and capital letters don\'t count as a difference, so each name appears once. If two people share a name, add an initial, like "Sam K." and "Sam P."',
  },
  {
    q: "Does Shuffle change the odds?",
    a: "No. Shuffle only changes the order of names around the wheel. Every name has the same chance on each spin. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "I'm a teacher. Which picker should I use?",
    a: "Use the [Classroom spinner]. It opens with a sample class roster and classroom example wheels, and it has the same no-repeat option.",
  },
  {
    q: "Is this the same as the team generator?",
    a: "No. This page picks one name at a time on a wheel. The [random team generator] splits a whole list into several groups in one step. Use the wheel when you need a speaking order or a single winner; use teams when you need many groups at once.",
  },
  {
    q: "How many names can I add?",
    a: "Up to 60 names, one per line. Empty lines are ignored and duplicate lines are skipped. For bigger lists, or for people with more than one ticket, use the [raffle generator].",
  },
  {
    q: "Can I use the name picker for a giveaway?",
    a: "Yes, for a simple draw. Paste the entrant names, leave remove-winner on, and spin once per prize. For multiple entries per person or alternates, use the [raffle generator].",
  },
  {
    q: "How do I bring back the names that were already picked?",
    a: "Paste your full list back in. With remove winner on, the saved list only keeps the names still on the wheel, so it helps to press Copy before your first spin.",
  },
  {
    q: "Can I use the name picker on my phone?",
    a: "Yes. It runs in a modern mobile browser with no app to install. Your list is saved in that phone's browser.",
  },
  {
    q: "Is there a limit to how many times I can spin?",
    a: "No. You can spin as often as you like, and it's free with no account.",
  },
];

export default function RandomNamePickerPage() {
  return (
    <UseCaseToolPage
      toolId="random-name-picker"
      breadcrumbLabel="Random name picker"
      title="Random name picker wheel"
      intro="Paste your names, one per line, and press SPIN. The wheel picks one name at random, and every name has the same chance. Add up to 60 names. Switch on remove-winner to stop anyone being picked twice, then copy a share link so others can open the same wheel. It's free and needs no account, and your list stays in this browser."
      faqs={FAQS}
      schemaName="Random Name Picker Wheel"
      schemaDescription={META}
      pageUpdated="2026-10-19"
    >
      <GuideSection title="How to pick a name">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Replace the sample names with your own list, or try the Meeting order or Party /
            icebreakers example. Paste a column from a spreadsheet if that is easier.
          </li>
          <li>
            Press SPIN. The name under the pointer is the pick. With remove-winner on (the default
            here), that name leaves the wheel so it cannot come up again until you restore the list.
          </li>
          <li>
            Press Spin again for the next person, or Close when you are done. Sound and Reset
            rotation sit beside SPIN if you need them.
          </li>
          <li>
            Press Copy share link to send the same list to someone else, or Fresh wheel to bring
            back the starter sample. Shuffle only reorders the slices; it does not change the odds.
          </li>
        </ol>
      </GuideSection>

      <GuideSection title="Name picker vs classroom spinner">
        <p>
          Both tools spin a wheel over a list and can remove winners after each pick. The difference
          is the setup, not the math. This random name picker opens as a general list tool: sample
          names, meeting and party examples, and no classroom framing. The{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>{" "}
          opens with a sample roster, teacher example wheels (jobs, brain breaks, reading groups),
          and copy written for cold calling and projectors.
        </p>
        <p className="mt-3">
          Use this page for standups, workshops, raffles by name, icebreakers, and &quot;who goes
          first&quot; at a party. Use the classroom page when the list is a class and you want the
          teacher-oriented examples and wording. Teachers who only need a plain roster can still use
          either tool—the remove-winner behavior is the same idea on both.
        </p>
      </GuideSection>

      <GuideSection title="Ways to use a random name picker">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Parties and icebreakers.</span> Load
            Party / icebreakers or type guest names. Spin for who starts a game, who picks the next
            song, or who tells a story. Turn remove-winner off if repeats are fine.
          </li>
          <li>
            <span className="font-semibold text-foreground">White elephant turn order.</span> Paste
            every player&apos;s name, leave remove-winner on, and spin until one name is left. The
            order names come off the wheel is the order people choose or steal gifts, and the last
            name goes last. Running a gift exchange where everyone buys for one person instead? Use
            the{" "}
            <Link
              href="/secret-santa-generator"
              className="font-semibold text-accent hover:underline"
            >
              Secret Santa generator
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Simple raffles and door prizes.</span>{" "}
            Paste entrant names, show the wheel where people can see it, and spin once per prize
            with remove-winner on. Want to spin for rewards instead of names? Use the{" "}
            <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
              prize wheel spinner
            </Link>
            . For prize lists or stream giveaways with themed slices, that same tool is built for
            that. For ticket raffles (numbered tickets, people with several tickets, or
            many winners at once), use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Book clubs and supper clubs.</span> Who
            hosts next month, or who picks the next book.
          </li>
          <li>
            <span className="font-semibold text-foreground">Sign-up sheets.</span> Eleven people
            want the one spare concert ticket: paste their names and spin once.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="Picking a giveaway winner">
        <p>
          Paste the entrant names, spin once per prize with remove winner on, and record the screen.
          If people have several entries or you need alternates, the{" "}
          <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
            raffle generator
          </Link>{" "}
          is the better fit. The{" "}
          <Link
            href="/guides/how-to-run-a-fair-online-giveaway"
            className="font-semibold text-accent hover:underline"
          >
            giveaway guide
          </Link>{" "}
          covers the rules to publish first.
        </p>
      </GuideSection>

      <GuideSection title="Using the name picker for stand-ups and meeting order">
        <p>
          Paste the team once and it&apos;s there tomorrow. Spin the whole order before anyone speaks
          and paste it in the chat.
        </p>
      </GuideSection>

      <GuideSection title="How the name picker decides">
        <p>
          Each line in your list is one name and one equal slice. When you press SPIN, the page picks one
          of the names still on the wheel at random, and then the wheel turns to stop on it. On this page{" "}
          <span className="font-semibold text-foreground">remove winner</span>{" "}
          is on by default, so the picked name leaves the wheel straight away. The next spin is only
          between the people who haven&apos;t been picked yet.
        </p>
        <p>
          That makes it a fair way to build an order, not just choose one person. Spin until one name is
          left, and the order names came off is a complete random order, with the last name going last.
          The wheel holds up to 60 names.
        </p>
        <p>
          The pick comes from your browser&apos;s secure random number generator, and Shuffle only
          moves names around the rim. The wheel needs two names to spin, so when one is left, that
          person simply goes last. For icebreakers where the same person being picked twice is part
          of the joke, switch remove winner off.
        </p>
      </GuideSection>
      <GuideSection title="Worked example: three presenters from fourteen">
        <p>
          A workshop has 14 attendees and time for three short presentations. Paste the 14 names and leave
          remove winner on.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            First spin: each person has a 1 in 14 chance.
          </li>
          <li>
            Second spin: one name is gone, so it&apos;s 1 in 13 for the rest.
          </li>
          <li>
            Third spin: 1 in 12.
          </li>
        </ul>
        <p>
          Across the three spins, every attendee has the same overall chance of presenting: 3 in 14, or
          about 21%. Nobody&apos;s position in the list makes any difference.
        </p>
        <p>
          Before the first spin, press{" "}
          <span className="font-semibold text-foreground">Copy</span>{" "}
          so the full list is on your clipboard. When the session ends, paste it back and the wheel is
          ready for the next group.
        </p>
      </GuideSection>
      <GuideSection title="Tips">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Read the name out, then pause.</span>{" "}
            People are slower to react than you&apos;d think.
          </li>
          <li>
            <span className="font-semibold text-foreground">Add initials for shared names.</span>{" "}
            Duplicate lines are skipped, so two &quot;Sam&quot; lines become one slice.
          </li>
          <li>
            <span className="font-semibold text-foreground">Show the list first</span>{" "}
            when the result matters, so everyone can check they&apos;re on it.
          </li>
          <li>
            <span className="font-semibold text-foreground">Send a co-host the same list</span>{" "}
            with Copy share link. Anyone with the link can see the names, so keep sensitive lists off it.
          </li>
          <li>
            <span className="font-semibold text-foreground">Turn remove winner off</span>{" "}
            for games where the same person being picked twice is part of the fun.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Privacy">
        <p>
          Your list is saved in this browser on this device, not on our servers. A share link
          contains the names themselves, so don&apos;t share lists that include sensitive
          information. Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
