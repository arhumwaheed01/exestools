import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { SpinnerMount } from "@/components/SpinnerMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string; preset?: string }>;
};

const HOME_TITLE = "Free Spinner Wheel Online — Spin & Decide | ExesTools";
const HOME_META =
  "Free online spinner wheel. Add options, hit SPIN, get a fair pick. Works as a multi-option decision wheel too. No signup on ExesTools.";

export async function generateMetadata(): Promise<Metadata> {
  // Canonical always points at the clean www homepage (including legacy ?c= shares).
  return {
    title: {
      absolute: HOME_TITLE,
    },
    description: HOME_META,
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title: HOME_TITLE,
      description: HOME_META,
      url: absoluteUrl("/"),
      images: [
        {
          url: siteConfig.ogImagePath,
          width: 1200,
          height: 630,
          alt: "ExesTools Spinner Wheel",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_META,
      images: [siteConfig.ogImagePath],
    },
  };
}

const HOME_FAQS = [
  {
    q: "Is the ExesTools spinner wheel free?",
    a: "Yes; no account for the core wheel.",
  },
  {
    q: "How is the winner chosen?",
    a: "Segment under the fixed pointer after the spin stops.",
  },
  {
    q: "Can results repeat?",
    a: "Yes. Use Remove & continue (or the remove-winner toggle) for no-repeat.",
  },
  {
    q: "Why can’t I spin with one option?",
    a: "Need at least two choices.",
  },
  {
    q: "Can I use this as a decision wheel?",
    a: "Yes when you have several options—add each choice and spin. For only yes vs no, use the Yes or no wheel.",
  },
  {
    q: "Where are name, classroom, prize, and Yes/No tools?",
    a: "See Related ExesTools spinners.",
  },
] as const;

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const encoded = typeof sp.c === "string" ? sp.c : null;
  const preset = typeof sp.preset === "string" ? sp.preset : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ExesTools Spinner Wheel",
    url: absoluteUrl("/"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: HOME_META,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-3 max-w-3xl">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          Free spinner wheel online
        </h1>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted sm:line-clamp-none sm:text-base sm:leading-relaxed">
          Add one option per line, hit SPIN, and land on a fair result. Works as a multi-option
          decision wheel when you have several choices—no account required. For specialized lists,
          use Related ExesTools spinners.
        </p>
      </header>

      <SpinnerMount toolId="home" initialEncoded={encoded} initialPresetQuery={preset} />

      <div className="mt-12 space-y-10 border-t border-border pt-10">
        <section id="how-to" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How to use the spinner wheel
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>Enter one option per line, or use an Example wheel chip.</li>
            <li>Press SPIN. Optional: Sound, Reset rotation.</li>
            <li>Winner modal: Spin again, Remove &amp; continue, or Close.</li>
            <li>
              Shuffle / Copy / Defaults / Clear all manage the list. Copy share link uses this path
              + #w=. Fresh wheel restores the homepage default list.
            </li>
          </ol>
        </section>

        <section id="what-is" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What is a spinner wheel?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            A spinner wheel divides options into colored segments. When it stops, the segment under
            the fixed pointer is the selected result. ExesTools draws the wheel on canvas and
            computes the winner from the final rotation so the on-screen result matches what you see.
          </p>
        </section>

        <section id="multi-option" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Multi-option decision wheel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            When you need to choose among several options—not just yes or no—list each choice and
            spin. For a binary yes/no answer only, use the{" "}
            <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
              Yes or no wheel
            </Link>
            .
          </p>
        </section>

        <RelatedTools toolId="home" />

        <section className="max-w-3xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {HOME_FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface px-4 py-3 open:border-accent/40"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-muted transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="max-w-3xl text-sm text-muted">
          Privacy details:{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
