# DEV-TASKS: where each content piece goes

Content written 2026-10-13 for the AdSense rejection fix (see `../PLAN.md`, TASKs 1, 3, 4, 5, 6, 8). Everything here is paste-ready Markdown. File paths in the repo (`app/…`, `components/…`, `content/…`) follow the Next.js App Router layout implied by the plan. Adjust them if the repo differs.

## 0. Before anything ships

1. **Resolve every `[ARHUM: fill]` / `[ARHUM: confirm]` marker.** They are all in `site-pages/about-page.md` (photo, background sentence, LinkedIn, GitHub, paid-placements line, changelog dates). Don't deploy a page with a marker still in it.
   `rg -n "\[ARHUM:" content/` must return nothing in the deployed copy.
2. **Replace every `[SCREENSHOT: …]` marker with a real capture** of the live tool (own screenshots, no stock images). Save as `public/guides/<slug>/<n>.webp` (guides) or `public/tools/<route>/<n>.webp` (tool pages), max 1600px wide, with descriptive `alt` text based on the marker text. Use `next/image` with width/height set. Each guide has 2–3 markers; each tool rewrite has 1.
3. **Location line.** "Based in Karachi, Pakistan" on the About page comes from the brief, not the live site. Arhum, confirm you want the city shown.
4. **Check in the UI before publishing** (these weren't visible in the server-rendered HTML, so they're written conservatively, but please check them):
   - Opening a `Copy share link` URL on `/classroom-spinner` loads that roster (the "one wheel per class" bookmark workflow depends on it).
   - The Secret Santa, raffle, team and bingo controls named in the guides (Single loop, Show all matches, Copy all links, Draw another alternate, Leave one person out, Player links, Check a card, Undo last call) still have exactly those labels.

## 1. File map

| Content file | Route | Goes into | Notes |
|---|---|---|---|
| `guides/how-to-run-a-fair-online-giveaway.md` | `/guides/how-to-run-a-fair-online-giveaway` | `content/guides/how-to-run-a-fair-online-giveaway.mdx` | Links: /prize-wheel, /raffle-generator, /random-name-picker |
| `guides/cold-calling-students-fairly.md` | `/guides/cold-calling-students-fairly` | `content/guides/cold-calling-students-fairly.mdx` | Links: /classroom-spinner, /random-team-generator, /random-name-picker |
| `guides/secret-santa-rules-and-budget-ideas.md` | `/guides/secret-santa-rules-and-budget-ideas` | `content/guides/secret-santa-rules-and-budget-ideas.mdx` | Links: /secret-santa-generator, /random-name-picker, /bingo-card-generator |
| `guides/how-to-make-balanced-random-teams.md` | `/guides/how-to-make-balanced-random-teams` | `content/guides/how-to-make-balanced-random-teams.mdx` | Links: /random-team-generator, /random-name-picker, /classroom-spinner, /secret-santa-generator |
| `guides/how-random-is-a-spinner-wheel.md` | `/guides/how-random-is-a-spinner-wheel` | `content/guides/how-random-is-a-spinner-wheel.mdx` | Links: /, /yes-no-wheel, /random-number-wheel, /random-team-generator, /raffle-generator. Linked from homepage block and About |
| `guides/bingo-games-for-classrooms-and-parties.md` | `/guides/bingo-games-for-classrooms-and-parties` | `content/guides/bingo-games-for-classrooms-and-parties.mdx` | Links: /bingo-card-generator, /random-number-wheel, /classroom-spinner, /raffle-generator |
| `site-pages/guides-hub-intro.md` | `/guides` | `app/guides/page.tsx` | Intro above a card list of published guides, newest first |
| `tool-pages/random-number-wheel-rewrite.md` | `/random-number-wheel` | `app/random-number-wheel/page.tsx` (or its content component) | Insert after "Pick a number from 1 to 100", before the FAQ. Append 4 FAQs to the existing FAQ list and to its FAQPage JSON-LD |
| `tool-pages/classroom-spinner-rewrite.md` | `/classroom-spinner` | `app/classroom-spinner/page.tsx` | Insert after "A 5-minute cold-call routine that stays fair", before "Privacy for schools". Put the 4 new FAQs at the top of the FAQ list and in JSON-LD. Render the routine card (blockquote) as a styled `<aside>` with a "Print this card" note; no new print feature needed, it's text |
| `tool-pages/yes-no-wheel-decision-section.md` | `/yes-no-wheel` | `app/yes-no-wheel/page.tsx` | New H2 after "When a yes-or-no spin helps". In the same deploy, trim filler so the page doesn't grow by padding (suggestions are in the file's frontmatter) |
| `site-pages/homepage-block.md` | `/` | `app/page.tsx` | Server-rendered block above "Which ExesTools tool should I use?", followed by the "Latest guides" list (only published guides) |
| `site-pages/about-page.md` | `/about` | `app/about/page.tsx` | Replaces the main content. Keep `id="how-it-works"` on that H2 (it is linked from every tool page). Add `id="arhum"` to the author H2 (the `{#…}` suffixes in the Markdown mark the ids; strip them from the visible text) |

Strip each file's YAML frontmatter before rendering; use it for metadata only. On the guides, the literal line "By Arhum Waheed · Published … · Updated …" is there for paste-ready copies. If you render the byline with the component below, delete that line from the MDX so it doesn't appear twice.

## 2. Guides section (PLAN TASK 1)

- `app/guides/page.tsx`: hub. Static (SSG). `export const metadata` from `guides-hub-intro.md` frontmatter. Canonical `https://www.exestools.com/guides`.
- `app/guides/[slug]/page.tsx`: `generateStaticParams()` from `content/guides/*.mdx`; `dynamicParams = false` so unknown slugs 404. `generateMetadata()` reads `meta_title` → `title`, `meta_description` → `description`, canonical `https://www.exestools.com/guides/<slug>`, `openGraph.type = "article"`, `publishedTime`, `modifiedTime`, `authors`.
- Server-render the full article body. No client-only content.
- Each guide's FAQ renders visibly as H3 + paragraph (it already is), so FAQPage JSON-LD is allowed on guides.
- Add a "Related tools" box at the end of each guide from `related_tools` in frontmatter.

### Rollout schedule (don't publish all six in one day)

| Week | Publish | Set `published` to |
|---|---|---|
| Tue 13 Oct 2026 | how-random-is-a-spinner-wheel, how-to-run-a-fair-online-giveaway | 2026-10-13 |
| Tue 20 Oct 2026 | cold-calling-students-fairly, how-to-make-balanced-random-teams | 2026-10-20 |
| Tue 27 Oct 2026 | secret-santa-rules-and-budget-ideas, bingo-games-for-classrooms-and-parties | 2026-10-27 |

Every file currently says 2026-10-13. When a guide ships on a later date, change both its frontmatter `published`/`updated` and the visible byline line to the real ship date. Never show a date earlier than the page actually went live. The homepage "Latest guides" list and the About changelog should list only guides that are live.

## 3. Byline and date component (PLAN TASK 4)

Create `components/PageMeta.tsx`:

```tsx
import Link from "next/link";

type Props = {
  published?: string; // ISO date, guides only, e.g. "2026-10-13"
  updated: string;    // ISO date
};

const fmt = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

export default function PageMeta({ published, updated }: Props) {
  return (
    <p className="mt-2 text-sm text-muted">
      By{" "}
      <Link href="/about#arhum" rel="author" className="font-semibold text-accent hover:underline">
        Arhum Waheed
      </Link>
      {published && (
        <> · Published <time dateTime={published}>{fmt(published)}</time></>
      )}
      {" · "}Updated <time dateTime={updated}>{fmt(updated)}</time>
    </p>
  );
}
```

- **Guides:** render `<PageMeta published={fm.published} updated={fm.updated} />` directly under the H1.
- **All 10 tool pages:** render `<PageMeta updated="2026-10-13" />` under the H1 (or just above the FAQ if it crowds the tool UI). Use the real date the page content last changed, and keep one source of truth (e.g. `lib/pageDates.ts`) that the sitemap also reads.
- **JSON-LD** (one `<script type="application/ld+json">` per page):
  - Guides: `Article` with `headline`, `datePublished`, `dateModified`, `author: { "@type": "Person", "name": "Arhum Waheed", "url": "https://www.exestools.com/about#arhum" }`, `publisher: { "@type": "Organization", "name": "ExesTools", "url": "https://www.exestools.com" }`, `image` (first screenshot), plus `FAQPage` for the visible FAQ.
  - Tool pages: `WebApplication` with `name`, `url`, `applicationCategory: "UtilitiesApplication"`, `operatingSystem: "Any"`, `offers: { "@type": "Offer", "price": "0", "priceCurrency": "USD" }`, `author` as above, `dateModified`. Add `FAQPage` only for FAQs that are visible on the page.
  - About: `ProfilePage` with `mainEntity: Person` (Arhum Waheed, `sameAs`: LinkedIn and GitHub URLs once filled).

## 4. Sitemap (PLAN TASK 8)

`app/sitemap.ts` currently lists 15 URLs, all with `lastModified` 2026-10-12. Add:

```ts
{ url: "https://www.exestools.com/guides", lastModified: <date of newest live guide>, changeFrequency: "weekly", priority: 0.8 },
// one entry per *published* guide, generated from content/guides frontmatter:
{ url: `https://www.exestools.com/guides/${slug}`, lastModified: fm.updated, changeFrequency: "monthly", priority: 0.7 },
```

- Only include guides whose `published` date has passed.
- Update `lastModified` to the real deploy date for `/`, `/about`, `/random-number-wheel`, `/classroom-spinner` and `/yes-no-wheel` when their new content ships, and for every tool page when the byline lands.
- After deploy, resubmit the sitemap in Search Console and check its status shows "Success".

## 5. Navigation

- **Header** (desktop and the "Open menu" mobile menu): add `Guides` → `/guides`, placed after `Bingo` and before `About`. Current order: Spinner, Names, Classroom, Prize, Yes/No, Teams, Secret Santa, Numbers, Raffle, Bingo, About, Contact.
- **Footer:** add `Guides` → `/guides` before `About Us`. Optionally add a second footer column "Guides" listing the published guides.
- **Homepage:** "Latest guides" list under the new homepage block (in `homepage-block.md`).
- **Tool pages → guides** (contextual links, one sentence each, add near the relevant section):
  - `/prize-wheel` and `/raffle-generator` → `/guides/how-to-run-a-fair-online-giveaway`
  - `/classroom-spinner` → `/guides/cold-calling-students-fairly`
  - `/secret-santa-generator` → `/guides/secret-santa-rules-and-budget-ideas`
  - `/random-team-generator` → `/guides/how-to-make-balanced-random-teams`
  - `/bingo-card-generator` → `/guides/bingo-games-for-classrooms-and-parties`
  - Every "Learn more: How ExesTools picks a result" link can stay pointing to `/about#how-it-works`. The About section links on to the randomness guide.

## 6. Redirects and status codes (PLAN TASK 2)

Checked from the box on 2026-10-13: `https://exestools.com/` → 308 → `https://www.exestools.com/` ✅; `/prize-wheel/` → 308 → `/prize-wheel` ✅; `/tools/jwt-decoder` → 404; `/blog` → 404. `http://www.exestools.com/` timed out from the box, so check the http→https redirect from your own machine.

In `next.config.js`:

```js
async redirects() {
  return [
    { source: "/blog", destination: "/guides", permanent: true },
    { source: "/blog/:slug", destination: "/guides/:slug", permanent: true },
    { source: "/guide", destination: "/guides", permanent: true },
    { source: "/guide/:slug", destination: "/guides/:slug", permanent: true },
    // Add one line per legacy /tools/* URL from the GSC export that has a real equivalent, e.g.:
    // { source: "/tools/spinner-wheel", destination: "/", permanent: true },
  ];
}
```

`permanent: true` sends a 308.

Removed tools with no equivalent (`/tools/jwt-decoder`, `/tools/blog-title-generator`, and any other dead `/tools/*` slug in the GSC "Crawled - currently not indexed" export) should return **410 Gone**. `redirects()` can't send a 410, so use `middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
const GONE = new Set(["/tools/jwt-decoder", "/tools/blog-title-generator"]);
export function middleware(req: NextRequest) {
  if (GONE.has(req.nextUrl.pathname)) return new NextResponse("Gone", { status: 410, headers: { "X-Robots-Tag": "noindex" } });
}
export const config = { matcher: ["/tools/:path*"] };
```

Don't add a catch-all `/tools/:slug` → `/` redirect. Mass-redirecting dead URLs to the homepage is treated as a soft 404.

## 7. QA before marking done

1. Rerun `../raw/crawl.py` against production. Confirm: every new URL is 200, self-canonical and indexable; header and footer show Guides; zero identical paragraphs shared between pages.
2. Banned-claims grep on the deployed HTML. This should only match negations ("not a certified drawing service", "doesn't import comments", "doesn't have a separate presentation mode"):
   `rg -niE "full ?screen|ad-free|weighted|csv import|\bOBS\b|certified|no tracking|complian" `
3. Word counts (main-content prose): each guide 1,300–1,800; `/random-number-wheel` and `/classroom-spinner` each 1,300+ more words than today's 890 / 909; About 900–1,100; homepage block 250–350.
4. Rich Results Test on one guide and one tool page: Article/WebApplication and FAQPage valid, author present.
5. Don't resubmit to AdSense until every condition in PLAN.md §4 is met (target around 2026-11-10 or later).
