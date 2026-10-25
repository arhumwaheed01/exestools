import type { Metadata } from "next";
import Link from "next/link";
import { ClassroomIdeas } from "@/components/ClassroomIdeas";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { loadToolPageMarkdown } from "@/lib/toolPageMarkdown";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const CLASSROOM_REWRITE = loadToolPageMarkdown("classroom-spinner-rewrite.md");

const TITLE = "Classroom Spinner Wheel — Random Student Picker";
const META =
  "Free classroom spinner and random student picker. Paste your roster, spin fairly, and remove students once picked. Lists stay in your browser, no account.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/classroom-spinner") },
  openGraph: toolOpenGraph({
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/classroom-spinner"),
    imagePath: siteConfig.ogImagePath,
    imageAlt: "ExesTools Spinner Wheel",
  }),
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ExesTools`,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

/** One array feeds both the visible FAQ and FAQPage JSON-LD. [Links] render in UI; stripped in JSON-LD. */
const FAQS = [
  {
    q: "Is this classroom spinner free for teachers?",
    a: "Yes. The classroom spinner is free to use, with no account or signup. Open the page, paste your class list, and spin.",
  },
  {
    q: "Is the random student picker really random?",
    a: "Yes. Each spin picks one name from the current list, and every name has the same chance. The pick comes from your browser's built-in random number generator, and the wheel then stops on that name, so the student under the pointer is always the result. Streaks can happen by chance. Keep remove-winner on if you want everyone picked once. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "Can I use it on a projector or interactive whiteboard?",
    a: "Yes. It runs in any modern browser, so you can open it on the classroom computer and show that screen on your projector or board. To make the wheel bigger, use your browser's zoom (Ctrl + or ⌘ +).",
  },
  {
    q: "How many students can I add?",
    a: 'Up to 60 names fit on the wheel, which covers most classes. Put one name per line. Short names are easiest to read, and if two students share a first name, add an initial (for example "Maya R." and "Maya T."), because identical lines count as duplicates and only one is kept.',
  },
  {
    q: "How is this different from the random name picker?",
    a: "This page is set up for classrooms. It opens with a sample class roster, has classroom example wheels (Classroom jobs, Brain break activities, Reading groups), and has remove-winner on so every student gets a turn. For general lists such as meetings or parties, use the [Random name picker].",
  },
  {
    q: "Can I use it as an alphabet or letter wheel?",
    a: 'Yes. Open Examples in the toolbar, then tap Letters A–Z to put all 26 letters on the wheel. With remove-winner on, each letter comes off after it\'s picked, so you can work through the whole alphabet without repeats. It works well for letter of the day, phonics warm-ups, and "name something that starts with…" games.',
  },
  {
    q: "What should I do if a picked student doesn't want to answer?",
    a: "Have a rule ready, like \"pass and I'll come back to you\" or \"phone a friend.\" Come back to them before the round ends so the pick still counts.",
  },
  {
    q: "How long does it take to get through a whole class?",
    a: "It depends on how often you call on students. At about eight picks a lesson, a class of 28 takes three to four lessons for everyone to get one turn with remove winner on.",
  },
  {
    q: "Does it work on a Chromebook or tablet?",
    a: "It runs in any modern browser, so a school laptop, Chromebook or tablet works. Your roster is saved in that device's browser.",
  },
  {
    q: "Can students spin it on their own devices?",
    a: "Yes, if you share the link. Share copies a link that carries the list, so students open the same wheel. Their spins are separate from yours, so for a whole-class pick, spin on the board.",
  },
];

const ALL_FAQS = [...CLASSROOM_REWRITE.faqs, ...FAQS];

export default function ClassroomSpinnerPage() {
  return (
    <UseCaseToolPage
      toolId="classroom-spinner"
      breadcrumbLabel="Classroom spinner"
      title="Classroom spinner wheel"
      intro="Paste your class list, one name per line, and hit SPIN to call on a student at random. It's a random student picker built for fair turn-taking: remove winner is on by default, so every student gets a turn before anyone repeats. Free for teachers, no signup, and your roster stays in this browser."
      faqs={ALL_FAQS}
      pageUpdated="2026-10-23"
      schemaName="Classroom Spinner Wheel"
      schemaDescription={META}
      schemaCategory="EducationalApplication"
    >
      <GuideSection title="How to use the classroom spinner">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Replace the sample roster with your class list, one name per line. You can paste a column
            straight from a spreadsheet. Up to 60 names fit on the wheel.
          </li>
          <li>Press SPIN. The student under the pointer is picked.</li>
          <li>
            Keep &quot;Remove winner after spin&quot; switched on in the toolbar (on by default here).
            Each picked student comes off the wheel, so everyone gets one turn per round.
          </li>
          <li>
            With Remove winner on, the list saved in this browser is only the names still left. Paste
            your full roster again to start a new round.
          </li>
          <li>
            When the round is over, paste your full roster back in. Tip: click Copy before your first
            spin so the whole list is on your clipboard. New restores the sample roster.
          </li>
        </ol>
      </GuideSection>
      <ClassroomIdeas />
      <GuideSection title="Ways teachers use it">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cold calling: pick who answers the next question, with no favorites and no repeats until
            everyone has had a turn.
          </li>
          <li>
            Classroom jobs: open Examples in the toolbar and load Classroom jobs to hand out line
            leader, door holder, and other helper roles.
          </li>
          <li>
            Brain breaks: load Brain break activities from Examples for a quick energizer between
            lessons. Ten review, warm-up and brain-break games are in{" "}
            <Link
              href="/guides/classroom-games-with-a-spinner-wheel"
              className="font-semibold text-accent hover:underline"
            >
              10 classroom games to play with a spinner wheel
            </Link>
            .
          </li>
          <li>
            Groups and presentations: use Reading groups to choose which group shares next, or spin
            your roster to set the presentation order.
          </li>
          <li>
            Letter of the day and phonics warm-ups: tap Letters A–Z and leave remove-winner on to
            work through the alphabet with no repeats.
          </li>
          <li>
            Numbered seats and math warm-ups: spin the{" "}
            <Link
              href="/random-number-wheel"
              className="font-semibold text-accent hover:underline"
            >
              number wheel
            </Link>{" "}
            to call on a desk number or pick numbers for mental math.
          </li>
          <li>
            Need groups for a project?{" "}
            <Link
              href="/random-team-generator"
              className="font-semibold text-accent hover:underline"
            >
              Split the class into groups
            </Link>{" "}
            with the random team generator. For meetings or parties outside class,{" "}
            <Link
              href="/random-name-picker"
              className="font-semibold text-accent hover:underline"
            >
              pick names with remove-winner
            </Link>{" "}
            on the name picker.
          </li>
          <li>
            <span className="font-semibold text-foreground">Review games.</span> Spin to pick who
            reads the next bingo call, then play sight word or times-table bingo with cards from the{" "}
            <Link
              href="/bingo-card-generator"
              className="font-semibold text-accent hover:underline"
            >
              bingo card generator
            </Link>
            .
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="A cold-call routine that stays fair">
        <p>
          Ask the question, give 5–10 seconds of think time, then spin, so all 28 students prepare and
          not just the one who gets picked. Absent students come off the list before the first spin,
          not after. The printable card below has the full routine. For the research on wait time,
          question scripts and anxious students, read{" "}
          <Link
            href="/guides/cold-calling-students-fairly"
            className="font-semibold text-accent hover:underline"
          >
            fair ways to call on students
          </Link>
          .
        </p>
      </GuideSection>
      <GuideMarkdown content={CLASSROOM_REWRITE.content} routineCardAside />
      <GuideSection title="Privacy for schools">
        <p>
          Your class list is saved only in this browser on this device. With{" "}
          <span className="font-semibold text-foreground">Remove winner after spin</span> on, only
          the names still on the wheel are saved—picked students leave the saved list until you paste
          the full roster back in. Student names are not sent anywhere when you spin. If you press
          Share, the names are packed into the link itself, so anyone who opens it can see them.
          Follow your school&apos;s policy before you share a roster, and use first names or initials
          if you prefer. Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
