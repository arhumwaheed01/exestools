import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles Spinner Wheel data, local storage, share links, and hosting logs.`,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  openGraph: {
    title: `Privacy Policy | ${siteConfig.name}`,
    description: `How ${siteConfig.name} handles Spinner Wheel data, local storage, share links, and hosting logs.`,
    url: absoluteUrl("/privacy-policy"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${siteConfig.name}`,
    description: `How ${siteConfig.name} handles Spinner Wheel data, local storage, share links, and hosting logs.`,
    images: [siteConfig.ogImagePath],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 24, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          This Privacy Policy explains how <strong className="text-foreground">{siteConfig.name}</strong>{" "}
          ({siteConfig.url}) handles information when you use the Spinner Wheel and related pages.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Who we are</h2>
          <p className="mt-2">
            ExesTools operates a free browser-based spinner wheel at {siteConfig.url}. For privacy
            questions, email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Information stored in your browser</h2>
          <p className="mt-2">
            Wheel choices and preferences (such as sound on/off) are saved in your browser&apos;s
            local storage so your session can resume. We do not require an account. Cleared browser
            data removes these items.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Share links</h2>
          <p className="mt-2">
            If you copy a share link, your choices are packed into the page fragment after{" "}
            <code className="text-foreground">#w=</code> (not sent to our servers as a query). Anyone
            with that link can see the list. Do not put sensitive personal data in shareable URLs.
            Older links that used <code className="text-foreground">?c=</code> still open for
            compatibility.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Hosting and logs</h2>
          <p className="mt-2">
            Our hosting provider (for example Vercel) may collect standard server logs such as IP
            address, user agent, and request path for security and reliability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Analytics (Google Analytics 4)</h2>
          <p className="mt-2">
            We use Google Analytics 4 (measurement ID{" "}
            <code className="text-foreground">G-DJKH68VDEJ</code>) to understand aggregate traffic
            and product usage (for example page views and events like spin, share, and preset load).
            We do not send your wheel choice text or names to Analytics.
          </p>
          <p className="mt-2">
            Google Consent Mode v2 is enabled. For visitors in the European Economic Area, the United
            Kingdom, and Switzerland, analytics and advertising storage default to denied unless a
            future consent choice updates that state. Outside those regions, analytics storage is
            granted by default so we can measure site usage; advertising storage remains denied
            because we do not run personalized ads today. Google may process measurement data under
            its own terms — see{" "}
            <a
              href="https://policies.google.com/privacy"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Advertising</h2>
          <p className="mt-2">
            We do not currently display third-party ads or AdSense scripts. If we enable advertising
            later, we will update this policy and the provider may use cookies according to their
            own policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Children</h2>
          <p className="mt-2">
            The Spinner Wheel is a general-purpose tool. Teachers and parents should follow their
            own policies when using class lists. We do not knowingly collect personal information
            from children through accounts, because we do not offer accounts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <p className="mt-2">
            Privacy questions:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            or our{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact
            </Link>{" "}
            page. See also{" "}
            <Link href="/dmca" className="font-semibold text-accent hover:underline">
              DMCA
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
