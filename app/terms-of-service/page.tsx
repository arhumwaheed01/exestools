import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { termsOfServicePage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.termsOfService);

export default function TermsOfServicePage() {
  const t = termsOfServicePage;

  return (
    <LegalPageLayout title={t.h1} lastUpdated={t.lastUpdated}>
      <div className="space-y-4">
        {t.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {t.sections.map((s) => (
        <LegalSection
          key={s.id}
          id={s.id}
          title={s.title}
          paragraphs={s.paragraphs}
          bullets={"bullets" in s ? s.bullets : undefined}
        />
      ))}
    </LegalPageLayout>
  );
}
