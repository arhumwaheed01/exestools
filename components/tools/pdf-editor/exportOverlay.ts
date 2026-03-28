"use client";

/**
 * Renders saved Fabric JSON at page pixel size and returns raw base64 PNG (no data: prefix).
 * Uses multiplier ≤ 1.5 capped by maxEdge to limit upload size while staying sharp.
 */
export async function fabricJsonToPngBase64(
  jsonStr: string,
  width: number,
  height: number,
  maxEdge = 1600,
): Promise<string | null> {
  if (width < 2 || height < 2) return null;
  let parsed: { objects?: unknown[] };
  try {
    parsed = JSON.parse(jsonStr) as { objects?: unknown[] };
  } catch {
    return null;
  }
  if (!parsed.objects?.length) return null;

  const { Canvas } = await import("fabric");
  const el = document.createElement("canvas");
  el.width = Math.floor(width);
  el.height = Math.floor(height);
  const c = new Canvas(el, {
    width,
    height,
    backgroundColor: "transparent",
    preserveObjectStacking: true,
  });

  try {
    await c.loadFromJSON(parsed);
  } catch {
    c.dispose();
    return null;
  }
  c.renderAll();

  const maxDim = Math.max(width, height);
  const mult = Math.min(1.5, maxEdge / maxDim);
  const dataUrl = c.toDataURL({
    format: "png",
    multiplier: mult < 0.4 ? 0.4 : mult,
  });
  c.dispose();

  const comma = dataUrl.indexOf(",");
  if (comma < 0) return null;
  return dataUrl.slice(comma + 1);
}
