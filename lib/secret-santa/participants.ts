import { MAX_PARTICIPANTS } from "./draw";

export const MAX_NAME_LENGTH = 40;

/** Trim and collapse inner whitespace. */
export const normalizeName = (raw: string) => raw.replace(/\s+/g, " ").trim();

/** Case-insensitive key used for duplicate detection. */
export const nameKey = (name: string) => normalizeName(name).toLocaleLowerCase("en");

/** Splits pasted text: one name per line; if no line breaks, commas or semicolons also split. */
export function splitPasted(text: string): string[] {
  const parts = /\r?\n/.test(text) ? text.split(/\r?\n/) : text.split(/[,;]/);
  return parts.map(normalizeName).filter(Boolean);
}

export interface AddResult {
  names: string[];
  added: string[];
  skippedDuplicates: string[];
  skippedTooLong: string[];
  skippedOverLimit: string[];
}

/** Adds names to an existing list, skipping duplicates, over-long names and anything past 50. */
export function addNames(existing: string[], incoming: string[]): AddResult {
  const names = [...existing];
  const keys = new Set(existing.map(nameKey));
  const res: AddResult = {
    names,
    added: [],
    skippedDuplicates: [],
    skippedTooLong: [],
    skippedOverLimit: [],
  };
  for (const raw of incoming) {
    const name = normalizeName(raw);
    if (!name) continue;
    if (name.length > MAX_NAME_LENGTH) res.skippedTooLong.push(name);
    else if (keys.has(nameKey(name))) res.skippedDuplicates.push(name);
    else if (names.length >= MAX_PARTICIPANTS) res.skippedOverLimit.push(name);
    else {
      names.push(name);
      keys.add(nameKey(name));
      res.added.push(name);
    }
  }
  return res;
}

/** Indexes of names that collide with an earlier name. */
export function findDuplicateIndexes(names: string[]): number[] {
  const seen = new Set<string>();
  const dupes: number[] = [];
  names.forEach((n, i) => {
    const k = nameKey(n);
    if (seen.has(k)) dupes.push(i);
    else seen.add(k);
  });
  return dupes;
}
