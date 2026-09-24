import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Yes or No Decision Wheel",
  description:
    "Free Yes/No decision wheel. Spin for Yes or No, or customize options for food, plans, and quick choices. No signup on ExesTools.",
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: "Yes or No Decision Wheel | ExesTools",
    description: "Settle a Yes/No choice instantly with a free online decision spinner.",
    url: absoluteUrl("/yes-no-wheel"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yes or No Decision Wheel | ExesTools",
    description: "Settle a Yes/No choice instantly with a free online decision spinner.",
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "Is Yes and No equally likely?",
    a: "With two equal segments, each spin targets one of them fairly. You can add Maybe or other options by editing the list.",
  },
  {
    q: "Can I keep score of Yes vs No?",
    a: "Note results yourself or leave both options on the wheel and spin again — each spin is independent.",
  },
  {
    q: "What else can I put on this wheel?",
    a: "Food ideas, weekend plans, tasks to start next — any short list works. Try the food or activity presets from Example wheels.",
  },
  {
    q: "Do I need an account?",
    a: "No. The Yes/No wheel runs free in your browser with optional local save.",
  },
];

export default function YesNoWheelPage() {
  return (
    <UseCaseToolPage
      path="/yes-no-wheel"
      title="Yes or No decision wheel"
      intro="Stuck between Yes and No — or dinner options and weekend plans? Spin this free decision wheel and let the pointer decide."
      presetId="yes-no"
      faqs={FAQS}
    >
      <GuideSection title="Quick start">
        <p>
          This page loads a Yes / No wheel. Press SPIN for a clear result. Edit the list to add
          Maybe, Sometimes, or any custom options.
        </p>
      </GuideSection>
      <GuideSection title="Beyond Yes/No">
        <p>
          Use Example wheels for food or activities, or paste your own choices. Remove &amp;
          continue if you want the next spin to pick something else.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
