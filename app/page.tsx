import type { Metadata } from "next";
import Link from "next/link";
import { FAQSection } from "@/components/FAQSection";
import { SpinnerWheel } from "@/components/SpinnerWheel";
import { faqsToJsonLd } from "@/lib/faqs";
import { absoluteUrl, siteConfig } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ c?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const hasShare = typeof sp.c === "string" && sp.c.length > 0;

  return {
    title: {
      absolute: "Free Spinner Wheel — Random Name & Prize Picker | ExesTools",
    },
    description:
      "Free online spinner wheel and random name picker. Add choices, spin fairly, save locally, share a link. Ideal for classrooms, giveaways, Yes/No decisions, and teams.",
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title: "Free Spinner Wheel | ExesTools",
      description:
        "Custom random spinner for names, Yes/No, prizes, and classroom activities. No signup required.",
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
      title: "Free Spinner Wheel | ExesTools",
      description:
        "Custom random spinner for names, Yes/No, prizes, and classroom activities. No signup required.",
      images: [siteConfig.ogImagePath],
    },
    robots: hasShare
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const encoded = typeof sp.c === "string" ? sp.c : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ExesTools Spinner Wheel",
    url: absoluteUrl("/"),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online spinner wheel for random name picking, prize draws, and Yes/No decisions.",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqsToJsonLd()) }}
      />

      <header className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Free Spinner Wheel & Random Name Picker
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Enter your choices, hit SPIN, and get a clear random result. Free on {siteConfig.name} —
          for classrooms, giveaways, team decisions, and everyday picks.
        </p>
      </header>

      <SpinnerWheel initialEncoded={encoded} />

      <div className="mt-16 space-y-14 border-t border-border pt-12">
        <ContentBlock
          id="what-is"
          title="What is a spinner wheel?"
          body="A spinner wheel (or decision wheel) divides options into colored segments. When it stops, the segment under a fixed pointer is the selected result. ExesTools draws the wheel on an HTML canvas and computes the winner from the final rotation so the on-screen result matches what you see."
        />
        <ContentBlock
          id="how-to"
          title="How to use the spinner wheel"
          body="Paste one choice per line in the editor (or load an example wheel). Press SPIN and wait for the wheel to decelerate. Use Remove & continue to draw without replacement, Shuffle to randomize order, or Copy share link to send your list to someone else."
        />

        <section id="use-cases" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            What is the spinner wheel for?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            People use ExesTools for the same everyday decisions you would solve with a name picker
            or prize draw — without creating an account.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
            <li>
              <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
                Random name picker
              </Link>{" "}
              — classrooms, meetings, and who-goes-first moments.
            </li>
            <li>
              <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
                Classroom spinner
              </Link>{" "}
              — fair turn-taking and warm-up activities.
            </li>
            <li>
              <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
                Prize wheel / giveaways
              </Link>{" "}
              — loyalty draws, event raffles, and reward segments.
            </li>
            <li>
              <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
                Yes/No and decision wheels
              </Link>{" "}
              — dinner debates, weekend plans, and quick choices.
            </li>
          </ul>
        </section>

        <section id="features" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Spinner wheel features
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
            <li>Canvas wheel with readable labels and a fixed pointer</li>
            <li>Smooth spin animation; winner matches the landing segment</li>
            <li>Choices editor with shuffle, clear, restore defaults, and clipboard copy</li>
            <li>Presets for names, Yes/No, prizes, food, and activities</li>
            <li>Remove winner and continue (draw without replacement)</li>
            <li>Local storage so your list returns next visit</li>
            <li>Shareable links via URL parameters (length-limited)</li>
            <li>Optional sound toggle and reduced-motion support</li>
          </ul>
        </section>

        <section id="privacy" className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Is my data private?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Wheel choices stay in your browser unless you copy a share link. Read our{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>{" "}
            for details. We do not require registration to use the spinner.
          </p>
        </section>

        <FAQSection />
      </div>
    </div>
  );
}

function ContentBlock({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section id={id} className="max-w-3xl">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{body}</p>
    </section>
  );
}
