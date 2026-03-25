import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ToolsDirectoryCard } from "@/components/tools/ToolsDirectoryCard";
import { ToolsMoreCategories } from "@/components/tools/ToolsMoreCategories";
import { allToolsPageContent, developerToolsGrid, imageToolsGrid } from "@/lib/content/homepageData";
import { seoData, toMetadata } from "@/lib/content/seoData";
import { textTools } from "@/lib/content/textToolsData";

export const metadata: Metadata = toMetadata(seoData.allTools);

export default function AllToolsPage() {
  const c = allToolsPageContent;

  return (
    <section className="bg-surface pt-4 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center md:max-w-3xl">
          <h1 className="!mt-0 text-3xl font-bold tracking-tight text-secondary-text md:text-4xl">
            {c.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-secondary-text/95">
            {c.intro}
          </p>
        </div>

        <div className="mt-12 md:mt-14">
          <h2 className="!mt-0 text-center text-xl font-semibold tracking-tight text-secondary-text md:text-2xl">
            {c.textToolsHeading}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {textTools.map((tool) => (
              <li key={tool.slug}>
                <ToolsDirectoryCard tool={tool} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="!mt-0 text-center text-xl font-semibold tracking-tight text-secondary-text sm:text-left md:text-2xl">
              {c.developerToolsHeading}
            </h2>
            <Link
              href="/developer-tools"
              className="text-center text-sm font-semibold text-primary no-underline hover:underline sm:text-right"
            >
              View developer hub →
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {developerToolsGrid.map((tool) => (
              <li key={tool.slug}>
                <ToolsDirectoryCard tool={tool} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="!mt-0 text-center text-xl font-semibold tracking-tight text-secondary-text sm:text-left md:text-2xl">
              {c.imageToolsHeading}
            </h2>
            <Link
              href="/image-tools"
              className="text-center text-sm font-semibold text-primary no-underline hover:underline sm:text-right"
            >
              View image hub →
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {imageToolsGrid.map((tool) => (
              <li key={tool.slug}>
                <ToolsDirectoryCard tool={tool} />
              </li>
            ))}
          </ul>
        </div>

        <ToolsMoreCategories
          title={c.moreCategories.title}
          description={c.moreCategories.description}
          links={c.moreCategories.links}
        />
      </Container>
    </section>
  );
}
