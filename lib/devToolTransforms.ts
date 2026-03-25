/** Pure string transforms for developer tools (run in browser). */

function formatJsonPretty(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    const parsed = JSON.parse(t);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function jsonFormatter(raw: string): string {
  const out = formatJsonPretty(raw);
  return out.startsWith("Invalid JSON:") ? out : out;
}

export function jsonValidator(raw: string): string {
  const t = raw.trim();
  if (!t) return "Empty input — paste JSON to validate.";
  try {
    JSON.parse(t);
    return "Valid JSON ✓\n\nFormatted:\n\n" + JSON.stringify(JSON.parse(t), null, 2);
  } catch (e) {
    return `Invalid JSON ✗\n\n${e instanceof Error ? e.message : String(e)}`;
  }
}

export function jsonViewer(raw: string): string {
  return jsonFormatter(raw);
}

export function base64Encoder(s: string): string {
  if (!s) return "";
  try {
    return btoa(unescape(encodeURIComponent(s)));
  } catch {
    return "Could not encode — check for invalid characters.";
  }
}

export function base64Decoder(s: string): string {
  const t = s.trim().replace(/\s/g, "");
  if (!t) return "";
  try {
    return decodeURIComponent(escape(atob(t)));
  } catch {
    return "Invalid Base64 input.";
  }
}

export function urlEncoder(s: string): string {
  if (!s) return "";
  try {
    return encodeURIComponent(s);
  } catch {
    return "Encode failed.";
  }
}

export function urlDecoder(s: string): string {
  const t = s.trim();
  if (!t) return "";
  try {
    return decodeURIComponent(t);
  } catch {
    return "Invalid percent-encoding.";
  }
}

export function htmlFormatter(s: string): string {
  if (!s.trim()) return "";
  return s
    .replace(/>\s+</g, ">\n<")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cssFormatter(s: string): string {
  if (!s.trim()) return "";
  let out = s.replace(/\s*{\s*/g, " {\n  ").replace(/\s*}\s*/g, "\n}\n");
  out = out.replace(/;\s*/g, ";\n  ");
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function looseJsFormat(s: string): string {
  return s
    .replace(/\s*{\s*/g, " {\n")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/;\s*/g, ";\n")
    .trim();
}

export function jsFormatter(s: string): string {
  const t = s.trim();
  if (!t) return "";
  try {
    const parsed = JSON.parse(t);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return looseJsFormat(s);
  }
}

const SQL_KEYS = new Set(
  "select,from,where,and,or,insert,into,values,update,set,delete,join,inner,left,right,on,group,by,order,limit,offset,having,as,case,when,then,else,end,union,all,distinct,count,sum,avg,max,min"
    .split(","),
);

export function sqlFormatter(s: string): string {
  if (!s.trim()) return "";
  let t = s.replace(/\s+/g, " ").trim();
  t = t.replace(/\b([a-zA-Z_]+)\b/g, (w) => {
    const low = w.toLowerCase();
    return SQL_KEYS.has(low) ? low.toUpperCase() : w;
  });
  return t
    .replace(/\bSELECT\b/g, "\nSELECT")
    .replace(/\bFROM\b/g, "\nFROM")
    .replace(/\bWHERE\b/g, "\nWHERE")
    .replace(/\b(LEFT|RIGHT|INNER)?\s*JOIN\b/g, "\n$1 JOIN")
    .replace(/\bGROUP BY\b/g, "\nGROUP BY")
    .replace(/\bORDER BY\b/g, "\nORDER BY")
    .replace(/\bHAVING\b/g, "\nHAVING")
    .replace(/\bLIMIT\b/g, "\nLIMIT")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function xmlFormatter(s: string): string {
  const t = s.trim();
  if (!t) return "";
  if (typeof DOMParser === "undefined") return htmlFormatter(t);
  try {
    const doc = new DOMParser().parseFromString(t, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return `XML parse issue: ${err.textContent?.trim() ?? "unknown"}\n\n${htmlFormatter(t)}`;
    const ser = new XMLSerializer();
    const raw = ser.serializeToString(doc.documentElement);
    return htmlFormatter(raw);
  } catch (e) {
    return `Could not format XML: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function htmlMinifier(s: string): string {
  if (!s.trim()) return "";
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
}

export function cssMinifier(s: string): string {
  if (!s.trim()) return "";
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

export function jsMinifier(s: string): string {
  if (!s.trim()) return "";
  let t = s.replace(/\/\*[\s\S]*?\*\//g, "");
  t = t.replace(/(^|[^:])\/\/.*$/gm, "$1");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}
