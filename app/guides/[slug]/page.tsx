import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageMeta from "@/components/PageMeta";
import { AuthorBox } from "@/components/guides/AuthorBox";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import {
  getGuideBySlug,
  getGuideSlugs,
  isGuidePublished,
  type Guide,
} from "@/lib/guides";
import { labelForToolPath } from "@/lib/relatedToolLabel";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { articleLd, faqPageLd, toolOpenGraph } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  const { meta_title, meta_description, published, updated } = guide.frontmatter;
  const url = absoluteUrl(`/guides/${slug}`);

  return {
    title: { absolute: meta_title },
    description: meta_description,
    alternates: { canonical: url },
    openGraph: {
      ...toolOpenGraph({
        title: meta_title,
        description: meta_description,
        url,
        imagePath: siteConfig.ogImagePath,
        imageAlt: guide.title,
      }),
      type: "article",
      publishedTime: published,
      modifiedTime: updated,
      authors: ["Arhum Waheed"],
    },
    twitter: {
      card: "summary_large_image",
      title: meta_title,
      description: meta_description,
      images: [siteConfig.ogImagePath],
    },
  };
}

function RelatedToolsBox({ guide }: { guide: Guide }) {
  const tools = guide.frontmatter.related_tools ?? [];
  if (!tools.length) return null;

  return (
    <aside className="mt-12 max-w-3xl rounded-2xl border border-border bg-surface px-5 py-5">
      <h2 className="text-lg font-bold text-foreground">Related tools</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {tools.map((href) => (
          <li key={href}>
            <Link href={href} className="font-semibold text-accent hover:underline">
              {labelForToolPath(href)}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide || !isGuidePublished(slug)) notFound();

  const { published, updated, meta_description } = guide.frontmatter;
  const article = articleLd({
    headline: guide.title,
    path: slug,
    datePublished: published,
    dateModified: updated,
    description: meta_description,
  });
  const faqLd = guide.faqs.length ? faqPageLd(guide.faqs) : null;

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Guides", item: absoluteUrl("/guides") },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: absoluteUrl(`/guides/${slug}`),
      },
    ],
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faqLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />

      <nav className="mb-4 text-xs text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-accent hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/guides" className="hover:text-accent hover:underline">
              Guides
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">{guide.title}</li>
        </ol>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {guide.title}
        </h1>
        <PageMeta published={published} updated={updated} />
      </header>

      <div className="mt-8">
        <GuideMarkdown content={guide.content} />
      </div>

      <AuthorBox />
      <RelatedToolsBox guide={guide} />
    </article>
  );
}
