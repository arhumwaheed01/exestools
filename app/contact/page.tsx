import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/legal/ContactForm";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { contactPage } from "@/lib/content/legalPagesContent";
import { seoData, toMetadata } from "@/lib/content/seoData";
import { site } from "@/lib/site";

export const metadata: Metadata = toMetadata(seoData.contact);

export default function ContactPage() {
  const c = contactPage;

  return (
    <LegalPageLayout title={c.h1}>
      <div className="space-y-4">
        {c.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <p className="text-secondary-text/90">
        <span className="font-semibold text-secondary-text">{c.emailLabel}:</span>{" "}
        <a
          href={`mailto:${site.contactEmail}`}
          className="text-primary no-underline hover:underline"
        >
          {site.contactEmail}
        </a>
      </p>
      <ContactForm />
      <p className="text-sm text-secondary-text/75">
        For legal notices, see our{" "}
        <Link href="/privacy-policy" className="text-primary no-underline hover:underline">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms-of-service" className="text-primary no-underline hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
