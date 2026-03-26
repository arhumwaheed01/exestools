import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { homepageData, notFoundPageContent } from "@/lib/content/homepageData";
import { toolPath } from "@/lib/content/textToolsData";
import { buildPageMetadata } from "@/lib/seo/generateMeta";

export const metadata: Metadata = buildPageMetadata({
  title: notFoundPageContent.title,
  description: notFoundPageContent.description,
  path: "/",
  absoluteTitle: true,
  noindex: true,
});

export default function NotFound() {
  const c = notFoundPageContent;

  return (
    <section className="bg-surface py-20 md:py-28">
      <Container className="max-w-[52rem] text-center">
        <h1 className="!mt-0 text-3xl font-bold md:text-4xl">{c.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-secondary-text">
          {c.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {c.actions.map((a) => (
            <Link key={a.href} href={a.href} className="btn">
              {a.label}
            </Link>
          ))}
        </div>

        <div className="mt-12 border-t border-input-border/80 pt-10 text-left">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-secondary-text/80">
            Popular tools
          </p>
          <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            {homepageData.popularTools.map((t) => (
              <li key={t.slug}>
                <Link
                  href={toolPath(t.slug)}
                  className="inline-flex rounded-lg px-3 py-2 text-sm font-medium text-primary no-underline transition-colors hover:bg-primary/10"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
