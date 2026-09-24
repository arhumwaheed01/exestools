import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${siteConfig.name} — free Spinner Wheel by Arhum Waheed. Privacy-friendly random name picker and decision tools.`,
  alternates: { canonical: absoluteUrl("/about") },
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
