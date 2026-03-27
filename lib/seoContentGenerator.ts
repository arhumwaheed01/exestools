/**
 * Programmatic SEO copy for /tools/[slug] — deterministic per slug, varied phrasing.
 * Build-time only (SSG); no runtime I/O.
 */

import { DEVELOPER_CATEGORY_SLUGS } from "@/lib/content/developerToolsData";
import { IMAGE_CATEGORY_SLUGS } from "@/lib/content/imageToolsData";

export type ToolCategory = "text" | "developer" | "image";

export type ToolSeoInput = {
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
};

export type SEOGeneratedContent = {
  intro: string;
  howToUse: string[];
  features: string[];
  useCases: string[];
  faqs: { question: string; answer: string }[];
};

const devSlugSet = new Set<string>(DEVELOPER_CATEGORY_SLUGS);
const imageSlugSet = new Set<string>(IMAGE_CATEGORY_SLUGS);

export function resolveToolCategory(slug: string): ToolCategory {
  if (imageSlugSet.has(slug)) return "image";
  if (devSlugSet.has(slug)) return "developer";
  return "text";
}

function hashSlug(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(slug: string, salt: number, arr: readonly T[]): T {
  const idx = (hashSlug(`${slug}:${salt}`) >>> 0) % arr.length;
  return arr[idx]!;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Keep intro roughly in 120–150 words by trimming or appending filler sentences. */
function tuneIntroLength(
  base: string,
  slug: string,
  category: ToolCategory,
): string {
  const min = 120;
  const max = 150;
  let text = base.replace(/\s+/g, " ").trim();

  const fillers = fillerSentences(category, slug);
  let guard = 0;
  while (countWords(text) < min && guard++ < 12) {
    text += " " + pick(slug, 400 + guard, fillers);
  }

  if (countWords(text) <= max) return text;

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  let out = "";
  for (const sent of sentences) {
    const candidate = (out + " " + sent).trim();
    if (countWords(candidate) > max) break;
    out = candidate;
  }
  return out.trim() || text.slice(0, Math.floor(text.length * (max / countWords(text))));
}

function fillerSentences(
  category: ToolCategory,
  slug: string,
): readonly string[] {
  const site = "ExesTools";
  const common = [
    `The interface stays fast and readable so you can repeat this workflow whenever you need a quick result on ${site}.`,
    `You can bookmark this free online page and return anytime—no signup is required for typical use.`,
    `Because the tool runs in your browser, you get immediate feedback while you edit or paste content.`,
    `That makes it practical for students, professionals, and teams who need dependable output without installing desktop software.`,
    `Use copy and clear actions to move results into your next step without friction.`,
  ] as const;
  const dev = [
    `Developers often pair this utility with tickets, pull requests, and local debugging sessions.`,
    `It complements your editor and CLI: paste a snippet, verify output, and move on.`,
    `Client-side processing helps keep short tasks responsive when you are iterating quickly.`,
  ] as const;
  const img = [
    `Preview-oriented controls help you compare before and after before you download.`,
    `This fits everyday web, email, and social workflows where file size and format matter.`,
    `You can process files locally in the browser for many standard image operations.`,
  ] as const;
  if (category === "developer") return [...common, ...dev];
  if (category === "image") return [...common, ...img];
  return [...common];
}

function buildIntro(tool: ToolSeoInput): string {
  const { name, slug, description, category } = tool;
  const d = description.trim();
  const lcName = name.toLowerCase();

  const openers = [
    `Use this free online ${lcName} tool to work faster with text and data directly in your browser.`,
    `This fast, free ${lcName} tool helps you complete everyday tasks online without extra software.`,
    `Try this free ${lcName} online: it is built for quick, accurate results you can trust at a glance.`,
    `Reach for this online ${lcName} tool when you need a simple, free workflow with instant feedback.`,
  ];

  const bridges = [
    `According to the product summary, ${d}`,
    `In practice, ${d.charAt(0).toLowerCase() + d.slice(1)}`,
    `The tool focuses on the same job: ${d.charAt(0).toLowerCase() + d.slice(1)}`,
    `That matches what many users expect: ${d.charAt(0).toLowerCase() + d.slice(1)}`,
  ];

  const middles = [
    `Whether you are polishing drafts, debugging snippets, or preparing files to share, ${name} keeps the steps straightforward.`,
    `You get a clear workspace with obvious actions, so you spend less time hunting for controls and more time finishing the task.`,
    `The layout emphasizes speed: paste or upload, review output, then copy or download when you are satisfied.`,
    `It is designed to feel lightweight—open the page, complete one focused job, and move on.`,
  ];

  const closers = [
    `Below you will find steps, features, and FAQs that explain how to get the most from this utility.`,
    `Read on for step-by-step guidance, real-world use cases, and answers to common questions.`,
    `Keep scrolling for how-to steps, highlights, and SEO-focused FAQs tailored to this page.`,
  ];

  if (category === "developer") {
    const o = pick(slug, 1, openers);
    const m = pick(slug, 2, middles);
    const b = pick(slug, 3, bridges);
    const c = pick(slug, 4, closers);
    return tuneIntroLength(`${o} ${m} ${b} ${c}`, slug, category);
  }

  if (category === "image") {
    const o = pick(slug, 5, [
      `Use this free online ${lcName} utility to handle image tasks quickly in your browser.`,
      `This fast ${lcName} tool runs online so you can compress, convert, or adjust visuals without a heavy install.`,
      `Try ${name} online for a straightforward, free workflow with previews when available.`,
    ]);
    const m = pick(slug, 6, [
      `Upload or drop a file, adjust options if needed, then review the result before saving.`,
      `The flow is simple: pick your image, tune settings, and download optimized output.`,
      `You can iterate settings and compare output until the file fits your page or message.`,
    ]);
    const b = pick(slug, 7, bridges);
    const c = pick(slug, 8, closers);
    return tuneIntroLength(`${o} ${m} ${b} ${c}`, slug, category);
  }

  const o = pick(slug, 9, openers);
  const m = pick(slug, 10, middles);
  const b = pick(slug, 11, bridges);
  const c = pick(slug, 12, closers);
  return tuneIntroLength(`${o} ${m} ${b} ${c}`, slug, category);
}

function buildHowToUse(tool: ToolSeoInput): string[] {
  const { name, slug, category } = tool;
  const n = name;

  const textSteps = [
    [
      `Open ${n} and paste or type your source text into the input area.`,
      `Review the live output as you edit so you can spot issues early.`,
      `Use copy actions to move results into your document, CMS, or chat.`,
      `Clear the workspace when you are ready to start a new task.`,
      `Optional: repeat with variations until the output matches your brief.`,
    ],
    [
      `Navigate to the ${n} workspace on this free online page.`,
      `Add your text, then watch counts or transformed output update in real time.`,
      `Adjust content until numbers or formatting match what you need.`,
      `Copy the finished text, or clear fields to process another block.`,
      `Bookmark the tool if you use it often in your writing or ops workflow.`,
    ],
  ];

  const devSteps = [
    [
      `Paste code, JSON, headers, or other input that ${n} expects.`,
      `Confirm the output pane shows the formatted, decoded, or hashed result.`,
      `Iterate quickly: tweak input and compare before/after in the same view.`,
      `Copy the output into your editor, terminal, ticket, or test fixture.`,
      `Clear inputs between unrelated tasks to avoid mixing contexts.`,
    ],
    [
      `Load the ${n} page and insert the snippet you want to analyze or transform.`,
      `Use on-page controls (if any) to match your encoding, formatting, or generation needs.`,
      `Verify output against expectations before you paste it elsewhere.`,
      `Share this free online tool link with teammates who need the same check.`,
    ],
  ];

  const imageSteps = [
    [
      `Choose an image from your device or drag it into the upload area.`,
      `Set quality, dimensions, rotation, or format options as the tool allows.`,
      `Preview changes when available, then confirm the result looks correct.`,
      `Download the processed file and use it on your site, email, or social post.`,
      `Run another file anytime—no account is required for typical use.`,
    ],
    [
      `Open ${n} and add a photo or graphic you want to process.`,
      `Tune sliders or pick a target format to match your delivery channel.`,
      `Compare before/after previews to avoid unwanted cropping or color shifts.`,
      `Save the output locally; repeat for additional assets in the same session.`,
    ],
  ];

  if (category === "developer") {
    const pack = pick(slug, 20, devSteps);
    return pack.length >= 5 ? pack : [...pack, devSteps[0][4]!];
  }
  if (category === "image") {
    const pack = pick(slug, 21, imageSteps);
    return pack.length >= 5 ? pack : [...pack, imageSteps[0][4]!];
  }
  const pack = pick(slug, 22, textSteps);
  return pack.length >= 5 ? pack : [...pack, textSteps[0][4]!];
}

function buildFeatures(tool: ToolSeoInput): string[] {
  const { name, slug, category } = tool;
  const lc = name.toLowerCase();

  const universal = [
    `Free online access with a layout tuned for fast input and clear output.`,
    `Real-time feedback so you are not waiting on uploads for typical operations.`,
    `Copy-friendly results that fit CMS, docs, tickets, and messaging apps.`,
    `Responsive design that works on desktop, tablet, and phone browsers.`,
    `Straightforward controls—ideal when you need the same ${lc} workflow again tomorrow.`,
  ];

  const devExtra = [
    `Built for developer workflows: readable panels, minimal noise, quick reset.`,
    `Pairs well with related utilities linked below for encode → decode → format flows.`,
  ];

  const imgExtra = [
    `Browser-based processing for common image tasks with download when you are ready.`,
    `Preview-oriented flow to reduce surprises before you publish or attach a file.`,
  ];

  let items: string[] = [...universal];
  if (category === "developer") {
    items = [...items.slice(0, 3), ...devExtra, ...items.slice(3)];
  } else if (category === "image") {
    items = [...items.slice(0, 2), ...imgExtra, ...items.slice(2)];
  }

  const extra = pick(slug, 32, [
    `No signup required for standard use on ExesTools.`,
    `A stable URL you can bookmark and share with collaborators.`,
    `Clear labeling so first-time visitors understand what to paste or upload.`,
  ]);
  items = [...items, extra];
  return items.slice(0, 7);
}

function buildUseCases(tool: ToolSeoInput): string[] {
  const { name, slug, category } = tool;

  const textCases = [
    `Editing blog posts, assignments, and newsletters where length or formatting rules apply.`,
    `Cleaning exports from spreadsheets, CRMs, or chat apps before publishing.`,
    `Preparing social copy when character limits or readability checks matter.`,
    `QA and support teams normalizing snippets before pasting into tickets.`,
    `Students and teachers verifying word counts or transformations for coursework.`,
  ];

  const devCases = [
    `Debugging API responses and configs during local development.`,
    `Reviewing pull requests with formatted JSON, SQL, or markup.`,
    `Generating hashes, UUIDs, or timestamps for tests and documentation.`,
    `Teaching or pairing sessions where a shareable browser tool beats environment setup.`,
    `On-call triage when you need a fast decode, format, or sanity check.`,
  ];

  const imgCases = [
    `Shrinking hero and inline images for faster page loads.`,
    `Converting formats for CMS uploads, email attachments, or vendor portals.`,
    `Fixing rotation or simple crops before sharing screenshots.`,
    `Stripping metadata from images before external publication.`,
    `Creating assets for presentations and docs without opening heavy editors.`,
  ];

  const pool =
    category === "developer"
      ? devCases
      : category === "image"
        ? imgCases
        : textCases;

  const rotated: string[] = [];
  const offset = hashSlug(slug) % pool.length;
  for (let i = 0; i < 6; i++) {
    rotated.push(pool[(offset + i) % pool.length]!);
  }
  const lead = pick(slug, 40, [
    `Teams use ${name} when `,
    `A common scenario: `,
    `You might rely on this tool when `,
  ]);
  return rotated.slice(0, 6).map((c, i) =>
    i === 0 ? `${lead}${c.charAt(0).toLowerCase() + c.slice(1)}` : c,
  );
}

function buildFaqs(tool: ToolSeoInput): { question: string; answer: string }[] {
  const { name, slug, description, category } = tool;
  const d = description.trim();

  const baseFaqs: { question: string; answer: string }[] = [
    {
      question: `What is ${name} and who is it for?`,
      answer: `${name} is a free online tool on ExesTools. ${d} It suits writers, students, and professionals who want fast browser-based results.`,
    },
    {
      question: `Is ${name} free to use?`,
      answer: `Yes. You can use this online tool for free in supported browsers. Follow your organization’s policies for sensitive data.`,
    },
    {
      question: `How fast is ${name}?`,
      answer: `It is built for quick feedback: paste or upload, review output, and continue. Typical tasks complete interactively without long waits.`,
    },
    {
      question: `Does ${name} work on mobile browsers?`,
      answer: `Yes. The page is responsive. Very large files or huge pastes may feel better on desktop, but everyday use works on phones and tablets.`,
    },
    {
      question: `How does ${name} help SEO and content workflows?`,
      answer: `It helps you meet formatting and length goals, iterate drafts, and ship cleaner text or assets—supporting consistent on-page quality.`,
    },
    {
      question: `Can I trust the output from ${name}?`,
      answer: `The tool applies the described behavior to your input. For legal, medical, or mission-critical work, double-check results in your own process.`,
    },
    {
      question: `Where can I find related tools?`,
      answer: `Scroll to the related tools section on this page for adjacent utilities you can chain in the same workflow.`,
    },
  ];

  const devTweak: Record<number, { question: string; answer: string }> = {
    0: {
      question: `What does ${name} do for developers?`,
      answer: `${d} Use it when you need a fast, free online check without spinning up a local script.`,
    },
    2: {
      question: `Will ${name} work offline?`,
      answer: `You need a browser session to load the page. After load, many tasks run client-side for typical inputs.`,
    },
  };

  const imgTweak: Record<number, { question: string; answer: string }> = {
    0: {
      question: `What can I do with ${name}?`,
      answer: `${d} It is designed for quick browser-based image work with previews when available.`,
    },
    4: {
      question: `Will ${name} reduce image quality?`,
      answer: `Compression and format changes can reduce fidelity—preview when offered and pick settings that match your delivery channel.`,
    },
  };

  const items = baseFaqs.map((item, idx) => {
    if (category === "developer" && devTweak[idx]) return devTweak[idx]!;
    if (category === "image" && imgTweak[idx]) return imgTweak[idx]!;
    return item;
  });

  const n = items.length;
  const start = hashSlug(slug + ":faqrot") % n;
  const rotated = [...items.slice(start), ...items.slice(0, start)];
  const count = 5 + (hashSlug(slug + ":faqct") % 3);
  return rotated.slice(0, count);
}

/**
 * Deterministic SEO blocks for a tool. Safe to call from Server Components at build time.
 */
export function generateSEOContent(tool: ToolSeoInput): SEOGeneratedContent {
  return {
    intro: buildIntro(tool),
    howToUse: buildHowToUse(tool),
    features: buildFeatures(tool),
    useCases: buildUseCases(tool),
    faqs: buildFaqs(tool),
  };
}
