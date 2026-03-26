import Link from "next/link";
import { getExpandedRelatedSlugs } from "@/lib/content/relatedToolsExpansion";
import {
  getToolBySlug,
  toolPath,
  type TextTool,
} from "@/lib/content/textToolsData";
import type { TextToolSeoSections } from "@/lib/content/textToolPageTypes";
import { FaqAccordion } from "@/components/tools/FaqAccordion";

type Props = {
  tool: TextTool;
  sections: TextToolSeoSections;
};

const sectionShell =
  "mx-auto w-full max-w-3xl text-center [&_.prose-block]:text-left";

export function TextToolSeo({ tool, sections }: Props) {
  const { seoArticle, howToUse, features, faq, relatedTools } = sections;

  const relatedSlugs = getExpandedRelatedSlugs(tool.slug, tool.relatedTools);
  const related = relatedSlugs.flatMap((slug) => {
    const t = getToolBySlug(slug);
    return t ? [{ slug, name: t.name, href: toolPath(slug) }] : [];
  });

  return (
    <div className="mt-14 space-y-16 border-t border-input-border pt-14 md:space-y-20 md:pt-16">
      <section className={sectionShell}>
        <div className="rounded-2xl border border-input-border/80 bg-linear-to-br from-background via-background to-surface p-6 shadow-md shadow-black/4 ring-1 ring-black/4 md:p-10">
          <h2 className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
            {seoArticle.heading}
          </h2>
          <div className="prose-block mt-6 space-y-5 text-base leading-relaxed text-secondary-text">
            {seoArticle.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionShell}>
        <h2 className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
          {howToUse.heading}
        </h2>
        <ol className="prose-block mt-8 grid gap-4 text-left sm:grid-cols-1 md:gap-5">
          {howToUse.steps.map((step, i) => (
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
                <p className="font-semibold text-secondary-text">{step.title}</p>
                <p className="mt-2 text-secondary-text/95">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {features ? (
        <section className={sectionShell}>
          <h2 className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
            {features.heading}
          </h2>
          <ul className="prose-block mt-8 list-none space-y-4 text-left text-base leading-relaxed text-secondary-text">
            {features.items.map((item, i) => (
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
      ) : null}

      <section className="mx-auto w-full max-w-3xl">
        <FaqAccordion heading={faq.heading} items={faq.items} />
      </section>

      <section className={sectionShell}>
        <h2 className="mt-0! text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
          {relatedTools.heading}
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
