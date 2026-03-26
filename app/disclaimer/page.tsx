import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { disclaimerPage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.disclaimer);

export default function DisclaimerPage() {
  const d = disclaimerPage;

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
        />
      ))}
      <p className="text-sm text-secondary-text/80">
        Related:{" "}
        <Link href="/terms-of-service" className="font-semibold text-primary no-underline hover:underline">
          Terms of Service
        </Link>
        {" · "}
        <Link href="/contact" className="font-semibold text-primary no-underline hover:underline">
          Contact
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
