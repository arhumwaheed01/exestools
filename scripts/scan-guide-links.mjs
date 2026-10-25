import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

function today() {
  const utc = new Date().toISOString().slice(0, 10);
  const pkt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return pkt > utc ? pkt : utc;
}

function normDate(val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val ?? "").slice(0, 10);
}

const asOf = today();
const guidesDir = path.join(process.cwd(), "content/guides");
const published = new Set();
const allSlugs = new Map(); // slug -> filename

for (const f of fs.readdirSync(guidesDir).filter((x) => x.endsWith(".md"))) {
  const { data } = matter(fs.readFileSync(path.join(guidesDir, f), "utf8"));
  const slug =
    String(data.slug || "")
      .replace(/^\/guides\//, "")
      .replace(/^\//, "") || f.replace(/\.md$/, "");
  allSlugs.set(slug, f);
  const pub = normDate(data.published);
  if (!data.draft && pub && pub <= asOf) published.add(slug);
}

console.log("asOf", asOf);
console.log(
  "unpublished:",
  [...allSlugs.keys()].filter((s) => !published.has(s)).sort().join(", "),
);

const linkRe = /\]\(\/guides\/([a-z0-9-]+)\)|href="\/guides\/([a-z0-9-]+)"/g;
const roots = ["app", "content", "public/content", "components"];
const hits = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(tsx|ts|md)$/.test(ent.name)) {
      const text = fs.readFileSync(p, "utf8");
      let m;
      linkRe.lastIndex = 0;
      while ((m = linkRe.exec(text))) {
        const slug = m[1] || m[2];
        if (!published.has(slug)) {
          hits.push({ file: p, slug, exists: allSlugs.has(slug) });
        }
      }
    }
  }
}

for (const r of roots) {
  if (fs.existsSync(r)) walk(r);
}

const seen = new Set();
for (const h of hits) {
  const k = `${h.file}:${h.slug}`;
  if (seen.has(k)) continue;
  seen.add(k);
  // Skip bodies of unpublished guides (and their public/ mirrors)
  const base = path.basename(h.file, ".md");
  const isGuideBody =
    h.file.includes(`${path.sep}guides${path.sep}`) && allSlugs.has(base);
  if (isGuideBody && !published.has(base)) continue;
  console.log(h.exists ? "UNPUB" : "MISSING", h.slug, "<-", h.file);
}
