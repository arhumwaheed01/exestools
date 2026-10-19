import type { Metadata } from "next";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { RelatedLinks } from "@/components/RelatedLinks";
import { RelatedTools } from "@/components/RelatedTools";
import { SecretSantaMount } from "@/components/secret-santa/SecretSantaMount";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph, webAppLd } from "@/lib/seo/jsonld";

const PAGE_URL = "https://www.exestools.com/secret-santa-generator";
const TITLE = "Secret Santa Generator — Exclusions, No Email | ExesTools";
const DESCRIPTION =
  "Free Secret Santa generator with exclusions for couples. Draw names in your browser, then send private links by text, WhatsApp or email. No signup.";

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
  "random name picker": "/random-name-picker",
  "Privacy Policy": "/privacy-policy",
  "How ExesTools draws names": "/about#how-it-works",
};

const FAQ = [
  {
    q: "Is this Secret Santa generator free?",
    a: "Yes. It's free with no account or signup, and nobody needs to give an email address. It runs in your browser, so there's nothing to install.",
    aPlain:
      "Yes. It's free with no account or signup, and nobody needs to give an email address. It runs in your browser, so there's nothing to install.",
  },
  {
    q: "How does a Secret Santa generator work?",
    a: "You add everyone's name and any exclusions, then press Draw names. The generator shuffles the group so that everyone gets exactly one person to buy for, nobody draws themselves, and every exclusion is respected. Each person then opens their own private link to see their match.",
    aPlain:
      "You add everyone's name and any exclusions, then press Draw names. The generator shuffles the group so that everyone gets exactly one person to buy for, nobody draws themselves, and every exclusion is respected. Each person then opens their own private link to see their match.",
  },
  {
    q: "Does it send emails to participants?",
    a: "No. ExesTools doesn't collect email addresses or send messages. You copy each person's private link and send it yourself, by text, chat, or your own email.",
    aPlain:
      "No. ExesTools doesn't collect email addresses or send messages. You copy each person's private link and send it yourself, by text, chat, or your own email.",
  },
  {
    q: "Can I send Secret Santa names by WhatsApp or text message?",
    a: "Yes. Copy each person's private link and send it in WhatsApp, a text message or any chat app. ExesTools doesn't need phone numbers or emails, and it doesn't send messages itself.",
    aPlain:
      "Yes. Copy each person's private link and send it in WhatsApp, a text message or any chat app. ExesTools doesn't need phone numbers or emails, and it doesn't send messages itself.",
  },
  {
    q: "How do I stop couples from drawing each other?",
    a: "Add an exclusion: pick both names and choose Neither draws the other. Use One-way if only one person should be blocked from drawing the other.",
    aPlain:
      "Add an exclusion: pick both names and choose Neither draws the other. Use One-way if only one person should be blocked from drawing the other.",
  },
  {
    q: "How many people do I need for Secret Santa?",
    a: "At least 3. This generator handles up to 50 people in one draw.",
    aPlain: "At least 3. This generator handles up to 50 people in one draw.",
  },
  {
    q: "Does Secret Santa work with an odd number of people?",
    a: "Yes. Everyone gives one gift and gets one gift, so any group of 3 or more works. Only exclusions can block a draw in a small group.",
    aPlain:
      "Yes. Everyone gives one gift and gets one gift, so any group of 3 or more works. Only exclusions can block a draw in a small group.",
  },
  {
    q: "Why does it say no valid draw is possible?",
    a: "Your exclusions leave too few options for the group size; three people where two are a couple can't work, for example. The message names the people who are stuck. Remove one of their exclusions or add another person.",
    aPlain:
      "Your exclusions leave too few options for the group size; three people where two are a couple can't work, for example. The message names the people who are stuck. Remove one of their exclusions or add another person.",
  },
  {
    q: "Can the organizer see who has whom?",
    a: "Only if they choose to. Matches stay hidden until you switch on Show all matches. Links are scrambled, not encrypted, so anyone holding a link, including the organizer, can open it.",
    aPlain:
      "Only if they choose to. Matches stay hidden until you switch on Show all matches. Links are scrambled, not encrypted, so anyone holding a link, including the organizer, can open it.",
  },
  {
    q: "How do I draw names for Secret Santa remotely?",
    a: "Add everyone on this page, press Draw names, then send each person their private reveal link by text, WhatsApp, chat or email. They open it from anywhere and only see who they're buying for. Agree on a shipping deadline in the event note.",
    aPlain:
      "Add everyone on this page, press Draw names, then send each person their private reveal link by text, WhatsApp, chat or email. They open it from anywhere and only see who they're buying for. Agree on a shipping deadline in the event note.",
  },
  {
    q: "Can I run Secret Santa for a remote or long-distance group?",
    a: "Yes. Draw names online here, then send each link privately in chat or email. People open their own link from anywhere. Agree on a shipping deadline in the event note.",
    aPlain:
      "Yes. Draw names online here, then send each link privately in chat or email. People open their own link from anywhere. Agree on a shipping deadline in the event note.",
  },
  {
    q: "Is there a wish list?",
    a: "No. ExesTools doesn't collect wish lists. Use the note in Event details to ask people to share gift ideas, or to set a theme.",
    aPlain:
      "No. ExesTools doesn't collect wish lists. Use the note in Event details to ask people to share gift ideas, or to set a theme.",
  },
  {
    q: "Are the names uploaded anywhere?",
    a: "No. The draw runs in your browser and your list is saved only on this device. Names inside links sit after the # sign, which browsers don't send to our server. Analytics counts draws and reveals but never receives names.",
    aPlain:
      "No. The draw runs in your browser and your list is saved only on this device. Names inside links sit after the # sign, which browsers don't send to our server. Analytics counts draws and reveals but never receives names.",
  },
  {
    q: "What happens if I redraw?",
    a: "You get new matches, new links and a new draw code. Links you already sent still show the old matches, so send everyone their new link.",
    aPlain:
      "You get new matches, new links and a new draw code. Links you already sent still show the old matches, so send everyone their new link.",
  },
  {
    q: "Can I use it for White Elephant?",
    a: "Not really. In White Elephant (also called a Yankee swap), nobody is assigned a person; players take turns picking or stealing gifts. For a random turn order, use the [random name picker] with remove-winner on.",
    aPlain:
      "Not really. In White Elephant (also called a Yankee swap), nobody is assigned a person; players take turns picking or stealing gifts. For a random turn order, use the random name picker with remove-winner on.",
  },
  {
    q: "Can I stop people drawing the same person as last year?",
    a: "Yes. Add a one-way exclusion: if Sam shouldn't draw Alex because they had Alex last year, block Sam from drawing Alex. Alex can still draw Sam unless you block that too. The generator doesn't remember past years—you add the rule each time you run a new draw.",
    aPlain:
      "Yes. Add a one-way exclusion: if Sam shouldn't draw Alex because they had Alex last year, block Sam from drawing Alex. Alex can still draw Sam unless you block that too. The generator doesn't remember past years—you add the rule each time you run a new draw.",
  },
  {
    q: "How do I keep people in the same household apart?",
    a: "Add a two-way exclusion (Neither draws the other) for each pair who live together—partners, siblings, or housemates—so nobody buys for someone in their own household. In bigger families you may need several exclusions, one per pair.",
    aPlain:
      "Add a two-way exclusion (Neither draws the other) for each pair who live together—partners, siblings, or housemates—so nobody buys for someone in their own household. In bigger families you may need several exclusions, one per pair.",
  },
  {
    q: "What if someone loses their Secret Santa link?",
    a: "The organizer can resend it. Copy all links, Download and Print keep a full list of everyone's links, so keep that copy somewhere private.",
    aPlain: "The organizer can resend it. Copy all links, Download and Print keep a full list of everyone's links, so keep that copy somewhere private.",
  },
  {
    q: "Can I reuse last year's group?",
    a: "Yes. Your list and settings are saved in this browser. Run a new draw and add one-way exclusions so nobody draws the same person as last year.",
    aPlain: "Yes. Your list and settings are saved in this browser. Run a new draw and add one-way exclusions so nobody draws the same person as last year.",
  },
  {
    q: "What should I put in the event note?",
    a: "The things people forget: the exchange date, a shipping deadline for remote people, \"wrap and label it,\" and any theme or gift ideas.",
    aPlain: "The things people forget: the exchange date, a shipping deadline for remote people, \"wrap and label it,\" and any theme or gift ideas.",
  },
  {
    q: "Can two people organize the same Secret Santa?",
    a: "Yes. Copy setup link sends the names and exclusions to a co-organizer without the results, so neither of you has to see the matches.",
    aPlain: "Yes. Copy setup link sends the names and exclusions to a co-organizer without the results, so neither of you has to see the matches.",
  },
  {
    q: "How many exclusions can I add?",
    a: "As many as your group can handle. The more you add, the fewer valid draws remain, and the generator tells you if none are left.",
    aPlain: "As many as your group can handle. The more you add, the fewer valid draws remain, and the generator tells you if none are left.",
  },
  {
    q: "Does the draw work for an odd number of people?",
    a: "Yes. Each person buys for one other person, so any group of three or more works, odd or even.",
    aPlain: "Yes. Each person buys for one other person, so any group of three or more works, odd or even.",
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

const HASH_HANDOFF = `(function(){try{var m=/^#(r|s)=([A-Za-z0-9_-]{6,12000})$/.exec(location.hash);if(!m)return;sessionStorage.setItem("exestools.secretsanta.hash.v1",JSON.stringify({k:m[1],t:m[2]}));history.replaceState(history.state,"",location.pathname+location.search)}catch(e){}})();`;

export default function SecretSantaGeneratorPage() {
  const appJsonLd = webAppLd({
    path: "/secret-santa-generator",
    name: "Secret Santa Generator",
    description: DESCRIPTION,
    featureList: [
      "Exclusions",
      "Private reveal links",
      "No email needed",
      "Up to 50 names",
    ],
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Secret Santa generator",
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
        <script id="ss-hash-handoff" dangerouslySetInnerHTML={{ __html: HASH_HANDOFF }} />

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
            <li className="text-foreground">Secret Santa generator</li>
          </ol>
        </nav>

        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Secret Santa generator with exclusions
        </h1>
        <PageMeta updated="2026-10-20" />
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          Draw names online for Secret Santa—remotely or in the same room. Add everyone&apos;s name,
          mark any couples who shouldn&apos;t draw each other, and press Draw names. Each person gets
          their own private link that shows only who they&apos;re buying for. It&apos;s free, nobody
          needs an account or an email address, and the draw happens in your browser. For rules,
          budgets and dropouts, see{" "}
          <Link
            href="/guides/secret-santa-rules-and-budget-ideas"
            className="font-semibold text-accent hover:underline"
          >
            Secret Santa rules and gift exchange ideas
          </Link>
          .
        </p>
        <div className="ss-tool-wrap mt-6 min-w-0">
          <SecretSantaMount />
        </div>

        <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            How to draw names for Secret Santa
          </h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Add names.</span> Type a name and press
              Add, or choose Paste a list to add many at once, one per line. You need at least 3
              people and can add up to 50. Each name must be unique (capital letters don&apos;t count
              as different), so add an initial if two people share a name, like &quot;Sam K.&quot;
              and &quot;Sam P.&quot;
            </li>
            <li>
              <span className="font-semibold text-foreground">Add exclusions (optional).</span> Pick
              two people and choose Neither draws the other for couples, or One-way when only one
              direction matters.
            </li>
            <li>
              <span className="font-semibold text-foreground">Add event details (optional).</span> The
              event name, budget, exchange date and a short note appear on every person&apos;s
              reveal.
            </li>
            <li>
              <span className="font-semibold text-foreground">Press Draw names.</span> Everyone gets
              exactly one person to buy for, nobody draws themselves, and every exclusion is
              respected.
            </li>
            <li>
              <span className="font-semibold text-foreground">Send the links.</span> Press Copy link
              next to each name and send it to that person privately, by text, chat or your own
              email. Copy all links, Download and Print keep a full list for your records.
            </li>
            <li>
              <span className="font-semibold text-foreground">Open and reveal.</span> Each person
              opens their link and taps Reveal to see &quot;You&apos;re buying for…&quot;, plus the
              budget, date and note. Nobody else&apos;s match is shown.
            </li>
          </ol>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How exclusions work</h2>
          <p className="mt-3">
            An exclusion stops one specific draw. Two-way (Neither draws the other) suits couples,
            housemates and anyone who already swaps gifts. One-way blocks a single direction: if Sam
            can&apos;t draw Alex, Alex can still draw Sam. Use it when someone drew the same person
            last year.
          </p>
          <p className="mt-3">
            Every exclusion removes options, and small groups run out fast. With three people, one
            couple makes the draw impossible: both partners could only draw the third person, and
            nobody can be drawn twice. The generator checks whether any valid draw exists before it
            starts. If none does, it names the people who are stuck so you can remove an exclusion or
            add someone. Learn more:{" "}
            <Link
              href="/about#how-it-works"
              className="font-semibold text-accent hover:underline"
            >
              How ExesTools draws names
            </Link>
            .
          </p>
          <p className="mt-3">
            Single loop is off by default. Turn it on to put everyone in one chain: Ava buys for Ben,
            Ben buys for Cal, and so on until the last person buys for Ava. Nobody ends up in a pair
            buying for each other. It&apos;s stricter, so a long list of exclusions can make a single
            loop impossible even when a normal draw works. If that happens, switch it off.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Private reveal links, not emails
          </h2>
          <p className="mt-3">
            ExesTools has no accounts and doesn&apos;t keep your lists on a server, so there&apos;s
            nothing to email from. Instead, each person&apos;s match is packed into the part of their
            link after the # sign. Browsers don&apos;t send that part to our server, and chat apps
            that preview links only see the general Secret Santa page, never the name. When the page
            opens, it moves the match out of the address bar and keeps it in that browser tab.
          </p>
          <p className="mt-3">
            The match inside a link is scrambled so it can&apos;t be read at a glance. That&apos;s
            obfuscation, not encryption: anyone who has the link can open it, and someone determined
            could decode it. Treat each link like a folded slip of paper and send it only to the
            person it&apos;s for.
          </p>
          <p className="mt-3">
            The organizer can see the results if they choose to. Show all matches stays off until you
            switch it on, so you can join your own draw without spoiling it. Your list and latest draw
            are saved only in this browser; Reset clears them. Copy setup link sends the names and
            exclusions, but not the results, to a co-organizer. See our{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Send Secret Santa names by text or WhatsApp
          </h2>
          <p className="mt-3">
            After you press Draw names, each person gets their own private link. Press Copy link next
            to a name and paste it into a text message, WhatsApp, Messenger, Slack or your own email.
            Send each link only to the person it belongs to. When they open it and tap Reveal, they
            see who they&apos;re buying for, plus the budget, date and note you added. Nobody
            else&apos;s match is shown. ExesTools never asks for phone numbers or email addresses and
            never sends messages for you.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Kris Kringle, office and family gift exchanges
          </h2>
          <p className="mt-3">
            The same draw works for a Kris Kringle in Australia or New Zealand, an office Secret
            Santa, a family exchange or a class gift swap. Add up to 50 people. Use exclusions so
            partners, housemates or siblings don&apos;t draw each other, and put the spending limit
            and exchange date in Event details so everyone sees the same rules. For a remote team,
            send the links in your team chat as direct messages. Everyone opens their own link,
            wherever they are.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Secret Santa with an odd number of people
          </h2>
          <p className="mt-3">
            Odd numbers are fine. Everyone buys one gift and receives one gift whether you have 5
            people or 11, because each person is assigned someone to buy for. Nobody has to be split
            into pairs. You need at least 3 people. Exclusions are what can make a draw impossible in
            a small group. If that happens, the page tells you who is stuck so you can remove an
            exclusion or add someone.
          </p>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ways to use the Secret Santa generator
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              It works for any exchange where each person buys for one other person, including Kris
              Kringle, as it&apos;s often called in Australia.
            </li>
            <li>
              <span className="font-semibold text-foreground">Office Secret Santa.</span> Paste the
              team from a spreadsheet, set a budget and the party date, then message each colleague
              their link. Nobody hands over an email address.
            </li>
            <li>
              <span className="font-semibold text-foreground">Family gift exchange.</span> Add a
              two-way exclusion for each couple so nobody draws their partner. In bigger families,
              exclude people who live in the same house too, so gifts cross households.
            </li>
            <li>
              <span className="font-semibold text-foreground">Friends.</span> Run the draw, then send
              each link in a private message, not the group chat. Use the note for the plan:
              &quot;Gifts open at Jess&apos;s on the 20th.&quot;
            </li>
            <li>
              <span className="font-semibold text-foreground">Remote and hybrid teams.</span> Everyone
              opens their link on their own device, wherever they are. Put a shipping deadline in the
              note so gifts arrive before a video-call reveal.
            </li>
            <li>
              <span className="font-semibold text-foreground">Classrooms.</span> No student accounts
              are needed. With younger students, switch on Show all matches and print assignment slips
              to hand out; older students can get links. Follow your school&apos;s policy on student
              names; first names or initials are enough.
            </li>
            <li>
              <span className="font-semibold text-foreground">Holiday party games.</span> After the
              name draw, play a round of Christmas bingo: the{" "}
              <Link
                href="/bingo-card-generator"
                className="font-semibold text-accent hover:underline"
              >
                bingo card generator
              </Link>{" "}
              has a ready-made Christmas list you can edit and print.
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Tips for a smoother gift exchange
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Set a budget range.</span>{" "}
              {'"$20–$30"'} or {'"£15–£20"'} sets clearer expectations than a maximum alone.
              The budget field is free text, so use your own currency.
            </li>
            <li>
              <span className="font-semibold text-foreground">Give budget ideas.</span> For small
              budgets, suggest a theme instead of a price: a favorite book, a local treat, something
              homemade or something cozy. A theme stops everyone from defaulting to a gift card.
            </li>
            <li>
              <span className="font-semibold text-foreground">Use the note for house rules.</span> Wrap
              and label gifts, a shipping deadline, or &quot;no joke gifts&quot;.
            </li>
            <li>
              <span className="font-semibold text-foreground">
                Don&apos;t paste the full list into a group chat.
              </span>{" "}
              Copy all links includes everyone&apos;s link. Send links one by one.
            </li>
            <li>
              <span className="font-semibold text-foreground">Redraw with care.</span> Each link
              carries its own result, so links sent before a redraw still show the old matches. Every
              reveal shows a short draw code; after a redraw, ask everyone to check theirs matches.
            </li>
          </ul>
        </section>

        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            What the draw actually does
          </h2>
          <p className="mt-3">
            When you press{" "}
            <span className="font-semibold text-foreground">Draw names</span>
            , the generator assigns each person exactly one other person to buy for. Nobody can draw
            themselves, everyone gives one gift and receives one gift, and every exclusion you set is
            respected. Before it starts, it checks that a valid draw exists. If your exclusions make one
            impossible, it tells you which people are stuck.
          </p>
          <p className="mt-3">
            Each person then gets a{" "}
            <span className="font-semibold text-foreground">private link</span>{" "}
            that shows only their own match, plus the budget, date and note you added. You send the links
            yourself, by text, chat or your own email. Nobody needs an account or an email address, and your
            list stays in your browser.
          </p>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Exchanges it fits
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Families that span households:</span>{" "}
              exclusions keep partners and housemates from drawing each other, so gifts cross between homes.
            </li>
            <li>
              <span className="font-semibold text-foreground">Friend groups in different cities:</span>{" "}
              everyone opens their link wherever they are, and the note holds the shipping deadline.
            </li>
            <li>
              <span className="font-semibold text-foreground">Clubs and teams:</span>{" "}
              a member gift swap at the end-of-season dinner.
            </li>
            <li>
              <span className="font-semibold text-foreground">Classrooms:</span>{" "}
              a class swap with a small budget, run by the teacher.
            </li>
          </ul>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Worked example: a family of nine
          </h2>
          <p className="mt-3">
            Nine people: two couples, a parent, and four adult cousins, two of whom share an apartment.
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-5">
            <li>
              Add all nine names.
            </li>
            <li>
              Add three two-way exclusions: one for each couple, and one for the two cousins who live
              together.
            </li>
            <li>
              Last year Priya had Dev. Add a one-way exclusion so Priya can&apos;t draw Dev again. Dev can
              still draw Priya.
            </li>
            <li>
              Event details: &quot;Family Secret Santa,&quot; budget &quot;$30–$40,&quot; date &quot;December
              24,&quot; note &quot;Gifts under the tree by 6 p.m.&quot;
            </li>
            <li>
              Press{" "}
              <span className="font-semibold text-foreground">Draw names</span>
              , then send each person their link privately.
            </li>
          </ol>
          <p className="mt-3">
            With nine people and four exclusions, there are still plenty of valid draws, so it works first
            time. In a group of four with the same number of exclusions, it might not, and the page would
            tell you who&apos;s stuck.
          </p>
        </section>
        <section className="mt-10 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Tips
          </h2>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              <span className="font-semibold text-foreground">Send links one by one.</span>{" "}
              Never paste them all into a group chat.
            </li>
            <li>
              <span className="font-semibold text-foreground">Keep a private copy of all links</span>{" "}
              in case someone loses theirs.
            </li>
            <li>
              <span className="font-semibold text-foreground">Use the note for the important rules:</span>{" "}
              wrap and label, a shipping deadline, or &quot;no gift cards.&quot;
            </li>
            <li>
              <span className="font-semibold text-foreground">Add exclusions sparingly.</span>{" "}
              Each one removes options. Use them for couples and repeats, not mild preferences.
            </li>
            <li>
              <span className="font-semibold text-foreground">Need a co-organizer?</span>{" "}
              Copy setup link sends the names and exclusions, but not the results.
            </li>
          </ul>
        </section>

        <div className="mt-10">
          <RelatedLinks toolId="secret-santa-generator" />
        </div>

        <section className="mt-10 max-w-3xl" aria-labelledby="ss-faq">
          <h2 id="ss-faq" className="text-2xl font-bold tracking-tight text-foreground">
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
          <RelatedTools toolId="secret-santa-generator" />
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
