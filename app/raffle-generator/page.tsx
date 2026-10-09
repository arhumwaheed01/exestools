import type { Metadata } from "next";
import Link from "next/link";
import { RelatedTools } from "@/components/RelatedTools";
import { RaffleMount } from "@/components/raffle/RaffleMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { webAppLd } from "@/lib/seo/jsonld";

const PAGE_URL = "https://www.exestools.com/raffle-generator";
const TITLE = "Raffle Generator — Multiple Winners & Tickets | ExesTools";
const DESCRIPTION =
  "Free raffle generator. Paste names or a ticket range, give people multiple tickets, draw winners and alternates, and save a draw record. No signup.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
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
    q: "Is this raffle generator free?",
    a: "Yes. There's no account, signup or download. Your list, settings and latest draw are saved only in this browser.",
    aPlain:
      "Yes. There's no account, signup or download. Your list, settings and latest draw are saved only in this browser.",
  },
  {
    q: "How do I give someone more than one entry?",
    a: "Switch on Multiple tickets per person and add the count after the name, like Sam x3, or paste a second column with the number of tickets. Each ticket is one equal chance in the draw.",
    aPlain:
      "Switch on Multiple tickets per person and add the count after the name, like Sam x3, or paste a second column with the number of tickets. Each ticket is one equal chance in the draw.",
  },
  {
    q: "Can the same person win twice?",
    a: "Not by default: a winner's tickets all leave the draw. Switch off Each person can win only once to let people with several tickets win again. The same ticket can never be drawn twice.",
    aPlain:
      "Not by default: a winner's tickets all leave the draw. Switch off Each person can win only once to let people with several tickets win again. The same ticket can never be drawn twice.",
  },
  {
    q: "How many entries and winners can I have?",
    a: "Up to 10,000 tickets, 100 winners and 20 alternates in one draw. Ticket numbers in a range can go up to 9,999,999.",
    aPlain:
      "Up to 10,000 tickets, 100 winners and 20 alternates in one draw. Ticket numbers in a range can go up to 9,999,999.",
  },
  {
    q: "How do I draw numbered raffle tickets?",
    a: "Choose Number range and enter your first and last ticket numbers. Add a prefix and zero padding if your tickets read A-001, and list unsold tickets under Leave out.",
    aPlain:
      "Choose Number range and enter your first and last ticket numbers. Add a prefix and zero padding if your tickets read A-001, and list unsold tickets under Leave out.",
  },
  {
    q: "Is the draw random?",
    a: "Yes. Each pick uses your browser's secure random number generator (crypto.getRandomValues) with rejection sampling, so every ticket still in the draw has exactly the same chance. The winner is chosen before the animation starts.",
    aPlain:
      "Yes. Each pick uses your browser's secure random number generator (crypto.getRandomValues) with rejection sampling, so every ticket still in the draw has exactly the same chance. The winner is chosen before the animation starts.",
  },
  {
    q: "Is this a certified or legally compliant raffle draw?",
    a: "No. It gives you a record for transparency, not a certified, audited or legally compliant draw. Raffle and lottery laws vary by place, and the organizer is responsible for following them. If your raffle needs a certified draw, use one.",
    aPlain:
      "No. It gives you a record for transparency, not a certified, audited or legally compliant draw. Raffle and lottery laws vary by place, and the organizer is responsible for following them. If your raffle needs a certified draw, use one.",
  },
  {
    q: "Are my entries uploaded anywhere?",
    a: "No. The draw runs in your browser and your list stays on this device. A result link carries the winners' names, not your list, after the # sign, which browsers don't send to our server; anyone with the link can see them. Analytics counts draws but never receives names.",
    aPlain:
      "No. The draw runs in your browser and your list stays on this device. A result link carries the winners' names, not your list, after the # sign, which browsers don't send to our server; anyone with the link can see them. Analytics counts draws but never receives names.",
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
      acceptedAnswer: { "@type": "Answer", text: f.aPlain },
    })),
  };

  return (
    <main>
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
          Raffle generator and winner picker
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Paste your entrants or set a ticket number range, choose how many winners you need, and
          press Draw. People with more tickets get more chances, nobody wins twice unless you allow
          it, and you get a draw record to copy, download or print. It&apos;s free, there&apos;s no
          signup, and the draw happens in your browser.
        </p>

        <div className="raffle-tool-wrap mt-6 min-w-0">
          <RaffleMount />
        </div>

        <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to run a raffle draw online
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Add your entries.</span> Paste names
              or ticket numbers, one per line; a spreadsheet column works. Or choose Number range and
              enter your first and last ticket, like 1 to 500, with an optional prefix such as A-.
              One draw holds up to 10,000 tickets.
            </li>
            <li>
              <span className="font-semibold text-foreground">Check the count.</span> The line under
              your list shows names and tickets, like &quot;48 names · 120 tickets&quot;. Check it
              against your sales.
            </li>
            <li>
              <span className="font-semibold text-foreground">Set winners and alternates.</span>{" "}
              Choose up to 100 winners and 20 alternates. Type your prizes in draw order, or leave
              them as 1st prize, 2nd prize and so on.
            </li>
            <li>
              <span className="font-semibold text-foreground">Draw.</span> Show every winner at once,
              or choose One at a time to reveal each prize with a short animation (skipped if your
              device is set to reduce motion).
            </li>
            <li>
              <span className="font-semibold text-foreground">Keep the record.</span> Copy it,
              download it as a text or CSV file, print it, or copy a result link to share the
              winners.
            </li>
          </ol>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Multiple tickets per person
          </h2>
          <p className="mt-3">
            If someone bought several tickets, switch on Multiple tickets per person and add the
            count after their name: Sam x3, Sam *3, or a second spreadsheet column with the number.
            Sam then holds three tickets in the draw and is three times as likely as a one-ticket
            entrant to win each pick. It&apos;s ticket counting, the same as three stubs in a hat.
          </p>
          <p className="mt-3">
            Repeated names work the same way. If your ticket export has one row per ticket, each
            extra line counts as an extra ticket. If your rules say one entry per person, as most
            social media giveaways do, choose One entry per name and repeats are ignored. Capital
            letters and extra spaces don&apos;t make a name different, so add an initial when two
            people share a name.
          </p>
          <p className="mt-3">
            Tickets are numbered down your list: a first line with 3 tickets holds #1 to #3, and the
            next line starts at #4. Each winner shows the ticket that was drawn.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Drawing several winners and alternates
          </h2>
          <p className="mt-3">
            Each pick takes one random ticket from those still in the draw. By default, a winner&apos;s
            other tickets leave with them, so each person can win only once. That&apos;s how most
            prize raffles run, and it means five tickets don&apos;t win five times as many prizes. If
            your rules allow repeat winners, switch off Each person can win only once. Then only the
            winning ticket leaves, and someone with several tickets can win more than one prize.
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
            and the alternates. Copy it, download it as .txt or .csv, or print it for your committee.
            A new draw always gets a new code.
          </p>
          <p className="mt-3">
            The record also shows a list fingerprint, a short code made from your final entry list.
            Publish your list before the draw, and anyone can paste it into this page to check the
            fingerprint matches. That shows the list didn&apos;t change, not how winners were picked.
          </p>
          <p className="mt-3">
            This is a record for transparency, made in your browser. It isn&apos;t a certified,
            audited or legally compliant draw, and ExesTools doesn&apos;t store draws, so we can&apos;t
            confirm a result afterwards. Draw where people can see, or record your screen. Winners
            are picked with your browser&apos;s secure random number generator, and every ticket still
            in the draw has the same chance. Learn more:{" "}
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
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ways to use the raffle generator
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">School and PTA fundraisers.</span> Set
              a range for your ticket books, leave out unsold numbers, and draw every basket prize in
              one go, with alternates for families who&apos;ve gone home.
            </li>
            <li>
              <span className="font-semibold text-foreground">Charity events and galas.</span> Paste
              ticket sales with a count column, so a supporter who bought ten tickets gets ten
              chances. Print the record for your treasurer.
            </li>
            <li>
              <span className="font-semibold text-foreground">Giveaways and streams.</span> Paste
              entrants from your form or comments, choose One entry per name if your rules say so,
              and reveal winners one at a time on screen. Follow each platform&apos;s promotion
              rules.
            </li>
            <li>
              <span className="font-semibold text-foreground">Office parties.</span> Draw door prizes
              from the guest list, and name the prizes so the record reads &quot;Gift card:
              Priya&quot;. For a gift exchange where everyone buys for someone, use the{" "}
              <Link
                href="/secret-santa-generator"
                className="font-semibold text-accent hover:underline"
              >
                Secret Santa generator
              </Link>
              .
            </li>
            <li>
              <span className="font-semibold text-foreground">Clubs and teams.</span> Draw a
              members&apos; prize or the winning 50/50 ticket, then share the result link in your
              group chat.
            </li>
            <li>
              <span className="font-semibold text-foreground">Prize draw at a bingo night.</span> Play
              the games with cards from the{" "}
              <Link
                href="/bingo-card-generator"
                className="font-semibold text-accent hover:underline"
              >
                bingo card generator
              </Link>
              , then draw door prizes here from everyone&apos;s ticket numbers.
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Raffle generator, prize wheel or name picker?
          </h2>
          <p className="mt-3">
            Use this page for a list: hundreds of tickets, people with several tickets each, several
            winners at once, or a record to keep. To spin for one prize at a time on a wheel everyone
            can watch, use the{" "}
            <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
              prize wheel spinner
            </Link>
            . To pick names one by one from a short list, use the{" "}
            <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
              random name picker
            </Link>
            . To call numbers on a wheel, like bingo or 1 to 100, use the{" "}
            <Link href="/random-number-wheel" className="font-semibold text-accent hover:underline">
              random number wheel
            </Link>
            .
          </p>
        </section>

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
    </main>
  );
}
