import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Prize Wheel & Giveaway Spinner",
  description:
    "Free online prize wheel for giveaways and raffles. Spin prize segments or entrant names with a clear pointer result. Disclose your contest rules.",
  alternates: { canonical: absoluteUrl("/prize-wheel") },
  openGraph: {
    title: "Prize Wheel & Giveaway Spinner | ExesTools",
    description: "Spin a free prize wheel for giveaways and raffles. Transparent pointer-based results.",
    url: absoluteUrl("/prize-wheel"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prize Wheel & Giveaway Spinner | ExesTools",
    description: "Spin a free prize wheel for giveaways and raffles. Transparent pointer-based results.",
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "Should I put prizes or people’s names on the wheel?",
    a: "Either works. Prize segments decide what someone wins; name segments decide who wins. Match the setup to your contest rules.",
  },
  {
    q: "Is this a certified lottery system?",
    a: "No. ExesTools is a convenience spinner. Follow platform and local rules for giveaways, and disclose how winners are chosen.",
  },
  {
    q: "How do I run multiple winners?",
    a: "Spin, note the winner, then Remove & continue (or edit the list) and spin again for the next prize.",
  },
  {
    q: "Can I share the prize list?",
    a: "Yes — use Copy share link so others open the same choices on this page.",
  },
];

export default function PrizeWheelPage() {
  return (
    <UseCaseToolPage
      path="/prize-wheel"
      title="Prize wheel and giveaway spinner"
      intro="Run a clear visual draw: load prize segments or entrant names, spin, and let everyone see where the pointer lands."
      presetId="prizes"
      faqs={FAQS}
    >
      <GuideSection title="Two common setups">
        <p>
          <strong className="text-foreground">Prize segments</strong> — put rewards on the wheel
          (gift card, try again, mystery box) and spin for what someone wins.
        </p>
        <p>
          <strong className="text-foreground">Entrant names</strong> — put participant names on the
          wheel and spin to choose a winner, then remove them for multi-round draws.
        </p>
      </GuideSection>
      <GuideSection title="Fairness and disclosure">
        <p>
          Tell your audience how winners are selected, keep records if required, and follow local or
          platform giveaway rules. This tool is not a regulated lottery system.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
