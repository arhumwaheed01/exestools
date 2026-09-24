import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${siteConfig.name} — free Spinner Wheel by Arhum Waheed. Privacy-friendly random selection tools for names, classrooms, and decisions.`,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: `About ${siteConfig.name}`,
    description: `About ${siteConfig.name} — free Spinner Wheel by Arhum Waheed. Privacy-friendly random selection tools for names, classrooms, and decisions.`,
    url: absoluteUrl("/about"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `About ${siteConfig.name}`,
    description: `About ${siteConfig.name} — free Spinner Wheel by Arhum Waheed. Privacy-friendly random selection tools for names, classrooms, and decisions.`,
    images: [siteConfig.ogImagePath],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">About Us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          <strong className="text-foreground">{siteConfig.name}</strong> builds a free online Spinner
          Wheel for fair random selection — names, prizes, Yes/No decisions, classrooms, and
          everyday picks — without accounts or installs.
        </p>
        <p>
          The product is operated by <strong className="text-foreground">Arhum Waheed</strong>. We
          focus on clear UX: you provide choices, the wheel spins, and the winner matches the
          segment under the pointer.
        </p>
        <p>
          Choices stay in your browser unless you share a link. We are not affiliated with the
          reverse-engineering forum often found when searching similar brand names.
        </p>
        <p>
          Contact:{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-semibold text-accent hover:underline"
          >
            {siteConfig.contactEmail}
          </a>{" "}
          ·{" "}
          <Link href="/contact" className="font-semibold text-accent hover:underline">
            Contact page
          </Link>
        </p>
        <section>
          <h2 className="text-lg font-bold text-foreground">For teachers</h2>
          <p className="mt-2">
            Use the{" "}
            <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
              Classroom spinner
            </Link>{" "}
            to pick students fairly with no account — your class list stays in this browser, you can
            share a link when policy allows, and Remove winner helps everyone get a turn before
            repeats. Fullscreen/projector mode and CSV import are on the roadmap; this page only
            claims features that are live today.
          </p>
        </section>
        <p>
          Try the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            Spinner Wheel
          </Link>
          , or open{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom
          </Link>
          ,{" "}
          <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
            Yes/No
          </Link>
          ,{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            name picker
          </Link>
          , and{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize
          </Link>{" "}
          tools.
        </p>
      </div>
    </div>
  );
}
