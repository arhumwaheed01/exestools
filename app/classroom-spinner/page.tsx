import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Classroom Spinner Wheel — Random Student Picker";
const META =
  "Free classroom spinner & random student picker. Paste your roster, spin, optionally skip repeats. Lists stay in-browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/classroom-spinner") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/classroom-spinner"),
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
    q: "Free for teachers?",
    a: "Yes.",
  },
  {
    q: "Call on everyone once?",
    a: "Remove-winner on; re-paste when the list empties.",
  },
  {
    q: "Projector?",
    a: "Present the browser. Dedicated fullscreen is on the roadmap—not claimed as live yet.",
  },
  {
    q: "First vs last names?",
    a: "First names + initials usually enough.",
  },
  {
    q: "Student picker vs name picker?",
    a: "This page = class workflows; generic lists → Generic name picker.",
  },
  {
    q: "Uploaded to a server?",
    a: "Not when only spinning; device storage unless you share a URL.",
  },
];

export default async function ClassroomSpinnerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="classroom-spinner"
      breadcrumbLabel="Classroom spinner"
      title="Classroom spinner wheel"
      sectionHeading="Random student picker for fair turn-taking"
      intro="Opens with a sample class roster. Paste your students (one per line), project the page, hit SPIN. Remove-winner defaults on for fair turn-taking. No account."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How teachers use this">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Edit the sample roster or choose Classroom jobs, Brain break activities, Reading groups.</li>
          <li>Press SPIN.</li>
          <li>Keep remove-winner on / use Remove &amp; continue for one-pass fairness.</li>
          <li>Avoid Copy share link for full rosters unless policy allows. Fresh wheel restores classroom default.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Privacy for schools">
        <p>
          Share fragments expose names—follow school policy. See our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
