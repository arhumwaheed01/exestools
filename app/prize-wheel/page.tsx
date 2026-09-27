import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Prize Wheel & Giveaway Spinner (Free Online)";
const META =
  "Free online prize wheel for giveaways and raffles. Add prizes or entrant names, spin where everyone can see, and share your list. No signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/prize-wheel") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/prize-wheel"),
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
    q: "Is this an online prize wheel generator?",
    a: "Yes. It's a free online prize wheel that runs in your browser. Type your prizes or entrant names, one per line, and spin. No signup and no download.",
  },
  {
    q: "Is this a physical prize wheel for sale?",
    a: "No. ExesTools doesn't sell or rent physical wheels. This is a free on-screen spinner you can show at an event, in class, or on a stream.",
  },
  {
    q: "Can I spin for prizes or for entrant names?",
    a: 'Both. Use the Prize rewards or Stream giveaway example to spin for a prize, or Entrant names to draw a winner from a list of people. To draw several winners, turn on "Remove winner after spin" so nobody wins twice.',
  },
  {
    q: "Can I use it for an Instagram, TikTok, or Facebook giveaway?",
    a: "Yes, as long as you follow the platform's rules. Paste the entrant names you collected, for example from comments, then spin on screen or record the spin so entrants can see the result. ExesTools doesn't connect to social accounts or import comments.",
  },
  {
    q: "How do I keep a giveaway fair?",
    a: 'Publish your rules before you spin, let everyone see the full list of prizes or names, and explain any "Try again" slices up front. Every slice has the same chance on each spin. Learn more: [How ExesTools picks a result].',
  },
  {
    q: "Is this a certified lottery or raffle draw?",
    a: "No. It's a free random picker, not a certified drawing service. If the law or your platform requires a certified draw, use one. See our [Terms of Service].",
  },
];

export default async function PrizeWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="prize-wheel"
      breadcrumbLabel="Prize wheel"
      title="Online prize wheel"
      intro="Add your prizes, one per line, and spin the wheel where everyone can see it. Start from the Prize rewards list, or switch to Stream giveaway, Classroom rewards, or Entrant names to draw a winner by name. Free, no signup."
      faqs={FAQS}
      schemaName="Online Prize Wheel"
      schemaDescription={META}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
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
            leaves the wheel.
          </li>
          <li>Press Copy share link so others can open the same wheel.</li>
        </ol>
      </GuideSection>
      <GuideSection title="How to run a fair giveaway on stream or in class">
        <p>
          On a stream, put the wheel on screen before you start, read out the full list of prizes or
          entrant names, and say how many winners you&apos;ll draw. Spin live so viewers see the
          result as it happens, and keep a recording or a share link of the exact list you used in
          case anyone asks later.
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
          &quot;Try again&quot; or &quot;Extra spin&quot;, and stick to it. Changing the rules after
          a result is the quickest way to lose trust.
        </p>
      </GuideSection>
      <GuideSection title="Fairness">
        <p>
          Every slice has the same chance on each spin, and the result is always the slice under the
          pointer. Make sure everyone can see the wheel and the full list, and disclose your contest
          rules before you spin. See our{" "}
          <Link href="/terms" className="font-semibold text-accent hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
