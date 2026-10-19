import type { Metadata } from "next";
import Link from "next/link";
import { BingoMount } from "@/components/bingo/BingoMount";
import PageMeta from "@/components/PageMeta";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RelatedTools } from "@/components/RelatedTools";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";
import "../styles/bingo-themes.css";

const PAGE_URL = "https://www.exestools.com/bingo-card-generator";
const TITLE = "Bingo Card Generator — Free Printable Cards | ExesTools";
const DESCRIPTION =
  "Free bingo card generator. Make up to 100 unique printable bingo cards from your own words or 1–75 numbers, play on phones, and call the game. No signup.";

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
  "random number wheel": "/random-number-wheel",
};

const FAQ = [
  {
    q: "How many items do I need?",
    a: "A 5×5 card needs 24 items with a FREE square or 25 without. A 4×4 card needs 16 and a 3×3 card needs 8 with FREE. Adding a few more than the minimum makes the cards look more different from each other.",
    aPlain:
      "A 5×5 card needs 24 items with a FREE square or 25 without. A 4×4 card needs 16 and a 3×3 card needs 8 with FREE. Adding a few more than the minimum makes the cards look more different from each other.",
  },
  {
    q: "Are all the cards different?",
    a: "Yes. Every card in a set is checked against the others, and no two match. If your list is too short to make the number of cards you asked for, the tool tells you before it makes any.",
    aPlain:
      "Yes. Every card in a set is checked against the others, and no two match. If your list is too short to make the number of cards you asked for, the tool tells you before it makes any.",
  },
  {
    q: "How many cards can I make at once?",
    a: "Up to 100 cards per set. For a bigger group, make a second set with a new set code. Cards from two sets aren't checked against each other.",
    aPlain:
      "Up to 100 cards per set. For a bigger group, make a second set with a new set code. Cards from two sets aren't checked against each other.",
  },
  {
    q: "Can I get the same cards again later?",
    a: "Yes. Copy the set link, or keep the set code printed on each card. Opening the link rebuilds exactly the same cards in the same order.",
    aPlain:
      "Yes. Copy the set link, or keep the set code printed on each card. Opening the link rebuilds exactly the same cards in the same order.",
  },
  {
    q: "Can I download the bingo cards as a PDF?",
    a: "Yes, through your browser's print window. Press Print cards, then choose Save as PDF as the printer.",
    aPlain:
      "Yes, through your browser's print window. Press Print cards, then choose Save as PDF as the printer.",
  },
  {
    q: "Can players use their phones instead of paper?",
    a: "Yes. Copy a player link for each card. Players tap squares to mark them, and their marks are saved on their own device.",
    aPlain:
      "Yes. Copy a player link for each card. Players tap squares to mark them, and their marks are saved on their own device.",
  },
  {
    q: "Does the caller repeat numbers or words?",
    a: "No. Each item is called once until you start a new game. Undo last call takes back a mis-tap.",
    aPlain:
      "No. Each item is called once until you start a new game. Undo last call takes back a mis-tap.",
  },
  {
    q: "Can I play 90-ball bingo?",
    a: "Not yet. This tool makes 75-ball cards and number cards up to 99. To call numbers 1 to 90, use the [random number wheel] with Min 1 and Max 90.",
    aPlain:
      "Not yet. This tool makes 75-ball cards and number cards up to 99. To call numbers 1 to 90, use the random number wheel with Min 1 and Max 90.",
  },
  {
    q: "Can I add pictures to the squares?",
    a: "Not at the moment. Squares hold short text of up to 40 characters, and emoji work if your device shows them.",
    aPlain:
      "Not at the moment. Squares hold short text of up to 40 characters, and emoji work if your device shows them.",
  },
  {
    q: "Is my list saved?",
    a: "Your list and settings are saved in this browser, so they're still there next time. Press Reset to clear them.",
    aPlain:
      "Your list and settings are saved in this browser, so they're still there next time. Press Reset to clear them.",
  },
  {
    q: "Is this for real-money bingo?",
    a: "No. It's made for classrooms, parties, families and team events. Small prizes like stickers or treats are part of the fun, but it isn't designed for paid or cash games.",
    aPlain:
      "No. It's made for classrooms, parties, families and team events. Small prizes like stickers or treats are part of the fun, but it isn't designed for paid or cash games.",
  },
  {
    q: "What grid size is best for young children?",
    a: "A 3×3 or 4×4 card keeps games short and the squares large. Save 5×5 for older players.",
    aPlain: "A 3×3 or 4×4 card keeps games short and the squares large. Save 5×5 for older players.",
  },
  {
    q: "How do I play several rounds with the same cards?",
    a: "Press New game in the Caller to clear the called list. Players keep their cards and you start the next round.",
    aPlain: "Press New game in the Caller to clear the called list. Players keep their cards and you start the next round.",
  },
  {
    q: "How do I stop players marking squares that weren't called?",
    a: "Use Check a card when someone calls bingo. It compares their card with the called list and highlights every called square.",
    aPlain: "Use Check a card when someone calls bingo. It compares their card with the called list and highlights every called square.",
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

const HASH_HANDOFF = `(function(){try{var h=location.hash;if(/^#[bp]=v1\\./.test(h)){sessionStorage.setItem("exestools.bingo.hash.v1",h);history.replaceState(null,"",location.pathname);}}catch(e){}})();`;

const FEATURE_LIST = [
  "Word bingo from your own list",
  "75-ball B-I-N-G-O number cards",
  "3x3, 4x4 and 5x5 grids with optional FREE center",
  "Up to 100 unique cards per set",
  "Print 2 or 4 cards per page on A4 or Letter",
  "Player card links with tap-to-mark",
  "No-repeat bingo caller",
  "Winning card checker",
];

export default function BingoCardGeneratorPage() {
  const appJsonLd = webAppLd({
    path: "/bingo-card-generator",
    name: "Bingo Card Generator",
    description: DESCRIPTION,
    featureList: FEATURE_LIST,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bingo card generator",
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
    <article>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <script id="bingo-hash-handoff" dangerouslySetInnerHTML={{ __html: HASH_HANDOFF }} />

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
            <li className="text-foreground">Bingo card generator</li>
          </ol>
        </nav>

        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Bingo card generator
        </h1>
        <PageMeta updated="2026-10-19" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Make printable bingo cards from your own word list or classic 1–75 numbers. Choose a 3×3,
          4×4 or 5×5 grid, add a FREE center square, and make up to 100 different cards in one set.
          Print two or four cards per page, or send each player a link to their own card and mark
          squares on a phone. A built-in caller draws without repeats and a card checker confirms a
          bingo. It&apos;s free, there&apos;s no signup, and everything runs in your browser.
        </p>

        <div className="mt-6 min-w-0">
          <BingoMount />
        </div>

        <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to make bingo cards
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              Pick <strong className="font-semibold text-foreground">Words</strong> to use your own
              list, <strong className="font-semibold text-foreground">75-ball</strong> for classic
              B-I-N-G-O number cards, or{" "}
              <strong className="font-semibold text-foreground">Numbers</strong> for a short 1-to-20
              or 1-to-30 game. You can also load a theme such as Baby shower, Christmas or Sight
              words and edit it.
            </li>
            <li>
              Type or paste one item per line. Repeated lines are skipped, and the counter tells you
              how many items a card needs: 24 for a 5×5 card with a FREE square, 16 for 4×4, and 8
              for 3×3 with FREE.
            </li>
            <li>
              Choose the grid size, the FREE square, and how many cards you need (1 to 100). Add a
              title and an optional line such as the date or the class name.
            </li>
            <li>
              Press <strong className="font-semibold text-foreground">Make cards</strong>. Every card
              in the set is different and carries a card number and a set code.
            </li>
            <li>
              Press <strong className="font-semibold text-foreground">Print cards</strong>, or copy a
              player link for each person. Keep the caller open on your own screen to run the game.
            </li>
          </ol>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Print bingo cards at home
          </h2>
          <p className="mt-3">
            Printing uses your browser&apos;s own print window, so there&apos;s nothing to download
            first. Pick A4 or Letter and two or four cards per page. Two per page gives big squares
            that young children and older players can read across a table; four per page saves paper
            for a large group. Only the cards print: the page header, buttons and tips are hidden,
            and each card keeps a dark border so it&apos;s easy to cut.
          </p>
          <p className="mt-3">
            To save the set as a PDF, choose Save as PDF (or Microsoft Print to PDF) as the printer
            in that window. Keep the scale at 100% or &quot;Default&quot; so the cards aren&apos;t
            shrunk, and turn off headers and footers if your browser adds a page address at the top.
            Card stock lasts longer than plain paper, and a card in a plastic sleeve works with a
            dry-erase marker for many games. Coins, buttons or dried beans make good markers.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Play bingo online with player links
          </h2>
          <p className="mt-3">
            Not everyone has a printer, and some games happen on a video call. After you make a set,
            open <strong className="font-semibold text-foreground">Player links</strong> and copy the
            link for card 1, card 2 and so on. Each person opens their link and sees only their card.
            Tapping a square marks it, and tapping again clears it. The marks are saved in that phone
            or browser, so a refresh doesn&apos;t lose them.
          </p>
          <p className="mt-3">
            Player links rebuild the card from the set code inside the link, so nothing is stored on
            a server. That also means anyone who has a link can see that card. Send each link to one
            person, and keep a note of who has which card number.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to call a bingo game
          </h2>
          <p className="mt-3">
            Open <strong className="font-semibold text-foreground">Caller</strong> under the cards.
            Press <strong className="font-semibold text-foreground">Call next</strong> and the caller
            picks an item that hasn&apos;t come up yet, shows it in large type and adds it to the
            called list. Nothing repeats until you press{" "}
            <strong className="font-semibold text-foreground">New game</strong>. If you tap twice by
            mistake, <strong className="font-semibold text-foreground">Undo last call</strong> puts
            the item back.{" "}
            <strong className="font-semibold text-foreground">Copy called list</strong> copies every
            call in order, which is handy for posting in a meeting chat or checking a claim later.
          </p>
          <p className="mt-3">
            For number games the caller shows the column letter, like B 7 or O 68, so players know
            which column to look in. Read each call clearly, say it twice, and pause long enough for
            everyone to look. If you&apos;d like a spinning wheel on a projector instead, the{" "}
            <Link
              href="/random-number-wheel"
              className="font-semibold text-accent hover:underline"
            >
              random number wheel
            </Link>{" "}
            has a 1–75 bingo setting with no repeats.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Winning patterns and checking a card
          </h2>
          <p className="mt-3">Agree on the pattern before the first call. The common ones are:</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Line:</span> any full row, column or
              diagonal. The quickest game.
            </li>
            <li>
              <span className="font-semibold text-foreground">Four corners:</span> the four corner
              squares. Good for a fast warm-up round.
            </li>
            <li>
              <span className="font-semibold text-foreground">Full card (blackout):</span> every
              square. The longest game, and a nice final round.
            </li>
          </ul>
          <p className="mt-3">
            When someone calls &quot;Bingo!&quot;, type their card number into{" "}
            <strong className="font-semibold text-foreground">Check a card</strong> and choose the
            pattern. The checker compares the card with the called list and says whether it wins, and
            which line it found. The FREE square always counts as marked. It also shows the card with
            every called square highlighted, so if a player marked a square too early, you can both
            see which one, and honest mix-ups are settled quickly.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Classroom bingo</h2>
          <p className="mt-3">
            Use the <strong className="font-semibold text-foreground">Sight words (K–1)</strong>{" "}
            theme or paste this week&apos;s vocabulary, and pick 4×4 for short rounds. Read a
            definition instead of the word for older students. List lengths, round timing and math
            variations are in{" "}
            <Link
              href="/guides/bingo-games-for-classrooms-and-parties"
              className="font-semibold text-accent hover:underline"
            >
              bingo game ideas for classrooms and parties
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Party, shower and office bingo
          </h2>
          <p className="mt-3">
            Load the Baby shower or Christmas theme and edit it, or paste your own list of meeting
            phrases. Swap in the guest of honor&apos;s name, the office in-jokes, or this year&apos;s
            party menu. A theme only works if the players recognize the squares, so cut anything your
            group wouldn&apos;t say out loud. For an office call, send each colleague their player
            link before the meeting starts and run the caller on your shared screen.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            75-ball number bingo rules
          </h2>
          <p className="mt-3">
            The classic American game uses 75 numbers on a 5×5 card. Each column has its own range: B
            holds 1–15, I holds 16–30, N holds 31–45, G holds 46–60 and O holds 61–75. Every card has
            five numbers per column, listed smallest to largest, and the center of the N column is
            usually a FREE square. The caller draws numbers one at a time with their letter, and
            players cover matching numbers. The first player to complete the agreed pattern calls
            &quot;Bingo!&quot; and the caller checks the card. Then press{" "}
            <strong className="font-semibold text-foreground">New game</strong> to clear the called
            list and play the next round with the same cards.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How a card set is made
          </h2>
          <p className="mt-3">
            You give the generator a list of words or numbers and pick a grid size. It builds every card in
            the set from that list, shuffling the items differently each time and checking that no two cards
            match. You can make up to 100 cards in one set. Each card gets its own number, and each player
            can get their own{" "}
            <span className="font-semibold text-foreground">player link</span>{" "}
            that shows only their card on a phone, where tapping a square marks it.
          </p>
          <p className="mt-3">
            Everything happens in your browser. It&apos;s free, and nobody needs an account.
          </p>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Worked example: a vocabulary game for 28 students
          </h2>
          <p className="mt-3">
            A teacher wants a quick review of 30 words before a test.
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              Choose{" "}
              <span className="font-semibold text-foreground">Words</span>
              , paste the 30 terms, and pick{" "}
              <span className="font-semibold text-foreground">4×4</span>
              . A 4×4 card needs 16 items, so 30 gives plenty of variety between cards.
            </li>
            <li>
              Set the number of cards to 28 and press{" "}
              <span className="font-semibold text-foreground">Make cards</span>
              . Every card is different.
            </li>
            <li>
              Print four per page to save paper, or send player links to students with devices.
            </li>
            <li>
              Open the{" "}
              <span className="font-semibold text-foreground">Caller</span>{" "}
              and read a definition for each word it calls, not the word itself. Students have to work out the
              answer before they can mark it.
            </li>
            <li>
              When someone calls bingo, type their card number into{" "}
              <span className="font-semibold text-foreground">Check a card</span>
              .
            </li>
          </ol>
          <p className="mt-3">
            Because the list has 30 words and each card shows only 16, cards differ enough that wins
            don&apos;t arrive in a big rush.
          </p>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Tips
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Add more items than the minimum.</span>{" "}
              It makes the cards more varied and the game less predictable.
            </li>
            <li>
              <span className="font-semibold text-foreground">Agree on the winning pattern before the first call.</span>
            </li>
            <li>
              <span className="font-semibold text-foreground">Keep the set link</span>{" "}
              if you&apos;ll want the same cards again later.
            </li>
            <li>
              <span className="font-semibold text-foreground">Give each player link to one person only.</span>{" "}
              Anyone with the link can see that card.
            </li>
          </ul>
        </section>

        <div className="mt-10">
          <RelatedLinks toolId="bingo-card-generator" />
        </div>

        <section className="mt-10 max-w-3xl" aria-labelledby="bingo-faq">
          <h2 id="bingo-faq" className="text-2xl font-bold tracking-tight text-foreground">
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
          <RelatedTools toolId="bingo-card-generator" />
        </div>

        <p className="mt-6 max-w-3xl text-sm text-muted">
          For fun at home, in class and at parties. Not for real-money games.
        </p>
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
    </article>
  );
}
