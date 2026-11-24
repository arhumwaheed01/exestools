import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { WheelGalleryClient } from "@/components/wheel-v2/WheelGalleryClient";
import { isGuidePublished } from "@/lib/guides";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webPageLd } from "@/lib/seo/jsonld";

const TITLE = "Wheel gallery — ready-made spinner wheels";
const META =
  "Browse free ready-made spinner wheels for food, weekends, classrooms, yes/no, truth or dare, and more. Open any wheel on ExesTools with one click.";

export const metadata: Metadata = {
  title: TITLE,
  description: META,
  robots: { index: false, follow: true },
  alternates: { canonical: absoluteUrl("/wheel-gallery") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/wheel-gallery"),
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "Are these wheels free?",
    a: "Yes. Every wheel is free, with no account or sign-up.",
  },
  {
    q: "Can I change the options?",
    a: "Yes. Open any wheel, then edit, add, shuffle or remove entries.",
  },
  {
    q: "Is my list saved on your servers?",
    a: "No. Your list stays in your browser.",
  },
  {
    q: "Can I stop a name from being picked twice?",
    a: "Yes. Turn on Remove winner after spin.",
  },
  {
    q: "Can I share a wheel?",
    a: "Yes. Use the share link to send your wheel to someone else.",
  },
];

const linkCls = "font-semibold text-accent hover:underline";

export default function WheelGalleryPage() {
  const classroomGuideLive = isGuidePublished("classroom-games-with-a-spinner-wheel");
  const secretSantaGuideLive = isGuidePublished("secret-santa-rules-and-budget-ideas");

  const pageLd = {
    ...webPageLd({
      name: TITLE,
      description: META,
      path: "/wheel-gallery",
    }),
    dateModified: "2026-11-17",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Wheel gallery
        </h1>
        <PageMeta updated="2026-11-17" />
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Not sure what to put on a wheel? Every wheel here is a ready-made starting list you can
          open in one click, then edit, shuffle and spin. They&apos;re free, there&apos;s no
          account, and your list stays in your browser. Search by topic below, or browse the groups:
          food and fun, classroom and meetings, parties and giveaways, and quick pickers.
        </p>
      </header>

      <WheelGalleryClient />

      <div className="mt-12 max-w-3xl space-y-10 border-t border-border pt-10 text-sm leading-relaxed text-muted sm:text-base">
        <section aria-label="What's in the gallery" className="space-y-8">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            What&apos;s in the gallery
          </p>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Everyday decisions
            </h2>
            <p className="mt-3">
              What to eat, Weekend activity, Movie night genre and Today&apos;s workout take the
              arguing out of small choices. Open one, swap in your own options, and spin. The result
              is random, so nobody can say you picked it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Classroom and meetings
            </h2>
            <p className="mt-3">
              Classroom picks, Brain break, Meeting speaker order and Icebreaker prompts help
              teachers and team leads call on people fairly and keep a group moving. For longer
              classroom use, see the{" "}
              <Link href="/classroom-spinner" className={linkCls}>
                Classroom Spinner
              </Link>{" "}
              page
              {classroomGuideLive ? (
                <>
                  {" "}
                  or{" "}
                  <Link href="/guides/classroom-games-with-a-spinner-wheel" className={linkCls}>
                    classroom games with a spinner wheel
                  </Link>
                </>
              ) : null}
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Parties and giveaways
            </h2>
            <p className="mt-3">
              Secret Santa pick order, Truth or dare, Prize tiers and Chore roulette work for holiday
              parties, game nights and shared households. For a full gift exchange with exclusions
              and private links, use the{" "}
              <Link href="/secret-santa-generator" className={linkCls}>
                Secret Santa
              </Link>{" "}
              page
              {secretSantaGuideLive ? (
                <>
                  {" "}
                  (
                  <Link href="/guides/secret-santa-rules-and-budget-ideas" className={linkCls}>
                    Secret Santa rules and gift exchange ideas
                  </Link>
                  )
                </>
              ) : null}
              . For giveaways with several prizes, use the{" "}
              <Link href="/prize-wheel" className={linkCls}>
                Prize Wheel
              </Link>{" "}
              or the{" "}
              <Link href="/raffle-generator" className={linkCls}>
                Raffle Generator
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Quick pickers</h2>
            <p className="mt-3">
              Yes or no, Yes, no, or maybe, Numbers 1–10 and Letters A–Z are the fast ones, great for
              word games, quick votes and tie-breakers. The{" "}
              <Link href="/yes-no-wheel" className={linkCls}>
                Yes/No Wheel
              </Link>{" "}
              page also has a coin-toss mode.
            </p>
          </div>
        </section>

        <section aria-labelledby="gallery-choose">
          <h2
            id="gallery-choose"
            className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            How to choose a wheel
          </h2>
          <p className="mt-3">
            Start with the question you&apos;re trying to answer. If it&apos;s &quot;who goes first
            or who gets picked,&quot; use a names or classroom wheel. If it&apos;s &quot;what should
            we do,&quot; pick a food, activity or movie wheel. If you need a fair split into groups,
            use the{" "}
            <Link href="/random-team-generator" className={linkCls}>
              Team Generator
            </Link>{" "}
            instead of a wheel. Every wheel caps at 60 entries, you can turn on Remove winner after
            spin so each name is picked once, and you can share your wheel with a link.
          </p>
        </section>

        <section id="faq" className="scroll-mt-24" aria-labelledby="gallery-faq">
          <h2 id="gallery-faq" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface open:border-accent/40"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span className="text-muted transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p>
          Want ideas for using wheels at school, at the office or at a party? Read our{" "}
          <Link href="/guides" className={linkCls}>
            guides
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
