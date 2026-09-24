import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name} about the Spinner Wheel. Email ${siteConfig.contactEmail}.`,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: `Contact | ${siteConfig.name}`,
    url: absoluteUrl("/contact"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        Questions about the Spinner Wheel, privacy, or the site? Email us — we read every message
        when we can.
      </p>
      <p className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
        <a
          href={`mailto:${siteConfig.contactEmail}`}
          className="mt-1 inline-block text-lg font-bold text-accent hover:underline outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          {siteConfig.contactEmail}
        </a>
      </p>
      <p className="mt-6 text-sm text-muted">
        Or learn more on our{" "}
        <Link href="/about" className="font-semibold text-accent hover:underline">
          About
        </Link>{" "}
        page and try the{" "}
        <Link href="/" className="font-semibold text-accent hover:underline">
          Spinner Wheel
        </Link>
        .
      </p>
    </div>
  );
}
