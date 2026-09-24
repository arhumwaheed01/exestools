import Link from "next/link";
import type { ReactNode } from "react";
import { RelatedTools } from "@/components/RelatedTools";
import { SpinnerMount } from "@/components/SpinnerMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import type { ToolId } from "@/lib/tools";

type FaqItem = { q: string; a: string };

type Props = {
  toolId: Exclude<ToolId, "home">;
  title: string;
  intro: string;
  /** Optional H2 under intro (kw-map packs). */
  sectionHeading?: string;
  children: ReactNode;
  faqs: FaqItem[];
  breadcrumbLabel: string;
  initialEncoded?: string | null;
  initialPresetQuery?: string | null;
};

export function UseCaseToolPage({
  toolId,
  title,
  intro,
  sectionHeading,
  children,
  faqs,
  breadcrumbLabel,
  initialEncoded = null,
  initialPresetQuery = null,
}: Props) {
  const path = `/${toolId}`;
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

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: absoluteUrl(path) },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />

      <nav className="mb-2 text-xs font-semibold text-muted" aria-label="Breadcrumb">
        <Link href="/" className="text-accent hover:underline">
          Home
        </Link>
        <span className="mx-1.5">→</span>
        <span className="text-foreground">{breadcrumbLabel}</span>
      </nav>

      <header className="mb-3 max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted sm:line-clamp-none sm:leading-relaxed">
          {intro}
        </p>
        {sectionHeading ? (
          <h2 className="mt-3 text-base font-bold tracking-tight text-foreground sm:text-lg">
            {sectionHeading}
          </h2>
        ) : null}
      </header>

      <SpinnerMount
        toolId={toolId}
        initialEncoded={initialEncoded}
        initialPresetQuery={initialPresetQuery}
      />

      <div className="mt-12 space-y-10 border-t border-border pt-10">
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

        <RelatedTools toolId={toolId} />
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
