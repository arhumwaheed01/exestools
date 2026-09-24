import type { Metadata } from "next";
import { GuideSection, SeoGuideLayout } from "@/components/SeoGuideLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Random Name Picker Wheel",
  description:
    "Free random name picker wheel for classrooms, meetings, and parties. Paste names, spin fairly, and optionally remove winners. No signup on ExesTools.",
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: {
    title: "Random Name Picker Wheel | ExesTools",
    description:
      "Pick a name fairly with a free online spinner wheel. Great for classrooms, standups, and party games.",
    url: absoluteUrl("/random-name-picker"),
  },
};

export default function RandomNamePickerPage() {
  return (
    <SeoGuideLayout
      title="Random name picker wheel"
      intro="Use the ExesTools Spinner Wheel as a free random name picker: paste one name per line, hit SPIN, and let the pointer decide who goes next."
      ctaLabel="Pick a name on the Spinner Wheel"
    >
      <GuideSection title="When a name picker helps">
        <p>
          Name pickers reduce awkward pauses when choosing who answers a question, presents first,
          or wins a lighthearted draw. Because everyone sees the same spinning wheel, the process
          feels transparent.
        </p>
      </GuideSection>
      <GuideSection title="How to pick a name">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Open the Spinner Wheel and load the Random name picker preset, or paste your own list.</li>
          <li>Keep one name per line. Empty lines are ignored; duplicates are skipped.</li>
          <li>Press SPIN and wait for the wheel to stop under the pointer.</li>
          <li>Optional: choose Remove &amp; continue so that person is not drawn again.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Tips for larger groups">
        <p>
          Very long labels can be hard to read on the wheel — prefer short first names or nicknames
          for display. For draw-without-replacement games, remove each winner until only one name
          remains (you need at least two entries to spin).
        </p>
      </GuideSection>
    </SeoGuideLayout>
  );
}
