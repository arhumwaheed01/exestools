/** Relative luminance (sRGB) for WCAG contrast. */
export function relativeLuminance(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0;
  const n = parseInt(m[1]!, 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const a = relativeLuminance(fgHex);
  const b = relativeLuminance(bgHex);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick white or near-black label ink for ≥4.5:1 on the segment fill. */
export function labelInkForBg(bgHex: string): "#ffffff" | "#0f172a" {
  const white = contrastRatio("#ffffff", bgHex);
  const dark = contrastRatio("#0f172a", bgHex);
  if (white >= 4.5) return "#ffffff";
  if (dark >= 4.5) return "#0f172a";
  return white >= dark ? "#ffffff" : "#0f172a";
}
