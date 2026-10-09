#!/usr/bin/env node
/** WCAG contrast check for bingo card themes. No deps. Keep in sync with lib/bingo/themes.ts. */

const THEME_CONTRAST = {
  classic: { band: "#0e7490", bandInk: "#ffffff", cell: "#ffffff", cellInk: "#0f172a", free: "#cffafe", freeInk: "#155e75" },
  festive: { band: "#b91c1c", bandInk: "#ffffff", cell: "#fffdf7", cellInk: "#1c1917", free: "#dcfce7", freeInk: "#166534" },
  spooky: { band: "#6b21a8", bandInk: "#ffffff", cell: "#fff7ed", cellInk: "#1c1917", free: "#ffedd5", freeInk: "#9a3412" },
  pastel: { band: "#f9a8d4", bandInk: "#500724", cell: "#ffffff", cellInk: "#1e293b", free: "#fdf2f8", freeInk: "#9d174d" },
  classroom: { band: "#1d4ed8", bandInk: "#ffffff", cell: "#ffffff", cellInk: "#0f172a", free: "#fef9c3", freeInk: "#854d0e" },
  harvest: { band: "#9a3412", bandInk: "#ffffff", cell: "#fffbeb", cellInk: "#292524", free: "#fef3c7", freeInk: "#92400e" },
  party: { band: "#be185d", bandInk: "#ffffff", cell: "#ffffff", cellInk: "#111827", free: "#fae8ff", freeInk: "#86198f" },
  trip: { band: "#047857", bandInk: "#ffffff", cell: "#f8fafc", cellInk: "#0f172a", free: "#d1fae5", freeInk: "#065f46" },
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

function lin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function relLuma([r, g, b]) {
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const L1 = relLuma(hexToRgb(a));
  const L2 = relLuma(hexToRgb(b));
  const hi = Math.max(L1, L2);
  const lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const [id, t] of Object.entries(THEME_CONTRAST)) {
  for (const [name, fg, bg, min] of [
    ["band", t.bandInk, t.band, 4.5],
    ["cell", t.cellInk, t.cell, 7],
    ["free", t.freeInk, t.free, 4.5],
  ]) {
    const ratio = contrast(fg, bg);
    if (ratio + 1e-9 < min) {
      failed++;
      console.error(`FAIL ${id} ${name}: ${ratio.toFixed(2)} < ${min} (${fg} on ${bg})`);
    } else {
      console.log(`ok   ${id} ${name}: ${ratio.toFixed(2)}`);
    }
  }
}
if (failed) {
  console.error(`\n${failed} contrast check(s) failed`);
  process.exit(1);
}
console.log("\nAll bingo theme contrast checks passed.");
