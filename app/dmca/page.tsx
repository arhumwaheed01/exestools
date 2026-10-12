import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const DMCA_META =
  "How to send ExesTools a copyright (DMCA) notice or counter-notice, what to include, and where to email it.";

export const metadata: Metadata = {
  title: "DMCA / Copyright",
  description: DMCA_META,
  alternates: { canonical: absoluteUrl("/dmca") },
  openGraph: {
    type: "website",
    siteName: "ExesTools",
    locale: "en_US",
    title: `DMCA / Copyright | ${siteConfig.name}`,
    description: DMCA_META,
    url: absoluteUrl("/dmca"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `DMCA / Copyright | ${siteConfig.name}`,
    description: DMCA_META,
    images: [siteConfig.ogImagePath],
  },
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        DMCA / Copyright
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 12, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          {siteConfig.name} respects intellectual property rights. The site design, code, and
          branding are our original work. Text that users type into the tools (names, lists, bingo
          words) remains the responsibility of the person who entered it.
        </p>
        <section>
          <h2 className="text-lg font-bold text-foreground">Copyright complaints</h2>
          <p className="mt-2">
            If you believe content on {siteConfig.url} infringes your copyright, send a notice to{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}?subject=DMCA%20notice`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            with the subject line &quot;DMCA notice&quot;. Incomplete notices may delay a response.
          </p>
          <p className="mt-3 font-semibold text-foreground">Your notice should include:</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Your physical or electronic signature (typing your full legal name at the end of the
              email is enough).
            </li>
            <li>
              Identification of the copyrighted work you believe has been infringed (title, URL, or
              description).
            </li>
            <li>
              Identification of the material on ExesTools you want removed or disabled, with the
              specific URL(s) where it appears.
            </li>
            <li>
              Your contact information: name, mailing address, telephone number, and email address.
            </li>
            <li>
              A statement that you have a good-faith belief that use of the material is not authorized
              by the copyright owner, its agent, or the law.
            </li>
            <li>
              A statement, under penalty of perjury, that the information in your notice is accurate
              and that you are the copyright owner or authorized to act on the owner&apos;s behalf.
            </li>
          </ol>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">Counter-notice</h2>
          <p className="mt-2">
            If material was removed or disabled and you believe that was a mistake or misidentification,
            you may send a counter-notice to the same email with enough detail for us to review: your
            signature, identification of the material, a statement under penalty of perjury that you
            have a good-faith belief the material was removed by mistake, and your consent to the
            jurisdiction of the federal district court for your address (or, if outside the U.S., any
            judicial district where ExesTools may be found).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-foreground">Repeat infringers</h2>
          <p className="mt-2">
            Where appropriate, we may limit access for users who repeatedly infringe copyright after
            valid notices.
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
          . General questions (not legal notices) can go through{" "}
          <Link href="/contact" className="font-semibold text-accent hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
