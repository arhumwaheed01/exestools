import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";
import PageMeta from "@/components/PageMeta";
import { getPublishedGuides } from "@/lib/guides";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const HUB_INTRO_PATH = path.join(process.cwd(), "public/content/site-pages/guides-hub-intro.md");

function loadHubMeta(): { title: string; description: string; introParagraphs: string[] } {
  const raw = fs.readFileSync(HUB_INTRO_PATH, "utf8");
  const { data, content } = matter(raw);
  const fm = data as { meta_title?: string; meta_description?: string };
  const lines = content.trim().split("\n");
  const introLines = lines.filter((l: string) => !l.startsWith("#") && !l.startsWith("<!--"));
  const introText = introLines.join("\n").trim();
  const paragraphs = introText.split(/\n\n+/).filter(Boolean);
  return {
    title: fm.meta_title ?? "Guides | ExesTools",
    description: fm.meta_description ?? "",
    introParagraphs: paragraphs,
  };
}

const hub = loadHubMeta();

export const metadata: Metadata = {
  title: { absolute: hub.title },
  description: hub.description,
  alternates: { canonical: absoluteUrl("/guides") },
  openGraph: {
    ...toolOpenGraph({
      title: hub.title,
      description: hub.description,
      url: absoluteUrl("/guides"),
      imagePath: siteConfig.ogImagePath,
      imageAlt: "ExesTools guides",
    }),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: hub.title,
    description: hub.description,
    images: [siteConfig.ogImagePath],
  },
};

export default function GuidesHubPage() {
  const guides = getPublishedGuides();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Guides</h1>
        <PageMeta updated={guides[0]?.frontmatter.updated ?? "2026-10-13"} />
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
          {hub.introParagraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/guides/${guide.slug}`}
              className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <h2 className="text-lg font-bold text-foreground">{guide.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {guide.frontmatter.meta_description}
              </p>
              <p className="mt-3 text-xs font-medium text-muted">
                Published{" "}
                <time dateTime={guide.frontmatter.published}>
                  {new Date(guide.frontmatter.published + "T00:00:00Z").toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
