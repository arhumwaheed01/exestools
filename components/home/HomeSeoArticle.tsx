import Link from "next/link";
import { homepageData } from "@/lib/content/homepageData";
import type { SeoBlock } from "@/lib/content/homepageData";

function SeoBlocks({ blocks }: { blocks: readonly SeoBlock[] }) {
  return (
    <div className="mt-8 space-y-6 text-base leading-relaxed text-secondary-text">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return <p key={i}>{block.text}</p>;
        }
        return (
          <p key={i}>
            {block.segments.map((seg, j) => {
              if (seg.kind === "text") {
                return <span key={j}>{seg.value}</span>;
              }
              return (
                <Link
                  key={j}
                  href={seg.href}
                  className="font-semibold text-primary hover:text-primary-hover"
                >
                  {seg.value}
                </Link>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

export function HomeSeoArticle() {
  const { seoArticle } = homepageData;

  return (
    <section className="border-t border-input-border bg-background py-14 md:py-20">
      <div className="container max-w-3xl">
        <h2 className="!mt-0 text-2xl font-semibold md:text-3xl">
          {seoArticle.heading}
        </h2>
        <SeoBlocks blocks={seoArticle.blocks} />
      </div>
    </section>
  );
}
