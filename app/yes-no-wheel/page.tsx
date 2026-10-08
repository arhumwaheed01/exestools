import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Yes or No Wheel – Free Yes No Spinner | ExesTools";
const META =
  "Spin a free yes or no wheel for a 50/50 answer. Add Maybe for a three-way pick, count your results, or toss a coin with Heads / Tails. No account needed.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: TITLE,
    description: META,
    url: absoluteUrl("/yes-no-wheel"),
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
    q: "Why did I get the same answer several times in a row?",
    a: "Streaks are normal with real randomness. Each spin is independent, so past results don't change the next one.",
  },
];

export default async function YesNoWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
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
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to spin Yes or No">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Think of a yes-or-no question.</li>
          <li>Press SPIN. The wheel lands on Yes or No.</li>
          <li>
            Spin again as often as you like. Leave &quot;Remove winner after spin&quot; off so both
            answers stay on the wheel.
          </li>
          <li>
            Want a Maybe? Choose Yes / No / Maybe. For a coin toss, choose Heads / Tails. Press Fresh
            wheel to go back to plain Yes and No.
          </li>
        </ol>
      </GuideSection>
      <GuideSection title="Flip a coin with the wheel">
        <p>
          Tap Heads / Tails and press SPIN. It&apos;s the same 50/50 spin as Yes / No with different
          labels, so it works anywhere you&apos;d toss a coin: deciding who goes first in a game, who
          picks the movie, or which of two options to try.
        </p>
        <p className="font-semibold text-foreground">A few tips:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Call it before you spin. Say &quot;Heads, we go to the park&quot; out loud, so nobody can
            reinterpret the result afterwards.
          </li>
          <li>
            Best of three. Spin three times and take the side that wins twice. Leave &quot;Remove
            winner after spin&quot; off so both sides stay on the wheel.
          </li>
          <li>
            Two options, not yes or no? Give each option a side, or type the two options in place of
            Heads and Tails under Your choices.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="When a yes-or-no spin helps">
        <p>
          A quick spin works best for small choices where either answer is fine: whether to order
          dessert, go for a run now or later, or take the scenic route. It&apos;s also a neutral way
          to break a tie between two people, because nobody controls the outcome.
        </p>
        <p>
          It can also show you what you want. Before you spin, pick which answer means what. When the
          wheel stops, notice your first reaction. If you feel relieved, go with it. If you&apos;re
          disappointed and want to spin again, you probably wanted the other answer all along.
        </p>
        <p>
          For decisions about health, money, legal matters or anything hard to undo, don&apos;t leave
          it to a wheel. Take your time and get advice from someone qualified.
        </p>
      </GuideSection>
      <GuideSection title="Yes, No or Maybe?">
        <p>
          The standard wheel has two slices, so Yes and No each have an even chance. Tap{" "}
          <span className="font-semibold text-foreground">Yes / No / Maybe</span> to add a third
          slice, and each answer then has a one-in-three chance. Maybe is useful when &quot;not
          now&quot; is a real option, like whether to reply to a message tonight or buy something
          today.
        </p>
        <p>
          Decide what Maybe means before you spin, or it just puts the question off. Good rules:
          &quot;Maybe means ask me again tomorrow&quot;, &quot;Maybe means we each name one reason
          and decide together&quot;, or &quot;Maybe means spin Yes / No once more&quot;.
        </p>
        <p>
          If you want more than an answer, try{" "}
          <span className="font-semibold text-foreground">Quick decide</span>. Its slices are actions
          rather than answers: do it, wait, ask someone, or skip. It&apos;s handy for small tasks you
          keep putting off. You can also edit any slice under Your choices, for example &quot;Yes,
          today&quot; and &quot;No, next week&quot;, and press{" "}
          <span className="font-semibold text-foreground">Fresh wheel</span> to go back to plain Yes
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
        <p>The wheel can only help if the question has a clear yes and a clear no. A few tips:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Make it one decision.</span> &quot;Should
            I go to the gym tonight?&quot; works. &quot;Should I go to the gym or cook or call
            Sam?&quot; doesn&apos;t. For that, use the{" "}
            <Link href="/" className="font-semibold text-accent hover:underline">
              multi-option wheel
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Put &quot;yes&quot; on the action.</span>{" "}
            Phrase it so Yes means doing something, which makes the result easy to act on.
          </li>
          <li>
            <span className="font-semibold text-foreground">Set a time.</span> &quot;Tonight&quot; or
            &quot;this weekend&quot; stops you arguing with the answer later.
          </li>
          <li>
            <span className="font-semibold text-foreground">Agree on the rules first.</span> In a
            group, say out loud what Yes and No mean, and whether it&apos;s one spin or best of
            three.
          </li>
          <li>
            <span className="font-semibold text-foreground">Only ask what you&apos;ll accept.</span>{" "}
            If either answer would make you unhappy, the question isn&apos;t ready for a wheel yet.
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Yes or no toss: wheel, coin or dice?">
        <p>
          A coin toss, a dice roll (odd for Yes, even for No) and this wheel all give the same thing,
          a 50/50 answer. The wheel helps when nobody has a coin, when you want everyone on a video
          call to see the result, or when you want labels other than Heads and Tails.
        </p>
        <p>
          For a classic toss, tap{" "}
          <span className="font-semibold text-foreground">Heads / Tails</span> and spin. For a
          &quot;yes or no dice&quot; style roll, just use Yes / No. There are no dice on this page,
          but a two-slice spin gives the same even odds as odd vs even on a die. Need an actual
          number, like 1 to 6? Use the{" "}
          <Link
            href="/random-number-wheel"
            className="font-semibold text-accent hover:underline"
          >
            random number wheel
          </Link>
          .
        </p>
        <p>
          Each spin is independent, so a run of three Yeses in a row doesn&apos;t make No
          &quot;due&quot;. If you&apos;re spinning to settle a tie between two people, call your side
          before the spin and agree that the first result counts.
        </p>
      </GuideSection>
      <GuideSection title="Beyond Yes/No">
        <p>
          Need to choose among food, activities, or other open lists? Go to the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            Multi-option decision wheel
          </Link>{" "}
          on the homepage.
        </p>
        <p>
          Picking a person, not an answer? Use the{" "}
          <Link
            href="/random-name-picker"
            className="font-semibold text-accent hover:underline"
          >
            random name picker
          </Link>
          .
        </p>
        <p>
          Spinning for rewards? Use the{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
