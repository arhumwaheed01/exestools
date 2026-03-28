import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ToolsDirectoryCard } from "@/components/tools/ToolsDirectoryCard";
import { pdfCategorySeoArticle } from "@/lib/content/categoryPagesContent";
import { pdfToolsGrid, pdfToolsPageContent } from "@/lib/content/homepageData";
import { seoData, toMetadata } from "@/lib/content/seoData";

export const metadata: Metadata = toMetadata(seoData.pdfTools);

export default function PdfToolsPage() {
  const c = pdfToolsPageContent;

  return (
    <section className="bg-surface pt-4 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <Container>
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-secondary-text/85"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="font-medium no-underline hover:text-primary">
            Home
          </Link>
          <span className="text-secondary-text/50">/</span>
          <Link href="/tools" className="font-medium no-underline hover:text-primary">
            All Tools
          </Link>
          <span className="text-secondary-text/50">/</span>
          <span className="text-secondary-text">PDF tools</span>
        </nav>

        <h1 className="!mt-0 text-3xl font-bold md:text-4xl">{c.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-secondary-text">
          {c.intro}
        </p>

        <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold">
          <Link
            href="/text-tools"
            className="rounded-lg border border-input-border bg-background px-4 py-2 no-underline hover:border-primary/40 hover:text-primary"
          >
            Text tools
          </Link>
          <Link
            href="/developer-tools"
            className="rounded-lg border border-input-border bg-background px-4 py-2 no-underline hover:border-primary/40 hover:text-primary"
          >
            Developer tools
          </Link>
          <Link
            href="/image-tools"
            className="rounded-lg border border-input-border bg-background px-4 py-2 no-underline hover:border-primary/40 hover:text-primary"
          >
            Image tools
          </Link>
          <Link
            href="/tools"
            className="rounded-lg border border-input-border bg-background px-4 py-2 no-underline hover:border-primary/40 hover:text-primary"
          >
            All tools directory
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pdfToolsGrid.map((tool) => (
            <li key={tool.slug}>
              <ToolsDirectoryCard tool={tool} />
            </li>
          ))}
        </ul>

        <article className="mx-auto mt-16 max-w-3xl border-t border-input-border pt-12 md:mt-20 md:pt-16">
          <h2 className="!mt-0 text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
            {pdfCategorySeoArticle.heading}
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-secondary-text">
            {pdfCategorySeoArticle.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </Container>
    </section>
  );
}
