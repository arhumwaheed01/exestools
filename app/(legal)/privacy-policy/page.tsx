import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { privacyPolicyPage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.privacyPolicy);

export default function PrivacyPolicyPage() {
  const p = privacyPolicyPage;

  return (
    <LegalPageLayout title={p.h1} lastUpdated={p.lastUpdated}>
      <div className="space-y-4">
        {p.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {p.sections.map((s) => (
        <LegalSection
          key={s.id}
          id={s.id}
          title={s.title}
          paragraphs={s.paragraphs}
          bullets={"bullets" in s ? s.bullets : undefined}
        />
      ))}
      <p className="text-sm text-secondary-text/80">
        For privacy questions, visit our{" "}
        <Link href="/contact" className="font-semibold text-primary no-underline hover:underline">
          Contact
        </Link>{" "}
        page.
      </p>
    </LegalPageLayout>
  );
}
