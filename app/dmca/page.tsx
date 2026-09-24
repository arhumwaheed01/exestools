import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "DMCA / Copyright",
  description: `Copyright and DMCA notice policy for ${siteConfig.name}.`,
  alternates: { canonical: absoluteUrl("/dmca") },
  openGraph: {
    title: `DMCA / Copyright | ${siteConfig.name}`,
    description: `Copyright and DMCA notice policy for ${siteConfig.name}.`,
    url: absoluteUrl("/dmca"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `DMCA / Copyright | ${siteConfig.name}`,
    description: `Copyright and DMCA notice policy for ${siteConfig.name}.`,
    images: [siteConfig.ogImagePath],
  },
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        DMCA / Copyright
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 24, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          {siteConfig.name} respects intellectual property rights. The Spinner Wheel is our original
          product. User-entered choices remain the responsibility of the person who entered them.
        </p>
        <section>
          <h2 className="text-lg font-bold text-foreground">Copyright complaints</h2>
          <p className="mt-2">
            If you believe content on this site infringes your copyright, send a notice to{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            with: (1) your contact details, (2) a description of the work, (3) the URL of the
            material, and (4) a statement that you have a good-faith belief the use is unauthorized.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">Counter-notice</h2>
          <p className="mt-2">
            If material was removed and you believe that was a mistake, you may send a
            counter-notice to the same email with enough detail for us to restore or discuss the
            content.
          </p>
        </section>
        <p>
          See also our{" "}
          <Link href="/terms" className="font-semibold text-accent hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
