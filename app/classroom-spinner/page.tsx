import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Classroom Spinner Wheel — Random Student Picker";
const META =
  "Free classroom spinner & random student picker. Paste your roster, spin, optionally skip repeats. Lists stay in-browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/classroom-spinner") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/classroom-spinner"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
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
    a: 'Leave "Remove winner after spin (no repeats)" switched on. It is on by default on this page. Each student who is picked comes off the wheel, so everyone gets a turn before anyone repeats. When one name is left, that student is next. To start a new round, paste your full roster back in. Tip: click Copy before your first spin so the whole list is on your clipboard.',
  },
  {
    q: "Is the random student picker really random?",
    a: "Yes. Each spin picks one name from the current list, and every name has the same chance. The pick comes from your browser's built-in random number generator, and the wheel then stops on that name, so the student under the pointer is always the result. Streaks can happen by chance. Keep remove-winner on if you want everyone picked once.",
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
];

export default async function ClassroomSpinnerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="classroom-spinner"
      breadcrumbLabel="Classroom spinner"
      title="Classroom spinner wheel"
      sectionHeading="Random student picker for fair turn-taking"
      intro="Paste your class list, one name per line, and hit SPIN to call on a student at random. Remove winner is on by default, so every student gets a turn before anyone repeats. Free for teachers, no signup, and your roster stays in this browser."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
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
            When the round is over, paste your full roster back in. Tip: click Copy before your first
            spin so the whole list is on your clipboard. Fresh wheel brings back the sample roster.
          </li>
        </ol>
      </GuideSection>
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
        </ul>
      </GuideSection>
      <GuideSection title="Privacy for schools">
        <p>
          Your class list is saved only in this browser on this device. Student names are not sent
          anywhere when you spin. If you press Copy share link, the names are packed into the link
          itself, so anyone who opens it can see them. Follow your school&apos;s policy before you
          share a roster, and use first names or initials if you prefer. Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
