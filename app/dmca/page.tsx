import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalSection,
  type LegalSectionProps,
} from "@/components/legal/LegalPageLayout";
import { dmcaPage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.dmca);

export default function DmcaPage() {
  const d = dmcaPage;

  return (
    <LegalPageLayout title={d.h1} lastUpdated={d.lastUpdated}>
      <div className="space-y-4">
        {d.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {d.sections.map((s) => (
        <LegalSection
          key={s.id}
          id={s.id}
          title={s.title}
          paragraphs={s.paragraphs}
          subsections={
            "subsections" in s
              ? (s as { subsections: LegalSectionProps["subsections"] })
                  .subsections
              : undefined
          }
        />
      ))}
      <p className="text-sm text-secondary-text/80">
        Contact us via the{" "}
        <Link href="/contact" className="font-semibold text-primary no-underline hover:underline">
          Contact
        </Link>{" "}
        page for DMCA notices and general questions.
      </p>
    </LegalPageLayout>
  );
}
