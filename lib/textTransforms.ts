/**
 * Pure text transforms; safe to run client- or server-side.
 */

export type TextReverseMode = "characters" | "lines";

function titleCaseWord(word: string): string {
  if (!word) return word;
  return (
    word.charAt(0).toLocaleUpperCase("en-US") +
    word.slice(1).toLocaleLowerCase("en-US")
  );
}

/** Title case each whitespace-delimited token (hyphenated chunks stay one token). */
export function toTitleCase(text: string): string {
  return text
    .split(/(\s+)/)
    .map((part) => (/\s+/.test(part) ? part : titleCaseWord(part)))
    .join("");
}

/**
 * Lowercase overall, then capitalize the first letter and the first letter
 * after sentence-ending punctuation followed by space.
 */
export function toSentenceCase(text: string): string {
  let s = text.toLocaleLowerCase("en-US");
  s = s.replace(/^[a-z]/, (c) => c.toLocaleUpperCase("en-US"));
  s = s.replace(/([.!?]\s+)([a-z])/g, (_m, punctSpace: string, letter: string) => {
    return punctSpace + letter.toLocaleUpperCase("en-US");
  });
  return s;
}

export function removeDuplicateLines(text: string): string {
  const lines = text.split("\n");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      out.push(line);
    }
  }
  return out.join("\n");
}

/** Trim lines; collapse internal runs of spaces/tabs; preserve newline structure. */
export function removeExtraSpaces(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trimEnd())
    .join("\n");
}

export function reverseCharacters(text: string): string {
  return [...text].reverse().join("");
}

export function reverseLines(text: string): string {
  return text.split("\n").reverse().join("\n");
}

export function reverseText(text: string, mode: TextReverseMode): string {
  return mode === "lines" ? reverseLines(text) : reverseCharacters(text);
}

/** Replace line breaks with spaces; collapse multiple newlines. */
export function removeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n+/g, " ").trim();
}

export function toUppercase(text: string): string {
  return text.toLocaleUpperCase("en-US");
}

export function toLowercase(text: string): string {
  return text.toLocaleLowerCase("en-US");
}

export function textToUrlSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function removePunctuation(text: string): string {
  return text.replace(/[^\w\s]|_/g, "");
}

export function removeNumbers(text: string): string {
  return text.replace(/\d+/g, "");
}

export function removeSpecialCharacters(text: string): string {
  return text.replace(/[^a-zA-Z0-9\s]/g, "");
}

export function trimText(text: string): string {
  return text.trim();
}

export function sortLinesAlphabetically(text: string): string {
  return text.split("\n").sort((a, b) => a.localeCompare(b)).join("\n");
}

export function sortLinesReverse(text: string): string {
  return text.split("\n").sort((a, b) => b.localeCompare(a)).join("\n");
}

export function shuffleLines(text: string): string {
  const lines = text.split("\n");
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  return lines.join("\n");
}

const MORSE: Record<string, string> = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....",
  i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.",
  q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-",
  y: "-.--", z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
};
const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
) as Record<string, string>;

export function textToMorse(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => (ch === " " ? "/" : MORSE[ch] ?? ch))
    .join(" ");
}

export function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s+/)
    .map((token) => (token === "/" ? " " : MORSE_REVERSE[token] ?? ""))
    .join("");
}

export function textToBinary(text: string): string {
  return [...text]
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryToText(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((bin) => String.fromCharCode(parseInt(bin, 2) || 0))
    .join("");
}

export function toPigLatin(text: string): string {
  return text.replace(/\b([a-zA-Z]+)\b/g, (word) => {
    const m = word.match(/^[aeiouAEIOU]/);
    if (m) return `${word}yay`;
    const c = word.match(/^[^aeiouAEIOU]+/);
    if (!c) return word;
    return `${word.slice(c[0].length)}${c[0]}ay`;
  });
}

export function toCamelCase(text: string): string {
  const words = text.replace(/[_-]/g, " ").trim().split(/\s+/);
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/[\s-]+/)
    .map((w) => w.toLowerCase())
    .join("_");
}

export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(/[\s_]+/)
    .map((w) => w.toLowerCase())
    .join("-");
}

export function textWrap(text: string, width = 80): string {
  if (width <= 0) return text;
  return text
    .split("\n")
    .map((line) => line.match(new RegExp(`.{1,${width}}(\\s|$)|\\S+?(\\s|$)`, "g"))?.join("").trimEnd() ?? "")
    .join("\n");
}

export function unwrapText(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function removeHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export function encodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function acronymGenerator(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function reverseWords(text: string): string {
  return text.split(/\s+/).filter(Boolean).reverse().join(" ");
}

export function wordFrequencyCounter(text: string): string {
  const freq = new Map<string, number>();
  text
    .toLowerCase()
    .match(/\b[\w']+\b/g)
    ?.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([w, n]) => `${w}: ${n}`)
    .join("\n");
}

export function countSentencesOnly(text: string): string {
  return String((text.trim().match(/[.!?]+/g) ?? []).length || (text.trim() ? 1 : 0));
}

export function countParagraphsOnly(text: string): string {
  return String(text.split(/\n+/).map((p) => p.trim()).filter(Boolean).length);
}

export function countVowels(text: string): string {
  return String((text.match(/[aeiou]/gi) ?? []).length);
}

export function countConsonants(text: string): string {
  return String((text.match(/[bcdfghjklmnpqrstvwxyz]/gi) ?? []).length);
}

export function simpleEncrypt(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function simpleDecrypt(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    return "Invalid encrypted text.";
  }
}

export function loremIpsumGenerator(input: string): string {
  const count = Math.max(1, Math.min(20, Number.parseInt(input, 10) || 3));
  const para =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  return Array.from({ length: count }, () => para).join("\n\n");
}

export function randomTextGenerator(input: string): string {
  const words = [
    "alpha","bravo","delta","pixel","orbit","quartz","vector","signal","native","studio",
  ];
  const count = Math.max(5, Math.min(200, Number.parseInt(input, 10) || 20));
  return Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}

export function textCapitalizer(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function alternatingCase(text: string): string {
  let idx = 0;
  return [...text]
    .map((ch) => {
      if (!/[a-z]/i.test(ch)) return ch;
      const out = idx % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
      idx++;
      return out;
    })
    .join("");
}

export function inverseCase(text: string): string {
  return [...text]
    .map((ch) =>
      ch >= "a" && ch <= "z"
        ? ch.toUpperCase()
        : ch >= "A" && ch <= "Z"
          ? ch.toLowerCase()
          : ch,
    )
    .join("");
}

export function randomCase(text: string): string {
  return [...text]
    .map((ch) => (/[a-z]/i.test(ch) ? (Math.random() > 0.5 ? ch.toUpperCase() : ch.toLowerCase()) : ch))
    .join("");
}

export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function removeStopWords(text: string): string {
  const stop = new Set([
    "a","an","the","and","or","but","if","then","than","to","of","in","on","for","with","is","are","was","were","be","been","being","at","by","from","as","that","this","it",
  ]);
  return text
    .split(/\s+/)
    .filter((w) => !stop.has(w.toLowerCase()))
    .join(" ");
}

export function removeCodeComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/^\s*#.*$/gm, "");
}

export function keywordDensity(text: string): string {
  const words = text.toLowerCase().match(/\b[\w']+\b/g) ?? [];
  const total = words.length;
  if (!total) return "No words found.";
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w, n]) => `${w}: ${((n / total) * 100).toFixed(2)}% (${n}/${total})`)
    .join("\n");
}

export function readabilityScore(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const syllables = words.reduce((acc, w) => acc + estimateSyllables(w), 0);
  if (!words.length) return "No text to score.";
  const score =
    206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);
  return `Flesch Reading Ease: ${score.toFixed(2)}\nWords: ${words.length}\nSentences: ${sentences}\nEstimated syllables: ${syllables}`;
}

function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const m = w.match(/[aeiouy]+/g);
  return Math.max(1, m?.length ?? 1);
}

export function ngramGenerator(text: string): string {
  const words = text.toLowerCase().match(/\b[\w']+\b/g) ?? [];
  const n = 2;
  const grams = new Map<string, number>();
  for (let i = 0; i <= words.length - n; i++) {
    const g = words.slice(i, i + n).join(" ");
    grams.set(g, (grams.get(g) ?? 0) + 1);
  }
  return [...grams.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([g, c]) => `${g}: ${c}`)
    .join("\n");
}

export function textToHex(text: string): string {
  return [...text].map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
}

export function hexToText(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((h) => String.fromCharCode(Number.parseInt(h, 16) || 0))
    .join("");
}

export function textToOctal(text: string): string {
  return [...text].map((ch) => ch.charCodeAt(0).toString(8)).join(" ");
}

export function octalToText(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((o) => String.fromCharCode(Number.parseInt(o, 8) || 0))
    .join("");
}

export function textToAscii(text: string): string {
  return [...text].map((ch) => String(ch.charCodeAt(0))).join(" ");
}

export function asciiToText(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((a) => String.fromCharCode(Number.parseInt(a, 10) || 0))
    .join("");
}

export function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function caesarCipher(text: string, shift = 3): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= "Z" ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}

export function blogTitleGenerator(text: string): string {
  const topic = text.trim() || "Your Topic";
  return [
    `10 Practical Tips for ${topic}`,
    `How to Master ${topic} in 2026`,
    `${topic}: Complete Beginner's Guide`,
    `The Ultimate ${topic} Checklist`,
    `${topic} Mistakes to Avoid`,
  ].join("\n");
}

export function metaDescriptionGenerator(text: string): string {
  const topic = text.trim() || "your topic";
  return `Learn ${topic} with this practical guide. Get clear tips, examples, and actionable steps to improve results quickly.`;
}

export function glitchText(text: string): string {
  return [...text]
    .map((ch) => (/[a-z]/i.test(ch) ? `${ch}${String.fromCharCode(0x0336)}` : ch))
    .join("");
}

export function zalgoText(text: string): string {
  const marks = ["\u0300", "\u0301", "\u0302", "\u0308", "\u0334", "\u0335", "\u0336"];
  return [...text]
    .map((ch) => {
      if (!/[a-z]/i.test(ch)) return ch;
      const extra = Array.from({ length: 2 }, () => marks[Math.floor(Math.random() * marks.length)]).join("");
      return `${ch}${extra}`;
    })
    .join("");
}

export function jsonToCsv(text: string): string {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    if (!arr.length || typeof arr[0] !== "object") return "";
    const headers = Object.keys(arr[0]);
    const rows = arr.map((obj) =>
      headers.map((h) => JSON.stringify((obj as Record<string, unknown>)[h] ?? "")).join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  } catch {
    return "Invalid JSON input.";
  }
}

export function csvToJson(text: string): string {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return "Invalid CSV input.";
  const headers = lines[0].split(",").map((h) => h.trim());
  const out = lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] ?? "").trim();
    });
    return obj;
  });
  return JSON.stringify(out, null, 2);
}

export function yamlToJson(text: string): string {
  const obj: Record<string, string> = {};
  text.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^:#]+):\s*(.*)\s*$/);
    if (m) obj[m[1].trim()] = m[2].trim();
  });
  return JSON.stringify(obj, null, 2);
}

export function jsonToYaml(text: string): string {
  try {
    const obj = JSON.parse(text) as Record<string, unknown>;
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "Provide a JSON object.";
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n");
  } catch {
    return "Invalid JSON input.";
  }
}

export function textObfuscator(text: string): string {
  return [...text]
    .map((ch) => (/[a-z0-9]/i.test(ch) ? "*" : ch))
    .join("");
}
