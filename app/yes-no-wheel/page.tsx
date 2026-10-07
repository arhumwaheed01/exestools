import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Yes or No Wheel — Free Decision Spinner";
const META =
  "Stuck on yes or no? Spin a free yes or no wheel for a quick answer, add Maybe, or flip a coin with Heads / Tails. Free, no account.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/yes-no-wheel"),
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
    q: "Is the yes or no wheel random?",
    a: "Yes. Each spin gives Yes and No the same chance, using your browser's built-in random number generator. Streaks, like three Yeses in a row, are normal with real randomness. Learn more: [How ExesTools picks a result].",
  },
  {
    q: "Can I add Maybe?",
    a: "Yes. Choose the Yes / No / Maybe example wheel. It adds a third slice, so each answer has a one-in-three chance.",
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
    q: "Is spinning the wheel as fair as flipping a real coin?",
    a: "Each spin gives Heads and Tails exactly the same chance, and nothing about the previous spin affects the next one. Real coins are very close to 50/50 but not perfect: in a 2023 study of 350,757 hand-tossed flips, coins landed on the side they started on about 50.8% of the time. The wheel has no starting side, so that bias doesn't apply.",
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
      </GuideSection>
    </UseCaseToolPage>
  );
}
