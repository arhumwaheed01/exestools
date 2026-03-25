import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { TextToolsSeo } from "@/components/text-tools/TextToolsSeo";
import { seoData, toMetadata } from "@/lib/content/seoData";
import {
  textTools,
  textToolsPageContent,
  toolPath,
} from "@/lib/content/textToolsData";

export const metadata: Metadata = toMetadata(seoData.textTools);

export default function TextToolsPage() {
  const { title, intro, openToolLabel } = textToolsPageContent;

  return (
    <section className="bg-surface pt-4 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
      <Container>
        <h1 className="!mt-0 text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary-text">
          {intro}
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {textTools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={toolPath(tool.slug)}
                className="flex h-full flex-col rounded-xl border border-input-border bg-background p-6 no-underline shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="!mt-0 text-xl font-semibold text-secondary-text hover:text-primary">
                  {tool.name}
                </h2>
                <p className="mt-3 flex-1 text-base leading-relaxed text-secondary-text">
                  {tool.description}
                </p>
                <span className="mt-4 font-semibold text-primary">
                  {openToolLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <TextToolsSeo />
      </Container>
    </section>
  );
}
