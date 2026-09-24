import type { Metadata } from "next";
import { GuideSection, SeoGuideLayout } from "@/components/SeoGuideLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Yes or No Decision Wheel",
  description:
    "Free Yes/No decision wheel for quick choices. Load the preset or add custom options like food and activities on the ExesTools spinner.",
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: "Yes or No Decision Wheel | ExesTools",
    description: "Settle a Yes/No choice instantly with a free online decision spinner.",
    url: absoluteUrl("/yes-no-wheel"),
  },
};

export default function YesNoWheelPage() {
  return (
    <SeoGuideLayout
      title="Yes or No decision wheel"
      intro="When you are stuck between yes and no — or dinner options, weekend plans, and to-dos — put the choices on the wheel and let a fair spin decide."
      ctaLabel="Open the Yes/No wheel"
    >
      <GuideSection title="Quick start">
        <p>
          On the Spinner Wheel, choose the Yes / No preset for a two-segment decision, or paste any
          short list (food ideas, tasks, activities) and spin.
        </p>
      </GuideSection>
      <GuideSection title="Beyond Yes/No">
        <p>
          The same tool works as a food picker, activity wheel, or task starter: one choice per
          line, SPIN, and optionally remove the result so the next spin picks something else.
        </p>
      </GuideSection>
    </SeoGuideLayout>
  );
}
