import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";
import PageMeta from "@/components/PageMeta";
import { GuideMarkdown } from "@/components/guides/GuideMarkdown";
import { preprocessGuideBody } from "@/lib/guideBody";
import { getPublishedGuides } from "@/lib/guides";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const HUB_INTRO_PATH = path.join(process.cwd(), "public/content/site-pages/guides-hub-intro.md");

function loadHubMeta(): { title: string; description: string; introMarkdown: string } {
  const raw = fs.readFileSync(HUB_INTRO_PATH, "utf8");
  const { data, content } = matter(raw);
  const fm = data as { meta_title?: string; meta_description?: string };
  return {
    title: fm.meta_title ?? "Guides | ExesTools",
    description: fm.meta_description ?? "",
    introMarkdown: preprocessGuideBody(content),
  };
}

const hub = loadHubMeta();

/**
 * One- or two-sentence card blurb: who it's for and what it answers.
 * Falls back to meta_description for unknown slugs.
 */
const CARD_SUMMARY: Record<string, string> = {
  "bingo-games-for-classrooms-and-parties":
    "For a teacher planning a 15-minute vocabulary round, or a host with 30 guests and one caller. Covers list length, calls per round, avoiding ties, and classroom or party variations.",
  "cold-calling-students-fairly":
    "For teachers who want every student answering, without the frozen-in-front-of-the-class moment. Explains wait-time research, repeats vs no repeats, question scripts, and support for anxious students.",
  "how-to-make-balanced-random-teams":
    "For PE, workshops and quiz nights where random keeps landing all the strong players together. Walks through odd numbers and pairs, how often random goes lopsided, and a skill-mix method.",
  "secret-santa-rules-and-budget-ideas":
    "For the organizer writing rules before the draw. Covers budgets, couples and dropouts, why hat draws fail, and gift themes for offices and families.",
  "how-random-is-a-spinner-wheel":
    "For anyone who's been asked \"is this wheel rigged?\" Explains how ExesTools picks a result, why streaks look suspicious, and where the honest limits are.",
  "how-to-run-a-fair-online-giveaway":
    "For creators and small businesses running a comment or form giveaway. Covers the rules to publish first, which tool to use, and how to record a draw people can trust.",
  "office-secret-santa-planning-timeline":
    "For the office organizer who got volunteered. A five-week plan for opt-ins, budgets, exclusions, private links, remote shipping and the party itself.",
  "classroom-games-with-a-spinner-wheel":
    "For teachers who want low-prep review games, warm-ups and brain breaks. Ten setups with timing, wheel lists and tips from kindergarten through about eighth grade.",
  "white-elephant-gift-exchange-rules":
    "For the host who needs rules everyone can hear once. Covers steals and freeze limits, what the first player gets, fair turn order, and variations for kids or big groups.",
};

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
  const introMarkdown = hub.introMarkdown;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Guides</h1>
        <PageMeta updated="2026-10-25" />
        <div className="mt-6">
          <GuideMarkdown content={introMarkdown} />
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
                {CARD_SUMMARY[guide.slug] ?? guide.frontmatter.meta_description}
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
