import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Random Name Picker Wheel (Free Online)";
const META =
  "Paste names and spin a free random name picker wheel. Fair picks for meetings, parties, and lists. Remove-winner option. No signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/random-name-picker"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
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
    q: "Can I use it for a raffle or giveaway?",
    a: "Yes for a simple name draw: paste entrant names, leave remove-winner on, and spin once per prize so each winner leaves the wheel. For prize-themed slices or stream giveaways, use the [prize wheel]. For numbered tickets, multiple tickets per person, or several winners in one draw, use the [raffle generator with multiple entries].",
  },
];

export default async function RandomNamePickerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="random-name-picker"
      breadcrumbLabel="Random name picker"
      title="Random name picker wheel"
      intro="Paste a list of names, one per line, and hit SPIN to pick one at random. Remove winner is on by default, so nobody is picked twice until you reset the list. Use it for meetings, parties, and deciding who goes first. Free, no signup."
      faqs={FAQS}
      schemaName="Random Name Picker Wheel"
      schemaDescription={META}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
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
            <span className="font-semibold text-foreground">Meetings and standups.</span> Paste
            who is in the room, leave remove-winner on, and spin for speaking order. Nobody debates
            who should talk next, and everyone gets a turn before repeats.
          </li>
          <li>
            <span className="font-semibold text-foreground">Cold call without favorites.</span>{" "}
            In a training session or mixed group, spin to choose who answers. It is the same fair
            pick a teacher gets on the classroom spinner, without the class-specific examples.
          </li>
          <li>
            <span className="font-semibold text-foreground">Parties and icebreakers.</span> Load
            Party / icebreakers or type guest names. Spin for who starts a game, who picks the next
            song, or who tells a story. Turn remove-winner off if repeats are fine.
          </li>
          <li>
            <span className="font-semibold text-foreground">White elephant turn order.</span> Paste
            every player&apos;s name, leave remove-winner on, and spin until the wheel is empty. The
            order names come off the wheel is the order people choose or steal gifts. Running a gift
            exchange where everyone buys for one person instead? Use the{" "}
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
            <span className="font-semibold text-foreground">Workshops and facilitation.</span>{" "}
            Pick a volunteer, a note-taker, or the next breakout reporter without looking for eye
            contact. Copy share link if a co-facilitator needs the same list on another device.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="Random name picker with no repeats">
        <p>
          Leave &quot;Remove winner after spin (no repeats)&quot; switched on and each name leaves
          the wheel once it&apos;s picked. Keep spinning until everyone has had a turn. This works
          well for speaking order in a meeting or for drawing several winners. When one name is
          left, that person goes last (the wheel needs at least two slices to spin, so restore the
          list or pick the last name by hand when only one remains). To run the list again, paste it
          back in or use Fresh wheel for the sample set.
        </p>
        <p className="mt-3">
          Turn remove-winner off when streaks are acceptable—for example a light icebreaker where
          the same person can be silly twice. Each spin is still independent and fair; repeats are
          normal with real randomness when names stay on the wheel.
        </p>
      </GuideSection>

      <GuideSection title="Fairness tips">
        <p>
          Every name still on the wheel has the same chance on each spin. The pick comes from your
          browser&apos;s secure random number generator, then the wheel stops on that slice. Shuffle
          only changes the order around the rim. Short labels are easier to read on a projector; if
          two people share a first name, add an initial before you spin so duplicates are not
          collapsed into one slice.
        </p>
        <p className="mt-3">
          Show the full list before important draws. Anyone with a share link can see the names
          packed into that link, so avoid sensitive personal data. For splitting a roster into many
          groups at once, switch to the{" "}
          <Link
            href="/random-team-generator"
            className="font-semibold text-accent hover:underline"
          >
            random team generator
          </Link>
          .
        </p>
      </GuideSection>

      <GuideSection title="Using the name picker for stand-ups and meeting order">
        <p>
          Paste the team list once. It stays in this browser, so tomorrow&apos;s stand-up starts with
          one click. Turn on{" "}
          <span className="font-semibold text-foreground">Remove winner after spin</span> and spin
          until the wheel is empty: the order names come off is your speaking order. If someone joins
          late, add their name as a new line. Duplicate lines are skipped, so two people called Alex
          need an initial (Alex P., Alex R.).
        </p>
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
