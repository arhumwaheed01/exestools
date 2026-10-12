import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const CONTACT_TITLE = "Contact ExesTools — Bugs, Ideas and Privacy Questions";
const CONTACT_META =
  "Email hello@exestools.com to report a bug, suggest a new free tool, or ask about privacy, copyright or advertising on ExesTools.";

export const metadata: Metadata = {
  title: { absolute: CONTACT_TITLE },
  description: CONTACT_META,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_META,
    url: absoluteUrl("/contact"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_TITLE,
    description: CONTACT_META,
    images: [siteConfig.ogImagePath],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Contact</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 12, 2026</p>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        ExesTools is built and run by Arhum Waheed. Questions about the spinner wheel, other tools,
        privacy, or copyright? Email{" "}
        <a
          href="mailto:hello@exestools.com?subject=ExesTools%20question"
          className="font-semibold text-accent hover:underline"
        >
          hello@exestools.com
        </a>
        . Messages are read directly and we aim to reply within two business days.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">What to write about</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
          <li>
            <span className="font-semibold text-foreground">Something not working.</span> Send the
            page URL, your browser and device, and what you expected. A screenshot helps. You do not
            need to paste your real roster or guest list—a short example is enough.{" "}
            <a
              href="mailto:hello@exestools.com?subject=Bug%20report"
              className="font-semibold text-accent hover:underline"
            >
              Email a bug report
            </a>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Ideas and feature requests.</span>{" "}
            Describe the job you&apos;re trying to do (classroom, giveaway, party, office). That
            context helps us prioritize.
          </li>
          <li>
            <span className="font-semibold text-foreground">Privacy.</span> Read the{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            , then email with &quot;Privacy&quot; in the subject line for access or deletion
            questions about data we hold (such as analytics or ads).
          </li>
          <li>
            <span className="font-semibold text-foreground">Copyright.</span> Follow the checklist on
            our{" "}
            <Link href="/dmca" className="font-semibold text-accent hover:underline">
              DMCA page
            </Link>{" "}
            so we can review your notice quickly.
          </li>
          <li>
            <span className="font-semibold text-foreground">Press, partnerships, and schools.</span>{" "}
            Say who you are, how you use ExesTools, and what you need.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
        ExesTools runs in your browser. Lists and draws stay on your device unless you use a share
        link—please don&apos;t email us full student or employee rosters.
      </p>

      <p className="mt-6 text-sm text-muted">
        Want to know more first? Read{" "}
        <Link href="/about" className="font-semibold text-accent hover:underline">
          About ExesTools
        </Link>{" "}
        or go back to the{" "}
        <Link href="/" className="font-semibold text-accent hover:underline">
          spinner wheel
        </Link>
        .
      </p>
    </div>
  );
}
