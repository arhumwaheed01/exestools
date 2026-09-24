import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}. Review before publishing the Spinner Wheel site.`,
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 24, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          These Terms govern use of <strong className="text-foreground">{siteConfig.name}</strong> at{" "}
          {siteConfig.url}. They are a starter draft — have counsel review them before relying on
          them in production.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Use of the service</h2>
          <p className="mt-2">
            The Spinner Wheel and related pages are provided for personal and educational decision
            helpers. You are responsible for the content you enter and for how you use random
            results (including giveaways or classroom activities that may have separate rules).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">No warranty</h2>
          <p className="mt-2">
            Tools are provided &quot;as is&quot; without warranties of uninterrupted availability,
            fitness for a particular purpose, or perfect randomness for regulated drawings. Do not
            rely on the wheel alone where law or policy requires certified random selection.
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
          <h2 className="text-lg font-bold text-foreground">Questions</h2>
          <p className="mt-2">
            Questions about these terms can be noted on our{" "}
            <Link href="/about" className="font-semibold text-accent hover:underline">
              About
            </Link>{" "}
            page until a contact channel is published.
          </p>
        </section>
      </div>
    </div>
  );
}
