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
    q: "How do I call on every student once, with no repeats?",
    a: 'Leave "Remove winner after spin (no repeats)" switched on. It is on by default on this page. Each student who is picked comes off the wheel, so everyone gets a turn before anyone repeats. When one name is left, that student is next. To start a new round, paste your full roster back in. With Remove winner on, the list saved in your browser is only the names still left. Paste your full roster again to start a new round. Tip: click Copy before your first spin so the whole list is on your clipboard.',
  },
  {
    q: "Is the random student picker really random?",
    a: "Yes. Each spin picks one name from the current list, and every name has the same chance. The pick comes from your browser's built-in random number generator, and the wheel then stops on that name, so the student under the pointer is always the result. Streaks can happen by chance. Keep remove-winner on if you want everyone picked once. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "Can I use it on a projector or interactive whiteboard?",
    a: "Yes. It runs in any modern browser, so you can open it on the classroom computer and show that screen on your projector or board. ExesTools does not have a separate fullscreen mode, so use your browser's zoom if you want the wheel bigger.",
  },
  {
    q: "How many students can I add?",
    a: 'Up to 60 names fit on the wheel, which covers most classes. Put one name per line. Short names are easiest to read, and if two students share a first name, add an initial (for example "Maya R." and "Maya T."), because identical lines count as duplicates and only one is kept.',
  },
  {
    q: "Are my students' names uploaded anywhere?",
    a: "No. Your class list is saved only in this browser on this device, so it is still there next lesson. Names leave your device only if you press Copy share link and send that link to someone. The list is packed into the link itself, so anyone who has it can see the names. Check your school's policy before you share a roster. See our [Privacy Policy].",
  },
  {
    q: "How is this different from the random name picker?",
    a: "This page is set up for classrooms. It opens with a sample class roster, has classroom example wheels (Classroom jobs, Brain break activities, Reading groups), and has remove-winner on so every student gets a turn. For general lists such as meetings or parties, use the [Random name picker].",
  },
  {
    q: "Can I use it as an alphabet or letter wheel?",
    a: 'Yes. Tap Letters A–Z under Example wheels to put all 26 letters on the wheel. With remove-winner on, each letter comes off after it\'s picked, so you can work through the whole alphabet without repeats. It works well for letter of the day, phonics warm-ups, and "name something that starts with…" games.',
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
    q: "Can I use the classroom spinner for lab roles or group jobs?",
    a: "Yes. Replace the names with roles such as recorder, timer and reporter, and spin for each group. You can also load the Classroom jobs example and edit it.",
  },
  {
    q: "Does it work on a Chromebook or tablet?",
    a: "It runs in any modern browser, so a school laptop, Chromebook or tablet works. Your roster is saved in that device's browser.",
  },
  {
    q: "Can students spin it on their own devices?",
    a: "Yes, if you share the link. Copy share link carries the list, so students open the same wheel. Their spins are separate from yours, so for a whole-class pick, spin on the board.",
  },
  {
    q: "Can I carry a round over to the next lesson?",
    a: "Yes. With remove winner on, the saved list keeps only the students who haven't been picked yet. Open the page next lesson and carry on from where you stopped.",
  },
];

const ALL_FAQS = [...CLASSROOM_REWRITE.faqs, ...FAQS];

export default function ClassroomSpinnerPage() {
  return (
    <UseCaseToolPage
      toolId="classroom-spinner"
      breadcrumbLabel="Classroom spinner"
      title="Classroom spinner wheel"
      sectionHeading="Random student picker for fair turn-taking"
      intro="Paste your class list, one name per line, and hit SPIN to call on a student at random. Remove winner is on by default, so every student gets a turn before anyone repeats. Free for teachers, no signup, and your roster stays in this browser."
      faqs={ALL_FAQS}
      pageUpdated="2026-10-19"
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
            Keep &quot;Remove winner after spin (no repeats)&quot; switched on. Each picked student
            comes off the wheel, so everyone gets one turn per round.
          </li>
          <li>
            With Remove winner on, the list saved in your browser is only the names still left. Paste
            your full roster again to start a new round.
          </li>
          <li>
            When the round is over, paste your full roster back in. Tip: click Copy before your first
            spin so the whole list is on your clipboard. Fresh wheel brings back the sample roster.
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
            Classroom jobs: load the Classroom jobs wheel to hand out line leader, door holder, and
            other helper roles.
          </li>
          <li>
            Brain breaks: spin the Brain break activities wheel for a quick energizer between
            lessons.
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
            with the random team generator.
          </li>
          <li>
            Need partners instead of one name? Use the{" "}
            <Link
              href="/random-team-generator#pairs"
              className="font-semibold text-accent hover:underline"
            >
              random pair generator
            </Link>
            .
          </li>
          <li>
            Planning a class gift swap? Try the{" "}
            <Link
              href="/secret-santa-generator"
              className="font-semibold text-accent hover:underline"
            >
              Secret Santa generator
            </Link>
            .
          </li>
          <li>
            For a quick class vote, spin the{" "}
            <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
              yes or no wheel
            </Link>
            . For reward days, use the{" "}
            <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
              classroom prize wheel
            </Link>
            .
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
      <GuideSection title="A 5-minute cold-call routine that stays fair">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Before class, paste your roster and press{" "}
            <span className="font-semibold text-foreground">Copy</span> so the full list is on your
            clipboard.
          </li>
          <li>
            Ask the question first, give 5–10 seconds of think time,{" "}
            <em>then</em> press SPIN. Everyone prepares, not just the student who gets picked.
          </li>
          <li>
            Leave{" "}
            <span className="font-semibold text-foreground">Remove winner after spin</span> on. A
            picked student leaves the wheel, so nobody is called twice before everyone has had a
            turn.
          </li>
          <li>
            If a student is absent, delete their line instead of spinning again. It keeps the odds
            equal for everyone else.
          </li>
          <li>
            When one name is left, SPIN switches off — that student goes last. Paste the roster back
            in to start a new round.
          </li>
        </ol>
        <p>
          Why it works: students can see the pick isn&apos;t the teacher choosing, and remove-winner
          guarantees everyone gets one turn per round. For the research, question scripts and tips
          for anxious students, read{" "}
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
      <GuideSection title="More classroom ideas">
        <h3 className="text-lg font-bold tracking-tight text-foreground">The mechanics, in teacher terms</h3>
        <p>
          Each name on the list is one equal slice, and each spin picks one student from the names still
          on the wheel. Remove winner is on by default here, so a picked student comes off and the next
          spin is only between students who haven&apos;t had a turn. You can&apos;t accidentally call on
          the same eager hand three times in a lesson. The wheel holds up to 60 names, and the list stays
          in your browser between lessons, with no student accounts.
        </p>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Uses by subject</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">English:</span>{" "}
            who reads the next paragraph aloud; which character a group writes about; spinning a story
            element (setting, problem, twist) for a quick-write.
          </li>
          <li>
            <span className="font-semibold text-foreground">Math:</span>{" "}
            whose working goes under the document camera; which strategy a table has to use for the next
            problem.
          </li>
          <li>
            <span className="font-semibold text-foreground">Science:</span>{" "}
            lab roles for each group, like recorder, materials manager, timer and reporter. Spin a role
            wheel, not names, and each group member takes the next role.
          </li>
          <li>
            <span className="font-semibold text-foreground">PE:</span>{" "}
            which warm-up drill, which station a group starts at, who chooses the cool-down stretch.
          </li>
          <li>
            <span className="font-semibold text-foreground">Languages:</span>{" "}
            spin vocabulary topics, then spin a student to start the conversation.
          </li>
        </ul>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Worked example: one week with a class of 28</h3>
        <p>
          Say you call on students about eight times a lesson and teach the class every day.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Monday:</span>{" "}
            paste the roster and press{" "}
            <span className="font-semibold text-foreground">Copy</span>{" "}
            before the first spin. Eight names come off. Twenty are left.
          </li>
          <li>
            <span className="font-semibold text-foreground">Tuesday:</span>{" "}
            don&apos;t paste the roster back. Carry on with the 20 who are left. Eight more. Twelve left.
          </li>
          <li>
            <span className="font-semibold text-foreground">Wednesday:</span>{" "}
            eight more. Four left.
          </li>
          <li>
            <span className="font-semibold text-foreground">Thursday:</span>{" "}
            the last four go first, then paste the full roster back in and start round two.
          </li>
        </ul>
        <p>
          By Thursday every student has been called on exactly once, and nobody had a second turn while
          someone else was still waiting. If a student is absent, delete their line for the day and add it
          back when they return. They keep their place in the round.
        </p>
        <h3 className="text-lg font-bold tracking-tight text-foreground">Classroom tips</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Ask the question before you spin.</span>{" "}
            If you spin first, 27 students relax.
          </li>
          <li>
            <span className="font-semibold text-foreground">Allow &quot;phone a friend.&quot;</span>{" "}
            The picked student can choose a classmate to help. It keeps participation high without putting
            anyone on the spot.
          </li>
          <li>
            <span className="font-semibold text-foreground">Use table names</span>{" "}
            instead of student names when you want group accountability.
          </li>
          <li>
            <span className="font-semibold text-foreground">Make one share link per class</span>{" "}
            and bookmark them with the period or class name, so switching classes takes one click.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Privacy for schools">
        <p>
          Your class list is saved only in this browser on this device. With{" "}
          <span className="font-semibold text-foreground">Remove winner after spin</span> on, only
          the names still on the wheel are saved—picked students leave the saved list until you paste
          the full roster back in. Student names are not sent anywhere when you spin. If you press
          Copy share link, the names are packed into the link itself, so anyone who opens it can see
          them. Follow your school&apos;s policy before you share a roster, and use first names or
          initials if you prefer. Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
