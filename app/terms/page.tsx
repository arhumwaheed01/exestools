import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const TERMS_META =
  "Terms of Service for ExesTools free online tools: fair use, share links, giveaway and raffle responsibility, no warranty and advertising.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: TERMS_META,
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: {
    type: "website",
    siteName: "ExesTools",
    locale: "en_US",
    title: `Terms of Service | ${siteConfig.name}`,
    description: TERMS_META,
    url: absoluteUrl("/terms"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Terms of Service | ${siteConfig.name}`,
    description: TERMS_META,
    images: [siteConfig.ogImagePath],
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 12, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          These Terms govern your use of <strong className="text-foreground">{siteConfig.name}</strong>{" "}
          at {siteConfig.url} (the spinner wheel, team generator, Secret Santa, raffle, bingo, and
          related pages). By using the site, you agree to these Terms.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Use of the service</h2>
          <p className="mt-2">
            ExesTools provides free browser-based random pickers and helpers for personal, educational,
            and everyday use. You are responsible for the text you enter and for how you use results,
            including in classrooms, parties, or promotions that may have their own rules.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">User content</h2>
          <p className="mt-2">
            Names, options, ticket lists, and other text you type are your content. You must have the
            right to use that content and it must not violate anyone else&apos;s rights or applicable
            law. Do not enter sensitive personal data you would not want visible to someone with your
            share link. ExesTools does not claim ownership of your lists; most processing happens in
            your browser as described in the{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Share links</h2>
          <p className="mt-2">
            A share link contains the list you entered. Anyone who has the link can see that list, so
            don&apos;t put sensitive personal information in a shared wheel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Giveaways, raffles and contests</h2>
          <p className="mt-2">
            You&apos;re responsible for the rules, prizes and any legal requirements of draws you run
            with ExesTools. ExesTools isn&apos;t a certified drawing service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Intellectual property</h2>
          <p className="mt-2">
            The ExesTools site, branding, and original tool design are owned by ExesTools and
            protected by copyright and other laws. You may use the tools for their intended purpose.
            You may not scrape, reverse engineer, or republish the site as your own product without
            permission. For copyright complaints about material on the site, see our{" "}
            <Link href="/dmca" className="font-semibold text-accent hover:underline">
              DMCA page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">No warranty</h2>
          <p className="mt-2">
            Tools are provided &quot;as is&quot; without warranties of uninterrupted availability,
            fitness for a particular purpose, or suitability for regulated drawings. Random results
            come from your browser&apos;s built-in generator as described on{" "}
            <Link href="/about#how-it-works" className="font-semibold text-accent hover:underline">
              About ExesTools
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Limitation of liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, {siteConfig.name} is not liable for indirect or
            consequential damages arising from use of the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Advertising</h2>
          <p className="mt-2">
            ExesTools is free to use and is supported by ads. Ads are provided by third parties,
            including Google. We don&apos;t control the content of individual ads, and if you visit
            an advertiser&apos;s site, that site&apos;s own terms and privacy policy apply.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Changes</h2>
          <p className="mt-2">
            We may update these terms. The date at the top shows the latest version.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Questions</h2>
          <p className="mt-2">
            Questions about these terms: email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            or visit{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
