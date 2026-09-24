import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}. Review how the Spinner Wheel handles local data and cookies.`,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
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
          This Privacy Policy describes how <strong className="text-foreground">{siteConfig.name}</strong>{" "}
          ({siteConfig.url}) handles information when you use our Spinner Wheel and related pages.
          Review and customize this page before launch to match your actual practices.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Information we process</h2>
          <p className="mt-2">
            Wheel choices, presets, and preferences are stored in your browser&apos;s local storage
            so your session can resume. Shared wheel links may encode choices in the URL. We do not
            require an account to use the Spinner Wheel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Advertising</h2>
          <p className="mt-2">
            The site includes reserved advertising placeholder areas. If Google AdSense or another
            ad network is enabled later, that provider may use cookies or similar technologies
            according to their policies. No ad scripts are embedded until you configure them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Analytics and logs</h2>
          <p className="mt-2">
            Hosting providers may collect standard server logs (IP address, user agent, request
            path). If you add analytics, disclose the provider and data collected here.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Questions</h2>
          <p className="mt-2">
            For privacy-related questions, see this policy and our{" "}
            <Link href="/about" className="font-semibold text-accent hover:underline">
              About
            </Link>{" "}
            page. Update this policy when your data practices change.
          </p>
        </section>
      </div>
    </div>
  );
}
