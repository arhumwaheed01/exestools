import type { Metadata } from "next";
import Link from "next/link";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { loadToolPageMarkdown } from "@/lib/toolPageMarkdown";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const YES_NO_DECISION = loadToolPageMarkdown("yes-no-wheel-decision-section.md");

const TITLE = "Yes or No Wheel – Spin to Decide (Free Yes/No Spinner)";
const META =
  "Can't decide? Spin the yes or no wheel for a 50/50 answer, add Maybe for three options, and count results. Free, no account.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/yes-no-wheel"),
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
    q: "Is the yes or no wheel random?",
    a: "Yes. Each spin gives Yes and No the same chance, using your browser's built-in random number generator. Streaks, like three Yeses in a row, are normal with real randomness. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "What are the odds on a yes or no wheel?",
    a: "With Yes and No only, each answer has a 1 in 2 (50%) chance on every spin. Add Maybe and each of the three answers has a 1 in 3 chance.",
  },
  {
    q: "What does Maybe mean on the yes no wheel?",
    a: 'Whatever you decide before spinning. A common rule is "Maybe means ask again later" or "spin once more with just Yes and No".',
  },
  {
    q: "Is there a yes no maybe wheel?",
    a: "Yes. Tap Yes / No / Maybe under Example wheels. It adds a third slice, so each answer has a one-in-three chance.",
  },
  {
    q: "What is Quick decide?",
    a: "An example wheel with four actions instead of answers: do it, wait, ask someone, or skip. Use it when you know what to do but not whether to do it now.",
  },
  {
    q: "Can I change the answers?",
    a: 'Yes. Edit the list under Your choices, for example "Do it" and "Don\'t", or try the Quick decide example (Do it, Wait, Ask someone, Skip).',
  },
  {
    q: "What if I have more than two options?",
    a: "Use the [multi-option decision wheel] on the homepage. This page is built for yes-or-no questions.",
  },
  {
    q: "Can I use this as a coin flip?",
    a: 'Yes. Tap Heads / Tails under Example wheels and press SPIN. It\'s the same 50/50 spin as Yes / No, just with different labels. Call your side before you spin.',
  },
  {
    q: "Can I use it like a yes or no dice?",
    a: "Yes. A two-slice Yes / No spin gives the same 50/50 odds as rolling odd vs even on a die. There are no dice on this page. For numbers, use the [random number wheel].",
  },
  {
    q: "Can I share my yes or no wheel?",
    a: "Yes. Press Copy share link. The link carries your list of answers, so anyone you send it to sees the same wheel.",
  },
  {
    q: "Is spinning the wheel as fair as flipping a real coin?",
    a: "Each spin gives Heads and Tails exactly the same chance, and nothing about the previous spin affects the next one. Real coins are very close to 50/50 but not perfect: in a 2023 study of 350,757 hand-tossed flips, coins landed on the side they started on about 50.8% of the time. The wheel has no starting side, so that bias doesn't apply.",
  },
  {
    q: "Should I use the wheel for big decisions?",
    a: "No. Use it for small choices where either answer is fine. For health, money, legal or other hard-to-undo decisions, take your time and get advice from someone qualified.",
  },
  {
    q: "Why did I get No five times in a row?",
    a: "Chance. With two equal slices, five Nos in a row happens about 1 time in 32. Each spin is independent, so the next one is still 50/50.",
  },
  {
    q: "Does the yes or no wheel remember my last answer?",
    a: "No. Every spin is a fresh pick with the same odds. The counter under the wheel only shows your running tally.",
  },
  {
    q: "Can I use the yes or no wheel to teach probability?",
    a: "Yes. Have students predict a tally, spin 20 times, and compare. It's a quick way to show that exact 50/50 splits are less common than people expect.",
  },
  {
    q: "Is coin-toss mode different from Yes / No?",
    a: "Only the labels change. Heads / Tails is the same two-slice, 50/50 spin.",
  },
  {
    q: "How do I settle who goes first on a video call?",
    a: "Tap Heads / Tails, let each person call a side out loud, share your screen and spin once.",
  },
];

export default function YesNoWheelPage() {
  return (
    <UseCaseToolPage
      toolId="yes-no-wheel"
      breadcrumbLabel="Yes or no wheel"
      title="Yes or no wheel"
      intro={
        <>
          Ask your question, hit SPIN, and the wheel lands on Yes or No. It works as a simple yes no
          wheel or yes or no spinner whenever you need a quick answer. Want a third option? Switch to
          Yes / No / Maybe, or tap Heads / Tails for a coin flip. If you&apos;re choosing between
          more than two options, use the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            multi-option decision wheel
          </Link>{" "}
          on the homepage.
        </>
      }
      faqs={FAQS}
      schemaName="Yes or No Wheel"
      schemaDescription={META}
      schemaAlternateName={["Yes No Spinner", "Yes or No Spinner", "Yes No Maybe Wheel"]}
      schemaFeatureList={[
        "Yes / No / Maybe modes",
        "Quick decide",
        "Heads / Tails coin toss",
        "Results counter",
        "Copy share link",
        "No signup",
      ]}
      pageUpdated="2026-10-20"
    >
      <GuideSection title="How to spin Yes or No">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Think of a yes-or-no question.</li>
          <li>Press SPIN. The wheel lands on Yes or No.</li>
          <li>Spin again as often as you like — both answers stay on the wheel.</li>
          <li>
            Want a Maybe? Choose Yes / No / Maybe. For a coin toss, choose Heads / Tails. Press Fresh
            wheel to go back to plain Yes and No.
          </li>
        </ol>
        <p className="mt-3">
          With only Yes and No on the wheel, each answer has a 1 in 2 (50%) chance on every spin.
          Spins don&apos;t affect the next odds—a long streak of Yes answers is unlikely but normal
          with real randomness.
        </p>
      </GuideSection>
      <GuideSection title="Flip a coin with the wheel">
        <p>
          Tap Heads / Tails and press SPIN for the same 50/50 spin with different labels—useful for
          who goes first, who picks the movie, or a shared result on a video call. Call your side
          before you spin, or run best of three. For two custom options, type them in place of Heads
          and Tails under Your choices.
        </p>
      </GuideSection>
      <GuideSection title="When a yes-or-no spin helps">
        <p>
          A quick spin works best for small choices where either answer is fine: whether to order
          dessert, go for a run now or later, or take the scenic route. It&apos;s also a neutral way
          to break a tie between two people, because nobody controls the outcome. For health, money,
          legal matters or anything hard to undo, take your time and get advice from someone
          qualified instead.
        </p>
      </GuideSection>
      <GuideMarkdown content={YES_NO_DECISION.content} />
      <GuideSection title="Yes, No or Maybe?">
        <p>
          Tap <span className="font-semibold text-foreground">Yes / No / Maybe</span> to add a third
          slice (one-in-three odds each). Decide what Maybe means before you spin—for example
          &quot;ask again tomorrow&quot; or &quot;spin Yes / No once more&quot;. For actions instead
          of answers, try{" "}
          <span className="font-semibold text-foreground">Quick decide</span> (do it, wait, ask
          someone, or skip). Edit any slice under Your choices, and press{" "}
          <span className="font-semibold text-foreground">Fresh wheel</span> to return to plain Yes
          and No.
        </p>
      </GuideSection>
      <GuideSection title="Yes or no odds">
        <div className="overflow-x-auto">
          <table className="w-full max-w-lg border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-semibold text-foreground">Wheel</th>
                <th className="py-2 font-semibold text-foreground">Chance of each answer</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 text-foreground">Yes / No</td>
                <td className="py-2">1 in 2 (50%)</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 text-foreground">Yes / No / Maybe</td>
                <td className="py-2">1 in 3 (about 33.3%)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-foreground">Heads / Tails</td>
                <td className="py-2">1 in 2 (50%)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Every slice is the same size, so each answer has the same chance on every spin. Spins are
          independent. After three Nos in a row, the next spin is still 50/50. Over 10 spins you
          won&apos;t always get exactly 5 Yes and 5 No, because short runs are normal. Use the
          counter under the wheel to see your own split.
        </p>
      </GuideSection>
      <GuideSection title="How to ask a good yes-or-no question">
        <p>
          Keep it to one decision with a clear Yes and No. &quot;Should I go to the gym tonight?&quot;
          works; three options at once belong on the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            multi-option wheel
          </Link>
          . Put Yes on the action, add a time window if it helps, and only spin when you&apos;ll
          accept either answer. In a group, say out loud what Yes and No mean before anyone presses
          SPIN.
        </p>
      </GuideSection>
      <GuideSection title="Under the hood">
        <p>
          The yes or no wheel is a two-slice spinner: one Yes, one No. Each spin picks one at random with
          equal odds, then the wheel turns to land on it. Spins don&apos;t remember each other, so a run
          of No answers says nothing about the next spin. Tap{" "}
          <span className="font-semibold text-foreground">Yes / No / Maybe</span>{" "}
          for three slices, or{" "}
          <span className="font-semibold text-foreground">Heads / Tails</span>{" "}
          for a coin-toss mode with the same 50/50 odds as Yes and No.
        </p>
        <p>
          It&apos;s free, there&apos;s no account, and the answers you set up are saved in your browser.
        </p>
      </GuideSection>
      <GuideSection title="Small ways people use it">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Kids&apos; choices:</span>{" "}
            &quot;Bath before or after the story?&quot; Let the child press SPIN, and the result belongs to
            the wheel, not to you.
          </li>
          <li>
            <span className="font-semibold text-foreground">Date night:</span>{" "}
            &quot;Cook in?&quot; One spin, no debate.
          </li>
          <li>
            <span className="font-semibold text-foreground">Tabletop games:</span>{" "}
            a game master can let the wheel answer &quot;does the shopkeeper know anything?&quot; when
            there&apos;s no rule.
          </li>
          <li>
            <span className="font-semibold text-foreground">Who goes first:</span>{" "}
            Heads / Tails on a video call, with the screen shared so both sides see it.
          </li>
          <li>
            <span className="font-semibold text-foreground">Teaching probability:</span>{" "}
            short runs, long runs and why &quot;due&quot; isn&apos;t a thing.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Worked example: a probability lesson in ten minutes">
        <p>
          Ask the class to predict how many Yeses you&apos;ll get in 20 spins. Most will say 10. Spin 20
          times and use the counter under the wheel to keep the tally.
        </p>
        <p>
          Then show the math. The chance of getting{" "}
          <em>exactly</em>{" "}
          10 Yeses in 20 fair spins is about 17.6% (there are 184,756 ways to choose which 10 spins are
          Yes, out of 1,048,576 possible sequences). So getting exactly 10 is actually unlikely. Results
          like 8, 9, 11 or 12 are just as normal.
        </p>
        <p>
          Follow up with streaks. The chance of five No answers in a row is 1 in 32, about 3.1%. Over a
          class&apos;s worth of spins, a streak like that will turn up now and then, and it doesn&apos;t
          mean the wheel is broken.
        </p>
      </GuideSection>
      <GuideSection title="Tips">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Say what Yes means out loud</span>{" "}
            before a group spin, so nobody reinterprets it afterwards.
          </li>
          <li>
            <span className="font-semibold text-foreground">Make Yes the change</span>{" "}
            when you&apos;re stuck between doing something new and staying put.
          </li>
          <li>
            <span className="font-semibold text-foreground">Decide on one spin or best of three before you start.</span>{" "}
            Switching after a bad result is how arguments begin.
          </li>
          <li>
            <span className="font-semibold text-foreground">Use the yes or no wheel for small, reversible choices.</span>{" "}
            For anything with real consequences, take your time.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Beyond Yes/No">
        <p>
          For open lists use the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            multi-option decision wheel
          </Link>
          ; for a person, the{" "}
          <Link
            href="/random-name-picker"
            className="font-semibold text-accent hover:underline"
          >
            random name picker
          </Link>
          ; for rewards, the{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel
          </Link>
          . Or see{" "}
          <Link href="/#which-tool" className="font-semibold text-accent hover:underline">
            which tool should I use
          </Link>{" "}
          on the homepage.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
