import Link from "next/link";
import type { ReactNode } from "react";

/** Article chrome for legal pages. Outer shell + sidebar: `LegalLayout` in `app/(legal)/layout.tsx`. */
export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-input-border/80 bg-background px-6 py-8 shadow-[0_16px_48px_-32px_rgba(51,62,72,0.22)] ring-1 ring-slate-900/[0.04] md:px-9 md:py-10 lg:px-10 lg:py-11">
      <nav
        className="mb-7 text-sm font-medium text-secondary-text/80"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="font-semibold text-primary no-underline hover:underline"
        >
          Home
        </Link>
      </nav>
      <h1 className="!mt-0 text-3xl font-bold tracking-tight text-secondary-text md:text-4xl md:font-extrabold lg:text-[2.65rem] lg:leading-[1.1]">
        {title}
      </h1>
      {lastUpdated ? (
        <p className="mt-3 text-sm font-medium text-secondary-text/65">
          Last updated: {lastUpdated}
        </p>
      ) : null}
      <div className="mt-9 space-y-10 text-base leading-[1.75] text-secondary-text md:mt-10 md:text-[1.0625rem] md:leading-[1.72]">
        {children}
      </div>
    </div>
  );
}

export type LegalSubsection = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

export type LegalSectionProps = {
  id?: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  subsections?: readonly LegalSubsection[];
};

export function LegalSection({
  id,
  title,
  paragraphs,
  bullets,
  subsections,
}: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="!mt-0 text-xl font-semibold tracking-tight text-secondary-text md:text-2xl lg:text-[1.4rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {bullets && bullets.length > 0 ? (
          <ul className="list-disc space-y-2 pl-6 marker:text-primary/80">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : null}
        {subsections && subsections.length > 0 ? (
          <div className="space-y-6 pt-2">
            {subsections.map((sub) => (
              <div key={sub.title}>
                <h3 className="!mt-0 text-lg font-semibold tracking-tight text-secondary-text md:text-xl">
                  {sub.title}
                </h3>
                <div className="mt-3 space-y-3">
                  {sub.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {sub.bullets && sub.bullets.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-6 marker:text-primary/80">
                      {sub.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
