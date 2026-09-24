import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Classroom Spinner Wheel — Random Student Picker",
  description:
    "Free classroom spinner for fair turn-taking and random student selection. Paste a roster, spin, and use remove-winner for no-repeat fairness. No signup.",
  alternates: { canonical: absoluteUrl("/classroom-spinner") },
  openGraph: {
    title: "Classroom Spinner Wheel | ExesTools",
    description:
      "A free spinner teachers can use for fair student selection and classroom games.",
    url: absoluteUrl("/classroom-spinner"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classroom Spinner Wheel | ExesTools",
    description:
      "A free spinner teachers can use for fair student selection and classroom games.",
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "How do teachers keep selection fair?",
    a: "Use Remove & continue after each spin so each student is selected once before anyone is drawn twice.",
  },
  {
    q: "Can I project this for the class?",
    a: "Yes. Open this page on the classroom display or laptop and use the browser’s fullscreen mode. The SPIN button stays large and touch-friendly.",
  },
  {
    q: "Is student data uploaded?",
    a: "Lists stay in the browser by default. Avoid putting sensitive student data in shareable links unless your school policy allows it.",
  },
  {
    q: "Can I reuse the same class list tomorrow?",
    a: "Choices are saved in local storage on that device so you can return to the same list later.",
  },
];

export default function ClassroomSpinnerPage() {
  return (
    <UseCaseToolPage
      path="/classroom-spinner"
      title="Classroom spinner wheel"
      intro="Fair student selection for questions, presentations, and warm-ups — paste your roster and spin so the class can see the result."
      presetId="names"
      faqs={FAQS}
    >
      <GuideSection title="How teachers use this">
        <p>
          Paste your class list (or a volunteer subset). Spin to select the next speaker. Use Remove
          &amp; continue so participation spreads across the room before anyone is picked twice.
        </p>
      </GuideSection>
      <GuideSection title="Classroom activity ideas">
        <ul className="list-disc space-y-2 pl-5">
          <li>Who answers the next review question</li>
          <li>Presentation or share-out order</li>
          <li>Random partners or discussion leads</li>
          <li>Low-stakes privilege or prize draws for completed work</li>
        </ul>
      </GuideSection>
      <GuideSection title="Privacy note for schools">
        <p>
          By default, names stay on the device. Shared links encode the list in the URL — use them
          carefully with student data and follow your school’s privacy rules.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
