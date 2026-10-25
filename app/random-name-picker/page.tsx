import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const TITLE = "Random Name Picker Wheel – Free, Remove Winner | ExesTools";
const META =
  "Paste up to 60 names and spin the wheel to pick one at random. Remove each winner, share the wheel by link, and keep the list in your browser. Free.";

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
    q: "How do I pick a random name?",
    a: "Paste names one per line, press Spin (or Space), and the wheel lands on one at random.",
  },
  {
    q: "Can I stop the same name being picked twice?",
    a: "Yes. Turn on Remove winner after spin.",
  },
  {
    q: "How many names can I add?",
    a: "Up to 60.",
  },
  {
    q: "Can I share my wheel?",
    a: "Yes. Copy share link opens the same list on another device.",
  },
  {
    q: "How do I bring back removed names?",
    a: "Re-paste your list to restore names. Fresh wheel loads the starter sample again.",
  },
  {
    q: "Is it free? Is my list saved?",
    a: "Free, no account, and the list stays in your browser.",
  },
];

export default function RandomNamePickerPage() {
  return (
    <UseCaseToolPage
      toolId="random-name-picker"
      breadcrumbLabel="Random name picker"
      title="Random Name Picker Wheel"
      intro="Paste a list of up to 60 names and spin. Turn on Remove winner, and nobody gets picked twice, which suits cold-calling a class or setting stand-up order. Copy the share link, and your co-teacher opens the exact same wheel. It's free with no account."
      faqs={FAQS}
      schemaName="Random Name Picker Wheel"
      schemaDescription={META}
      pageUpdated="2026-10-25"
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

      <GuideSection title="Where it earns its keep">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Cold-calling in class.</span> 28 names,
            Remove winner on. By Friday everyone has answered once, and no one can say you always
            pick the front row. See{" "}
            <Link
              href="/guides/cold-calling-students-fairly"
              className="font-semibold text-accent hover:underline"
            >
              calling on students fairly
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Monday stand-up.</span> Spin for who
            goes first, keep Remove winner on, and spin until the wheel is empty. That&apos;s your
            order.
          </li>
          <li>
            <span className="font-semibold text-foreground">White elephant turn order.</span> Same
            trick for a gift exchange: spin until the wheel is empty and play in that order. Steal
            limits and freeze rules are in{" "}
            <Link
              href="/guides/white-elephant-gift-exchange-rules"
              className="font-semibold text-accent hover:underline"
            >
              white elephant gift exchange rules
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Three presenters from fourteen.</span>{" "}
            Spin three times with Remove winner on. Done in under a minute.
          </li>
          <li>
            <span className="font-semibold text-foreground">Small giveaway.</span> For 1–3 winners
            from a short comment list the wheel is fine. For ticket books or alternates, use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
        </ul>
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
          <li>Press Space to spin when the wheel is focused, which is handy when you&apos;re presenting.</li>
          <li>Turn Sound on for a classroom and off for a meeting.</li>
          <li>
            More than 60 names? Split them across two wheels, or use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
          <li>
            Need the whole room in groups rather than one name?{" "}
            <Link
              href="/random-team-generator"
              className="font-semibold text-accent hover:underline"
            >
              Random team generator
            </Link>
            .
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Compared with the big wheel sites">
        <p>
          Bigger wheel sites offer themes, images and huge lists. ExesTools keeps it small: one
          list, one wheel, remove-winner, a share link, and sister tools for{" "}
          <Link href="/random-team-generator" className="font-semibold text-accent hover:underline">
            teams
          </Link>
          ,{" "}
          <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
            raffles
          </Link>{" "}
          and{" "}
          <Link href="/secret-santa-generator" className="font-semibold text-accent hover:underline">
            Secret Santa
          </Link>{" "}
          on the same site. Spinning for prizes rather than names? Try the{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel spinner
          </Link>
          .
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
