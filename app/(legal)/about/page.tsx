import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { aboutPage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.about);

export default function AboutPage() {
  const a = aboutPage;

  return (
    <LegalPageLayout title={a.h1}>
      {a.sections.map((s) => (
        <section key={s.title} className="scroll-mt-24">
          <h2 className="!mt-0 text-xl font-semibold tracking-tight text-secondary-text md:text-2xl lg:text-[1.4rem]">
            {s.title}
          </h2>
          <div className="mt-4 space-y-4">
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      ))}
      <p className="text-base">
        <Link href="/tools" className="font-semibold text-primary no-underline hover:underline">
          Browse all tools
        </Link>{" "}
        or read our{" "}
        <Link href="/contact" className="font-semibold text-primary no-underline hover:underline">
          Contact
        </Link>{" "}
        page if you would like to reach us.
      </p>
    </LegalPageLayout>
  );
}
