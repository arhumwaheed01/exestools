import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Random Name Picker Wheel",
  description:
    "Free random name picker wheel. Paste names, spin fairly, remove winners for no-repeat draws. Works in the browser on ExesTools.",
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: {
    title: "Random Name Picker Wheel | ExesTools",
    description:
      "Pick a name fairly with a free online spinner wheel. Great for classrooms, meetings, and games.",
    url: absoluteUrl("/random-name-picker"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Name Picker Wheel | ExesTools",
    description:
      "Pick a name fairly with a free online spinner wheel. Great for classrooms, meetings, and games.",
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "How do I pick a name without repeats?",
    a: "After someone wins, choose Remove & continue. That name leaves the list so the next spin picks from who remains.",
  },
  {
    q: "Can I paste a class or team roster?",
    a: "Yes. Put one name per line in the choices editor. Empty lines are ignored and duplicates are skipped.",
  },
  {
    q: "Does the name under the pointer match the result?",
    a: "Yes. The winner is calculated from the final wheel angle under the fixed pointer — not a separate random label.",
  },
  {
    q: "Is this free?",
    a: "Yes. No account or payment is required to use the random name picker on ExesTools.",
  },
];

export default function RandomNamePickerPage() {
  return (
    <UseCaseToolPage
      path="/random-name-picker"
      title="Random name picker wheel"
      intro="Paste your list, hit SPIN, and let the pointer choose who goes next — for classrooms, meetings, parties, and fair turn-taking."
      presetId="names"
      faqs={FAQS}
    >
      <GuideSection title="When a name picker helps">
        <p>
          A visible spinner reduces awkward pauses when choosing who answers, presents first, or
          wins a lighthearted draw. Everyone sees the same wheel stop under the pointer.
        </p>
      </GuideSection>
      <GuideSection title="How to use this name picker">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Edit the starter names or paste your own roster (one name per line).</li>
          <li>Press SPIN and wait for the wheel to stop.</li>
          <li>Optional: Remove &amp; continue so that person is not drawn again.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Tips for larger groups">
        <p>
          Prefer short display names so labels stay readable. For no-repeat games, keep removing
          winners until fewer than two names remain (you need at least two choices to spin).
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
