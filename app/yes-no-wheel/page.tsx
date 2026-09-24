import type { Metadata } from "next";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

export const metadata: Metadata = {
  title: "Yes or No Wheel — Free Decision Spinner",
  description:
    "Stuck on yes or no? Spin a free Yes/No decision wheel for a quick answer. Or paste custom options like food and activities. No account needed on ExesTools.",
  alternates: { canonical: absoluteUrl("/yes-no-wheel") },
  openGraph: {
    title: "Yes or No Wheel — Free Decision Spinner | ExesTools",
    description:
      "Stuck on yes or no? Spin a free Yes/No decision wheel for a quick answer. Or paste custom options like food and activities. No account needed on ExesTools.",
    url: absoluteUrl("/yes-no-wheel"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools Spinner Wheel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yes or No Wheel — Free Decision Spinner | ExesTools",
    description:
      "Stuck on yes or no? Spin a free Yes/No decision wheel for a quick answer. Or paste custom options like food and activities. No account needed on ExesTools.",
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
    q: "Decision wheel?",
    a: "Binary here; open lists → Multi-option decision wheel on /.",
  },
];

export default async function YesNoWheelPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <UseCaseToolPage
      toolId="yes-no-wheel"
      breadcrumbLabel="Yes or No wheel"
      title="Yes or No decision wheel"
      intro="Opens on Yes / No. Hit SPIN, or switch to Yes / No / Maybe, the extra-Yes slice chip, or Quick decide. Long multi-option lists → homepage multi-option decision wheel (Related-tools)."
      faqs={FAQS}
      initialEncoded={typeof sp.c === "string" ? sp.c : null}
      initialPresetQuery={typeof sp.preset === "string" ? sp.preset : null}
    >
      <GuideSection title="How to use">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Stay on Yes/No or pick a chip.</li>
          <li>Press SPIN.</li>
          <li>Leave remove-winner off for normal binary repeats.</li>
          <li>Fresh wheel restores Yes/No. Share = this path + #w=.</li>
        </ol>
      </GuideSection>
    </UseCaseToolPage>
  );
}
