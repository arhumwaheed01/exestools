import type { Metadata } from "next";
import Link from "next/link";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const TITLE = "Yes or No Wheel — Free Decision Spinner";
const META =
  "Stuck on yes or no? Spin a free yes or no wheel for a quick answer. Optional Maybe chip. Free, no account, on ExesTools.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: `${TITLE} | ExesTools`,
    description: META,
    url: absoluteUrl("/yes-no-wheel"),
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
    q: "Random?",
    a: "Fair segment target each spin; streaks are normal.",
  },
  {
    q: "Add Maybe?",
    a: "Use Yes / No / Maybe chip.",
  },
  {
    q: "Double-Yes chip?",
    a: "Visual extra Yes slice only (phase 1).",
  },
  {
    q: "Decision with many options?",
    a: "Use the Multi-option decision wheel on the homepage — this page is for yes vs no.",
  },
];

export default async function YesNoWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="yes-no-wheel"
      breadcrumbLabel="Yes or no wheel"
      title="Yes or no wheel"
      intro="Opens on Yes / No. Hit SPIN, or switch to Yes / No / Maybe or the extra-Yes slice chip. For lists with many options, use the homepage Multi-option decision wheel."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to spin Yes or No">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Stay on Yes/No or pick a chip.</li>
          <li>Press SPIN.</li>
          <li>Leave remove-winner off for normal binary repeats.</li>
          <li>Fresh wheel restores Yes/No. Share = this path + #w=.</li>
        </ol>
      </GuideSection>
      <GuideSection title="Beyond Yes/No">
        <p>
          Need to choose among food, activities, or other open lists? Go to the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            Multi-option decision wheel
          </Link>{" "}
          on the homepage.
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
