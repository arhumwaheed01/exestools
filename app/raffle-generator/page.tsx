import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RelatedTools } from "@/components/RelatedTools";
import { RaffleMount } from "@/components/raffle/RaffleMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const PAGE_URL = "https://www.exestools.com/raffle-generator";
const TITLE = "Online Raffle Generator – Winners & Alternates | ExesTools";
const DESCRIPTION =
  "Free raffle tool: paste names or a ticket range, draw up to 100 winners plus alternates, then copy or print the draw record. No signup, runs in browser.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [siteConfig.ogImagePath],
  },
};

const FAQ_LINK_HREFS: Record<string, string> = {
  "How ExesTools picks a result": "/about#how-it-works",
  "Terms of Service": "/terms",
  "prize wheel": "/prize-wheel",
  "random name picker": "/random-name-picker",
  "random number wheel": "/random-number-wheel",
};

const FAQ = [
  {
    q: "How does an online raffle generator work?",
    a: "You add entries or a ticket range, choose how many winners, and the tool picks at random in your browser. Nobody wins twice unless you allow it.",
  },
  {
    q: "Can I draw several prizes at once?",
    a: "Yes. Up to 100 winners, each matched to a prize name you type.",
  },
  {
    q: "What are alternates?",
    a: "Backup winners in order. If winner 2 doesn't claim, alternate 1 gets the prize. You can draw up to 20, plus extra ones later.",
  },
  {
    q: "Can I use ticket numbers instead of names?",
    a: "Yes. Set the first and last ticket number and the tool draws from that range.",
  },
  {
    q: "How do I prove the draw was fair?",
    a: "Copy or print the draw record, or share the result link with entrants.",
  },
  {
    q: "Is this raffle tool free?",
    a: "Yes. No signup, and your list stays in your browser.",
  },
];

function FaqAnswer({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]$/.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const label = m[1]!;
        const href = FAQ_LINK_HREFS[label];
        if (!href) return <span key={i}>{label}</span>;
        return (
          <Link key={i} href={href} className="font-semibold text-accent hover:underline">
            {label}
          </Link>
        );
      })}
    </>
  );
}

const HASH_HANDOFF = String.raw`(function(){try{var m=/^#d=v1\.[A-Za-z0-9+$-]{1,5994}$/.exec(location.hash);if(!m)return;sessionStorage.setItem("exestools.raffle.hash.v1",m[0]);history.replaceState(history.state,"",location.pathname+location.search)}catch(e){}})();`;

export default function RaffleGeneratorPage() {
  const appJsonLd = webAppLd({
    path: "/raffle-generator",
    name: "Raffle Generator",
    description: DESCRIPTION,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Raffle generator",
        item: PAGE_URL,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <script id="raffle-hash-handoff" dangerouslySetInnerHTML={{ __html: HASH_HANDOFF }} />

        <nav aria-label="Breadcrumb" className="print:hidden text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="font-semibold text-accent hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-muted">
              →
            </li>
            <li className="text-foreground">Raffle generator</li>
          </ol>
        </nav>

        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Online Raffle Generator: Draw Winners and Alternates
        </h1>
        <PageMeta updated="2026-10-21" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Paste your entrants or type a ticket range like 1–300, say how many prizes you&apos;re
          giving away, and press Draw. You get the winners, backup alternates for anyone who
          doesn&apos;t claim, and a draw record you can copy or print for the committee. It&apos;s
          free with no signup.
        </p>

        <div className="raffle-tool-wrap mt-6 min-w-0">
          <RaffleMount />
        </div>

        <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to run a raffle online
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Add entries.</span> Names one per
              line, or choose numbered tickets and set the first and last ticket.
            </li>
            <li>
              <span className="font-semibold text-foreground">Check the counter</span> against your
              sales sheet. &quot;120 tickets&quot; should mean 120 sold.
            </li>
            <li>
              <span className="font-semibold text-foreground">Set winners and alternates.</span>{" "}
              Choose up to 100 winners and up to 20 alternates, and type the prize names.
            </li>
            <li>
              <span className="font-semibold text-foreground">Press Draw.</span> If a winner
              can&apos;t be reached, Draw another alternate adds one without touching the earlier
              results.
            </li>
            <li>
              <span className="font-semibold text-foreground">Keep the record.</span> Copy or print
              the draw record, or share the result link.
            </li>
          </ol>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            One entry per name, or numbered tickets
          </h2>
          <p className="mt-3">
            For most social giveaways, keep One entry per name on so repeats are ignored. Capital
            letters and extra spaces don&apos;t make a name different, so add an initial when two
            people share a name. If you sold or printed numbered tickets, choose Number range, set
            the first and last ticket, and list unsold numbers under Leave out. Each ticket still in
            the draw has the same chance.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Drawing several winners and alternates
          </h2>
          <p className="mt-3">
            Each pick takes one random ticket from those still in the draw. By default, when someone
            wins they leave the draw, so each person can win only once. That&apos;s how most prize
            raffles and social giveaways run. If your rules allow the same person to win more than
            once, switch off Each person can win only once.
          </p>
          <p className="mt-3">
            Alternates are drawn after the winners, from the same tickets, in order. If a winner
            can&apos;t be reached or turns a prize down, offer it to Alternate 1, then Alternate 2.
            Need another backup later? Draw another alternate adds one without changing anyone
            already drawn.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Draw records and transparency
          </h2>
          <p className="mt-3">
            Every draw gets a record: the date and time on your device, a draw code, the number of
            names and tickets, the rules you used, each winner with their prize and ticket number,
            and the alternates. Copy it or print it for your committee. A new draw always gets a new
            code.
          </p>
          <p className="mt-3">
            The record also shows a list fingerprint, a short code made from your final entry list.
            Publish your list before the draw, and anyone can paste it into this page to check the
            fingerprint matches. That shows the list didn&apos;t change, not how winners were picked.
          </p>
          <p className="mt-3">
            The record is made in your browser and isn&apos;t stored by ExesTools, so we can&apos;t
            confirm a result afterwards. It&apos;s a transparency aid, not an official or audited
            draw. Draw where people can see, or record your screen. Winners are picked with your
            browser&apos;s secure random number generator, and every ticket still in the draw has the
            same chance.{" "}
            <Link href="/about#how-it-works" className="font-semibold text-accent hover:underline">
              How ExesTools picks a result
            </Link>
            .
          </p>
          <p className="mt-3">
            Raffle and lottery laws vary by country, state and city, and some places require a
            license. You&apos;re responsible for following the rules where you run your raffle;
            nothing here is legal advice. See our{" "}
            <Link href="/terms" className="font-semibold text-accent hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Real raffles</h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">PTA spring fair.</span> Tickets 1–300
              sold from a book, 5 hamper prizes. Set the range, 5 winners, 3 alternates. Read the
              numbers out, then pin the printed record by the prize table.
            </li>
            <li>
              <span className="font-semibold text-foreground">Office charity raffle.</span> 48 staff
              and 120 tickets across names. Paste one line per ticket (repeat a name per ticket
              bought) so the odds match what people paid.
            </li>
            <li>
              <span className="font-semibold text-foreground">Instagram giveaway.</span> Paste
              commenters&apos; handles, draw 1 winner and 2 alternates, and post the result link in
              your story. For the full checklist, see{" "}
              <Link
                href="/guides/how-to-run-a-fair-online-giveaway"
                className="font-semibold text-accent hover:underline"
              >
                how to run a fair online giveaway
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Worked example: 5 prizes, 3 alternates, 300 tickets
          </h2>
          <p className="mt-3">
            A youth soccer club sold 300 numbered tickets for five prizes. They paste the sold numbers, one
            per line, set 5 winners and 3 alternates, and type the prizes from smallest to largest.
          </p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">1st pick:</span>{" "}
              each of the 300 tickets has a 1 in 300 chance. The winning ticket leaves.
            </li>
            <li>
              <span className="font-semibold text-foreground">2nd pick:</span>{" "}
              1 in 299 for each remaining ticket.
            </li>
            <li>
              <span className="font-semibold text-foreground">5th pick:</span>{" "}
              1 in 296.
            </li>
            <li>
              <span className="font-semibold text-foreground">Alternates:</span>{" "}
              then three more tickets are drawn, in order, from the 295 left.
            </li>
          </ul>
          <p className="mt-3">
            Across the whole draw, each ticket has the same 5 in 300 (about 1.7%) chance of winning a prize.
            The family that bought ten tickets holds ten separate numbers. If the club&apos;s rule is one
            prize per family, it says so on the poster and passes any second win to Alternate 1.
          </p>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Tips</h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              Draw alternates at the same time as the winners. Redrawing later looks suspicious.
            </li>
            <li>Remove duplicate lines first if the rule is one entry per person.</li>
            <li>
              A single prize, drawn live on a big screen? The{" "}
              <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
                prize wheel
              </Link>{" "}
              is more fun to watch.
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Raffle generator vs other raffle tools
          </h2>
          <p className="mt-3">
            Some raffle tools add weighted entries or animated replays. ExesTools is the better fit
            when you have several prizes and need{" "}
            <span className="font-semibold text-foreground">backups you can trust</span>: up to 20
            alternates drawn alongside the winners, an extra alternate on demand that never
            reshuffles earlier results, and a printable record with the date and time. To pick
            names one by one from a short list, use the{" "}
            <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
              random name picker
            </Link>
            .
          </p>
        </section>

        <div className="mt-10">
          <RelatedLinks toolId="raffle-generator" />
        </div>

        <section className="mt-10 max-w-3xl" aria-labelledby="raffle-faq">
          <h2 id="raffle-faq" className="text-2xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface px-4 py-3 open:border-accent/40"
              >
                <summary className="cursor-pointer list-none rounded text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.q}
                    <span className="text-muted transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <FaqAnswer text={item.a} />
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <RelatedTools toolId="raffle-generator" />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </div>
  );
}
