import Link from "next/link";
import type { ReactNode } from "react";
import { SpinnerWheel } from "@/components/SpinnerWheel";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const SIBLINGS = [
  { href: "/random-name-picker", label: "Random name picker" },
  { href: "/classroom-spinner", label: "Classroom spinner" },
  { href: "/prize-wheel", label: "Prize wheel" },
  { href: "/yes-no-wheel", label: "Yes / No wheel" },
] as const;

type FaqItem = { q: string; a: string };

type Props = {
  title: string;
  intro: string;
  presetId: string;
  children: ReactNode;
  faqs: FaqItem[];
  /** Current path for sibling highlighting */
  path: string;
};

export function UseCaseToolPage({ title, intro, presetId, children, faqs, path }: Props) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${title} | ${siteConfig.name}`,
    url: absoluteUrl(path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: intro,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          <Link href="/" className="hover:underline">
            Spinner Wheel
          </Link>
          <span className="mx-1.5 text-muted">/</span>
          Tool
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
      </header>

      <SpinnerWheel presetId={presetId} />

      <div className="mt-14 space-y-10 border-t border-border pt-12">
        <div className="max-w-3xl space-y-8 text-sm leading-relaxed text-muted sm:text-base">
          {children}
        </div>

        <section className="max-w-3xl" aria-labelledby="usecase-faq">
          <h2 id="usecase-faq" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface px-4 py-3 open:border-accent/40"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-muted transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <nav className="max-w-3xl" aria-label="Related tools">
          <h2 className="text-lg font-bold text-foreground">Related tools</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            <li>
              <Link
                href="/"
                className="inline-flex rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:border-accent"
              >
                Main Spinner Wheel
              </Link>
            </li>
            {SIBLINGS.filter((s) => s.href !== path).map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:border-accent"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
