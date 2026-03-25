import Link from "next/link";
import { textToolsPageContent } from "@/lib/content/textToolsData";

export function TextToolsSeo() {
  const { seoSection } = textToolsPageContent;

  return (
    <section className="mt-14 border-t border-input-border pt-12">
      <h2 className="!mt-0 text-2xl font-semibold md:text-3xl">
        {seoSection.heading}
      </h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-secondary-text">
        {seoSection.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p>
          {seoSection.closing.segments.map((seg, j) => {
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
      </div>
    </section>
  );
}
