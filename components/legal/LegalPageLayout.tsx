import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/Container";

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
    <section className="bg-surface pb-14 pt-6 md:pb-20 md:pt-10">
      <Container className="max-w-[52rem]">
        <nav
          className="mb-8 text-sm text-secondary-text/80"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="font-medium text-primary no-underline hover:underline"
          >
            Home
          </Link>
        </nav>
        <h1 className="!mt-0 text-3xl font-bold tracking-tight text-secondary-text md:text-4xl">
          {title}
        </h1>
        {lastUpdated ? (
          <p className="mt-2 text-sm text-secondary-text/70">
            Last updated: {lastUpdated}
          </p>
        ) : null}
        <div className="mt-10 space-y-10 text-base leading-relaxed text-secondary-text">
          {children}
        </div>
      </Container>
    </section>
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
      <h2 className="!mt-0 text-xl font-semibold tracking-tight text-secondary-text md:text-2xl">
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
