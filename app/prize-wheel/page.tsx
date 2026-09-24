import type { Metadata } from "next";
import { GuideSection, SeoGuideLayout } from "@/components/SeoGuideLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Prize Wheel & Giveaway Spinner",
  description:
    "Free online prize wheel for giveaways, raffles, and loyalty draws. Add prizes or entrant names, spin fairly, and share your list on ExesTools.",
  alternates: { canonical: absoluteUrl("/prize-wheel") },
  openGraph: {
    title: "Prize Wheel & Giveaway Spinner | ExesTools",
    description:
      "Spin a free prize wheel for giveaways and raffles. Transparent pointer-based results.",
    url: absoluteUrl("/prize-wheel"),
  },
};

export default function PrizeWheelPage() {
  return (
    <SeoGuideLayout
      title="Prize wheel and giveaway spinner"
      intro="Run a clear, visual prize draw: load the Prize wheel preset or paste entrant names / rewards, then spin so everyone can see the landing segment."
      ctaLabel="Spin the prize wheel"
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
      <GuideSection title="Fairness and compliance">
        <p>
          Disclose how winners are selected, keep a record if your platform requires it, and follow
          local or platform rules for giveaways. ExesTools is a convenience tool — it is not a
          certified lottery system for regulated drawings.
        </p>
      </GuideSection>
    </SeoGuideLayout>
  );
}
