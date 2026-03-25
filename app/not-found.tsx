import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { notFoundPageContent } from "@/lib/content/homepageData";
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
      <Container className="max-w-xl text-center">
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
      </Container>
    </section>
  );
}
