import type { Metadata } from "next";
import { GuideSection, SeoGuideLayout } from "@/components/SeoGuideLayout";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Classroom Spinner Wheel",
  description:
    "Free classroom spinner wheel for fair turn-taking, cold-calling alternatives, and group activities. Paste student names and spin on ExesTools.",
  alternates: { canonical: absoluteUrl("/classroom-spinner") },
  openGraph: {
    title: "Classroom Spinner Wheel | ExesTools",
    description:
      "A free spinner wheel teachers can use for fair student selection and classroom games.",
    url: absoluteUrl("/classroom-spinner"),
  },
};

export default function ClassroomSpinnerPage() {
  return (
    <SeoGuideLayout
      title="Classroom spinner wheel"
      intro="Teachers and facilitators use spinner wheels for warm-ups, fair turn-taking, and low-stakes games — without calling on the same students every time."
      ctaLabel="Open classroom Spinner Wheel"
    >
      <GuideSection title="Classroom-friendly workflow">
        <p>
          Paste your roster (or a subset of volunteers) into the choices editor. Spin to select the
          next speaker. Use Remove &amp; continue so each student participates before anyone is
          selected twice.
        </p>
      </GuideSection>
      <GuideSection title="Ideas for activities">
        <ul className="list-disc space-y-2 pl-5">
          <li>Who answers the next review question</li>
          <li>Who shares a project update first</li>
          <li>Random partners or presentation order</li>
          <li>Prize or privilege draws for completed work</li>
        </ul>
      </GuideSection>
      <GuideSection title="Privacy note for schools">
        <p>
          By default, lists stay in the browser on that device. If you share a link, anyone with the
          URL can see the encoded names — avoid putting sensitive student data in shareable links
          unless your school policy allows it.
        </p>
      </GuideSection>
    </SeoGuideLayout>
  );
}
