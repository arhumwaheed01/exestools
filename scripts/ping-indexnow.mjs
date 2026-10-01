/**
 * IndexNow ping (MA-11 / BK-03).
 * Skip on preview / non-production deploys.
 *
 * Usage:
 *   node scripts/ping-indexnow.mjs
 *   INDEXNOW_DATE=2026-10-01 node scripts/ping-indexnow.mjs
 *   INDEXNOW_URLS=https://www.exestools.com/,https://www.exestools.com/random-number-wheel node scripts/ping-indexnow.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const KEY = "fa2039ab052c6167d1407c1dd1daa02d";
const HOST = "www.exestools.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function shouldSkip() {
  if (process.env.INDEXNOW_FORCE === "1") return false;
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") {
    console.log(`IndexNow skipped (VERCEL_ENV=${vercelEnv}).`);
    return true;
  }
  if (process.env.VERCEL === "1" && vercelEnv !== "production") {
    console.log("IndexNow skipped (non-production Vercel).");
    return true;
  }
  return false;
}

function loadLastmodMap() {
  const src = readFileSync(join(root, "lib/seo/lastmod.ts"), "utf8");
  const map = {};
  const re = /"(\/[^"]*)":\s*"(\d{4}-\d{2}-\d{2})"/g;
  let m;
  while ((m = re.exec(src))) {
    map[m[1]] = m[2];
  }
  return map;
}

function absoluteUrl(path) {
  if (path === "/") return `https://${HOST}/`;
  return `https://${HOST}${path}`;
}

async function main() {
  if (shouldSkip()) process.exit(0);

  let urlList = [];
  if (process.env.INDEXNOW_URLS) {
    urlList = process.env.INDEXNOW_URLS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    const lastmod = loadLastmodMap();
    const date =
      process.env.INDEXNOW_DATE ||
      Object.values(lastmod).sort().at(-1) ||
      new Date().toISOString().slice(0, 10);
    urlList = Object.entries(lastmod)
      .filter(([, d]) => d === date)
      .map(([path]) => absoluteUrl(path));
    if (urlList.length === 0) {
      console.log(`IndexNow: no URLs with lastmod ${date}; nothing to ping.`);
      process.exit(0);
    }
    console.log(`IndexNow using lastmod date ${date}`);
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  console.log(`IndexNow pinging ${urlList.length} URL(s)…`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(text);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
