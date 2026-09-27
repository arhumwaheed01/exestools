import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ExesTools to report a bug, suggest a tool, or ask about privacy or copyright. Email hello@exestools.com.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    description:
      "Contact ExesTools to report a bug, suggest a tool, or ask about privacy or copyright. Email hello@exestools.com.",
    url: absoluteUrl("/contact"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${siteConfig.name}`,
    description:
      "Contact ExesTools to report a bug, suggest a tool, or ask about privacy or copyright. Email hello@exestools.com.",
    images: [siteConfig.ogImagePath],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        Questions about ExesTools, a bug to report, or an idea for a new tool? Email{" "}
        <a
          href="mailto:hello@exestools.com?subject=ExesTools%20question"
          className="font-semibold text-accent hover:underline"
        >
          hello@exestools.com
        </a>
        . Arhum Waheed, who builds and runs ExesTools, reads every message and usually replies
        within 2 business days.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">What to write about</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
          <li>
            Something not working: tell us the page link, your browser and device, and what you
            expected to happen. A screenshot helps.{" "}
            <a
              href="mailto:hello@exestools.com?subject=Bug%20report"
              className="font-semibold text-accent hover:underline"
            >
              Email a bug report
            </a>
            .
          </li>
          <li>
            Ideas and feature requests: describe what you&apos;re trying to do. It helps us build the
            right thing.
          </li>
          <li>
            Privacy questions or requests: read our{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            , then email us with &quot;Privacy&quot; in the subject line.
          </li>
          <li>
            Copyright notices: follow the steps on our{" "}
            <Link href="/dmca" className="font-semibold text-accent hover:underline">
              DMCA page
            </Link>
            .
          </li>
          <li>Press, partnerships and school use: say who you are and what you need.</li>
        </ul>
      </section>

      <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
        You don&apos;t need to send us your lists. A short example is enough to reproduce a problem.
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
