import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { CompareToolClient } from "@/components/tools/CompareToolClient";
import { DevSpecialToolClient } from "@/components/tools/DevSpecialToolClient";
import { FindReplaceToolClient } from "@/components/tools/FindReplaceToolClient";
import { HashToolClient } from "@/components/tools/HashToolClient";
import { ImageToolClient } from "@/components/tools/ImageToolClient";
import { SpeechToolsClient } from "@/components/tools/SpeechToolsClient";
import { TextReverserToolClient } from "@/components/tools/TextReverserToolClient";
import { TextStatsToolClient } from "@/components/tools/TextStatsToolClient";
import { ProgrammaticToolSeo } from "@/components/tools/ProgrammaticToolSeo";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { TransformSlugClient } from "@/components/tools/TransformSlugClient";
import { getTextToolFullPage } from "@/lib/content/getTextToolFullPage";
import { getSeoForTool, toolSlugMetadata } from "@/lib/content/seoData";
import { allTools, getToolBySlug } from "@/lib/content/textToolsData";
import { buildFaqPageJsonLd, buildSoftwareApplicationJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/generateMeta";
import { defaultSEO } from "@/lib/seo/seoConfig";
import { schemaApplicationCategoryForSlug } from "@/lib/seo/toolRouteHelpers";
import {
  generateSEOContent,
  resolveToolCategory,
} from "@/lib/seoContentGenerator";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allTools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seo = getSeoForTool(slug);
  if (!seo) {
    return buildPageMetadata({
      title: `Tool | ${defaultSEO.siteName}`,
      description: defaultSEO.defaultDescription,
      path: `/tools/${slug}`,
      absoluteTitle: true,
      noindex: true,
    });
  }
  return toolSlugMetadata(slug, seo);
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const full = getTextToolFullPage(slug);
  if (!full) {
    notFound();
  }

  let workspace: ReactNode;
  if (full.kind === "stats") {
    workspace = <TextStatsToolClient ui={full.ui} />;
  } else if (full.kind === "compare") {
    workspace = <CompareToolClient slug={slug} ui={full.ui} />;
  } else if (full.kind === "find-replace") {
    workspace = <FindReplaceToolClient ui={full.ui} />;
  } else if (full.kind === "speech-tts" || full.kind === "speech-stt") {
    workspace = <SpeechToolsClient kind={full.kind} ui={full.ui} />;
  } else if (slug === "text-reverser") {
    workspace = <TextReverserToolClient ui={full.ui} />;
  } else if (full.kind === "dev-hash") {
    workspace = <HashToolClient algorithm={full.algorithm} ui={full.ui} />;
  } else if (full.kind === "dev-special") {
    workspace = <DevSpecialToolClient variant={full.variant} ui={full.ui} />;
  } else if (full.kind === "image-tool") {
    workspace = <ImageToolClient variant={full.variant} ui={full.ui} />;
  } else {
    workspace = <TransformSlugClient slug={slug} ui={full.ui} />;
  }

  const category = resolveToolCategory(slug);
  const seoContent = generateSEOContent({
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    category,
  });

  const webAppLd = buildSoftwareApplicationJsonLd({
    name: tool.name,
    description: full.meta.description,
    urlPath: `/tools/${slug}`,
    applicationCategory: schemaApplicationCategoryForSlug(slug),
  });

  const faqLd = buildFaqPageJsonLd(seoContent.faqs);

  return (
    <>
      <JsonLd data={webAppLd} id={`ld-webapp-${slug}`} />
      <JsonLd data={faqLd} id={`ld-faq-${slug}`} />
      <ToolPageShell
        title={tool.name}
        pageHeading={full.meta.pageHeading}
        description={full.meta.description}
        variant="featured"
        afterCard={
          <ProgrammaticToolSeo
            tool={tool}
            category={category}
            content={seoContent}
          />
        }
      >
        {workspace}
      </ToolPageShell>
    </>
  );
}
