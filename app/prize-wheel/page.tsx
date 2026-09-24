import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Prize Wheel & Giveaway Spinner (Free Online)";
const META =
  "Free online prize wheel for giveaways and raffles. Add prizes or entrant names, spin so everyone sees the result, and share your list. Disclose contest rules.";

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
    q: "Online generator?",
    a: "Yes.",
  },
  {
    q: "Prizes or names?",
    a: "Both; use the matching chip.",
  },
  {
    q: "Legal lottery?",
    a: "No; follow your platform/local rules.",
  },
  {
    q: "Fairness?",
    a: "Visible pointer + labels; explain “try again” up front.",
  },
  {
    q: "Social giveaways?",
    a: "You may film the spin; platform policies still apply.",
  },
];

export default async function PrizeWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="prize-wheel"
      breadcrumbLabel="Prize wheel"
      title="Online prize wheel"
      intro="Loads prize reward segments. Edit or switch chips (stream giveaway / classroom rewards / entrant names), then SPIN in view of everyone. Free online tool—not a certified lottery. No signup."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to run a giveaway spin">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Start from Prize rewards or another chip.</li>
          <li>Press SPIN.</li>
          <li>Remove-winner off by default; turn on for multi-winner name draws.</li>
          <li>Share this path + #w=. State rules before spinning.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Fairness">
        <p>
          Everyone should see the wheel and pointer. Disclose contest rules before you spin.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
