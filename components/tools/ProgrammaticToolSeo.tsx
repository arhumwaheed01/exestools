import Link from "next/link";
import { getExpandedRelatedSlugs } from "@/lib/content/relatedToolsExpansion";
import {
  getToolBySlug,
  toolPath,
  type TextTool,
} from "@/lib/content/textToolsData";
import type { SEOGeneratedContent, ToolCategory } from "@/lib/seoContentGenerator";
import { FaqAccordion } from "@/components/tools/FaqAccordion";

type Props = {
  tool: TextTool;
  content: SEOGeneratedContent;
  category: ToolCategory;
};

const sectionShell =
  "mx-auto w-full max-w-3xl text-center [&_.prose-block]:text-left";

function categoryHeadingPhrase(category: ToolCategory): string {
  switch (category) {
    case "developer":
      return "developer";
    case "image":
      return "image";
    default:
      return "text";
  }
}

export function ProgrammaticToolSeo({ tool, content, category }: Props) {
  const { intro, howToUse, features, useCases, faqs } = content;
  const catPhrase = categoryHeadingPhrase(category);

  const relatedSlugs = getExpandedRelatedSlugs(tool.slug, tool.relatedTools);
  const related = relatedSlugs.flatMap((slug) => {
    const t = getToolBySlug(slug);
    return t ? [{ slug, name: t.name, href: toolPath(slug) }] : [];
  });

  return (
    <div className="mt-14 space-y-16 border-t border-input-border pt-14 md:space-y-20 md:pt-16">
      <section className={sectionShell} aria-labelledby={tool.slug + "-about"}>
        <div className="rounded-2xl border border-input-border/80 bg-linear-to-br from-background via-background to-surface p-6 shadow-md shadow-black/4 ring-1 ring-black/4 md:p-10">
          <h2
            id={tool.slug + "-about"}
            className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl"
          >
            About {tool.name} — free online {catPhrase} tool
          </h2>
          <p className="prose-block mt-6 text-base leading-relaxed text-secondary-text">
            {intro}
          </p>
        </div>
      </section>

      <section className={sectionShell} aria-labelledby={tool.slug + "-howto"}>
        <h2
          id={tool.slug + "-howto"}
          className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl"
        >
          How to use {tool.name} (step by step)
        </h2>
        <ol className="prose-block mt-8 grid gap-4 text-left sm:grid-cols-1 md:gap-5">
          {howToUse.map((step, i) => (
            <li
              key={i}
              className="group relative flex gap-4 rounded-2xl border border-input-border/70 bg-background p-5 text-base leading-relaxed text-secondary-text shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md md:p-6"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-hover text-sm font-bold text-white shadow-md shadow-primary/25"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-secondary-text/95">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={sectionShell} aria-labelledby={tool.slug + "-features"}>
        <h2
          id={tool.slug + "-features"}
          className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl"
        >
          {tool.name} features — fast, free online highlights
        </h2>
        <ul className="prose-block mt-8 list-none space-y-4 text-left text-base leading-relaxed text-secondary-text">
          {features.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-input-border/70 bg-background/80 px-4 py-3 shadow-sm"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={sectionShell} aria-labelledby={tool.slug + "-usecases"}>
        <h2
          id={tool.slug + "-usecases"}
          className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl"
        >
          Real-world use cases for {tool.name}
        </h2>
        <ul className="prose-block mt-8 list-none space-y-4 text-left text-base leading-relaxed text-secondary-text">
          {useCases.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-input-border/70 bg-background/80 px-4 py-3 shadow-sm"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-3xl">
        <FaqAccordion
          heading={`Frequently asked questions about ${tool.name}`}
          items={faqs}
        />
      </section>

      <section className={sectionShell}>
        <h2 className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
          Related tools
        </h2>
        <ul className="prose-block mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                href={r.href}
                className="inline-flex rounded-xl border border-input-border bg-background px-5 py-2.5 text-base font-semibold text-primary shadow-sm no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
