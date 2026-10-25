import Link from "next/link";
import type { ReactNode } from "react";
import PageMeta from "@/components/PageMeta";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RelatedTools } from "@/components/RelatedTools";
import { QueryHydratedSpinner } from "@/components/QueryHydratedMounts";
import { absoluteUrl } from "@/lib/seo";
import { webAppLd } from "@/lib/seo/jsonld";
import type { ToolId } from "@/lib/tools";

type FaqItem = { q: string; a: string };

/** Bracketed phrases in FAQ answers → internal links (visible FAQ only). */
const FAQ_LINK_HREFS: Record<string, string> = {
  "Privacy Policy": "/privacy-policy",
  "Random name picker": "/random-name-picker",
  "random team generator": "/random-team-generator",
  "Classroom spinner": "/classroom-spinner",
  "classroom spinner": "/classroom-spinner",
  "Terms of Service": "/terms",
  "Yes or no wheel": "/yes-no-wheel",
  "multi-option decision wheel": "/",
  "prize wheel": "/prize-wheel",
  "How ExesTools picks a result": "/about#how-it-works",
  "raffle generator": "/raffle-generator",
  "raffle generator with multiple entries": "/raffle-generator",
  "random number wheel": "/random-number-wheel",
  "Secret Santa generator": "/secret-santa-generator",
  "bingo card generator": "/bingo-card-generator",
};

function faqPlainText(answer: string): string {
  return answer.replace(/\[|\]/g, "");
}

function FaqAnswer({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]$/.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const label = m[1];
        const href = FAQ_LINK_HREFS[label];
        if (!href) return <span key={i}>{label}</span>;
        return (
          <Link key={i} href={href} className="font-semibold text-accent hover:underline">
            {label}
          </Link>
        );
      })}
    </>
  );
}

type Props = {
  toolId: Exclude<
    ToolId,
    | "home"
    | "random-team-generator"
    | "secret-santa-generator"
    | "raffle-generator"
    | "bingo-card-generator"
  >;
  title: string;
  intro: ReactNode;
  /** Optional H2 under intro (kw-map packs). */
  sectionHeading?: string;
  children: ReactNode;
  faqs: FaqItem[];
  breadcrumbLabel: string;
  schemaName: string;
  schemaDescription: string;
  schemaCategory?: string;
  schemaAlternateName?: string[];
  schemaFeatureList?: string[];
  /** ISO date shown in the byline under the H1. */
  pageUpdated?: string;
};

export function UseCaseToolPage({
  toolId,
  title,
  intro,
  sectionHeading,
  children,
  faqs,
  breadcrumbLabel,
  schemaName,
  schemaDescription,
  schemaCategory = "UtilitiesApplication",
  schemaAlternateName,
  schemaFeatureList,
  pageUpdated,
}: Props) {
  const path = `/${toolId}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: faqPlainText(item.a) },
    })),
  };

  const appLd = webAppLd({
    path,
    name: schemaName,
    description: schemaDescription,
    category: schemaCategory,
    alternateName: schemaAlternateName,
    featureList: schemaFeatureList,
  });

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: absoluteUrl(path) },
    ],
  };

  const wheelFirst =
    toolId === "random-name-picker" ||
    toolId === "prize-wheel" ||
    toolId === "classroom-spinner";

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-1 sm:px-6 sm:py-2">
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

      <nav className="mb-0.5 text-sm font-semibold leading-tight" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/"
              className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              Home
            </Link>
          </li>
          <li aria-hidden className="text-muted">
            →
          </li>
          <li className="text-foreground" aria-current="page">
            {breadcrumbLabel}
          </li>
        </ol>
      </nav>

      <header className={`max-w-3xl ${wheelFirst ? "mb-0.5" : "mb-3"}`}>
        <h1
          className={
            wheelFirst
              ? "text-base font-extrabold leading-tight tracking-tight text-foreground sm:text-lg xl:text-xl"
              : "text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl"
          }
        >
          {title}
        </h1>
        {pageUpdated ? (
          <div className={wheelFirst ? "hidden xl:block" : undefined}>
            <PageMeta updated={pageUpdated} />
          </div>
        ) : null}
        <p
          className={
            wheelFirst
              ? "mt-0.5 line-clamp-2 text-sm leading-snug text-muted xl:line-clamp-none"
              : "mt-1 line-clamp-2 text-sm leading-snug text-muted sm:line-clamp-none sm:leading-relaxed"
          }
        >
          {intro}
        </p>
        {sectionHeading ? (
          <h2 className="mt-3 text-base font-bold tracking-tight text-foreground sm:text-lg">
            {sectionHeading}
          </h2>
        ) : null}
      </header>

      <QueryHydratedSpinner toolId={toolId} />

      <div className="mt-12 space-y-10 border-t border-border pt-10">
        <div className="max-w-3xl space-y-8 text-sm leading-relaxed text-muted sm:text-base">
          {children}
        </div>

        <RelatedLinks toolId={toolId} />

        <section id="faq" className="max-w-3xl scroll-mt-24" aria-labelledby="usecase-faq">
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
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <FaqAnswer text={item.a} />
                </p>
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
