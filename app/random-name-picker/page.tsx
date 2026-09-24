import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Random Name Picker Wheel (Free Online)";
const META =
  "Paste names and spin a free random name picker wheel. Fair picks for meetings, parties, and lists. Remove-winner option. No signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/random-name-picker"),
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
    q: "Long lists?",
    a: "Yes; one name per line. Prefer short display names.",
  },
  {
    q: "No repeats?",
    a: "Keep remove-winner on, or Remove & continue.",
  },
  {
    q: "Duplicates?",
    a: "Case-insensitive dupes skipped; add an initial if needed.",
  },
  {
    q: "Does Shuffle change odds?",
    a: "No.",
  },
  {
    q: "Class roster?",
    a: "Use Classroom / student spinner (Related-tools).",
  },
];

export default async function RandomNamePickerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="random-name-picker"
      breadcrumbLabel="Random name picker"
      title="Random name picker wheel"
      intro="This page loads a sample name list—edit freely (one name per line) and hit SPIN. Built for meetings, parties, and who-goes-first. Remove winner after spin defaults on so repeats stay off until you reset. No signup."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to pick a name">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Use the loaded Sample names preset, or paste your list (one per line). Optional chips: Meeting order, Party / icebreakers.</li>
          <li>Press SPIN.</li>
          <li>Modal: Remove &amp; continue, Spin again, or Close.</li>
          <li>Copy share link → this path + #w=. Fresh wheel → page default sample names.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Tips">
        <p>Short display names read better on the wheel. Add an initial if two people share a name.</p>
      </GuideSection>
      <GuideSection title="Privacy">
        <p>
          Lists save under this tool in your browser. Don’t put sensitive names in share URLs.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
