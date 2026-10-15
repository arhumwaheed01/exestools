import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedWheel } from "@/components/embed/EmbedWheel";
import {
  EMBED_TOOL_SLUGS,
  embedToolId,
  embedToolLabel,
  isEmbedToolSlug,
} from "@/lib/embed";
import { absoluteUrl } from "@/lib/seo";
import { cleanPathFor } from "@/lib/tools";

type PageProps = { params: Promise<{ tool: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return EMBED_TOOL_SLUGS.map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  if (!isEmbedToolSlug(tool)) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const name = embedToolLabel(tool);
  const toolId = embedToolId(tool);
  return {
    title: { absolute: `${name} (embed) | ExesTools` },
    description: `Embeddable ${name} from ExesTools. Minimal spin UI for iframes.`,
    robots: { index: false, follow: false },
    alternates: { canonical: absoluteUrl(cleanPathFor(toolId)) },
  };
}

export default async function EmbedToolPage({ params }: PageProps) {
  const { tool } = await params;
  if (!isEmbedToolSlug(tool)) notFound();
  return <EmbedWheel slug={tool} />;
}
