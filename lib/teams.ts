import { shuffle } from "@/lib/random";

export const MAX_TEAM_NAMES = 200;
export const MAX_TEAMS = 50;
export const MAX_PER_TEAM = 100;

export const TEAM_SAMPLE_NAMES = [
  "Ava",
  "Noah",
  "Mia",
  "Liam",
  "Sophia",
  "Ethan",
  "Isabella",
  "Lucas",
  "Harper",
  "Mason",
  "Amelia",
  "Elijah",
] as const;

export type TeamMode = "groups" | "size";

export type TeamSettings = {
  mode: TeamMode;
  /** Number of teams (groups) or people per team (size). */
  n: number;
  leaveOut: boolean;
  teamNames: string[];
};

export type TeamCard = {
  name: string;
  members: string[];
};

export type TeamResult = {
  teams: TeamCard[];
  sitsOut: string | null;
  /** Member indices into the original names array (for share links). */
  memberIndices: number[][];
  sitsOutIndex: number | null;
  status: string;
};

export type ParsedTeamNames = {
  names: string[];
  overLimit: number;
  /** Labels that appear more than once (case-insensitive), first-seen casing. */
  duplicateLabels: string[];
  /** Sum of counts for groups with count > 1 (always ≥ 2 when labels exist). */
  duplicateCount: number;
};

export function parseTeamNames(raw: string): ParsedTeamNames {
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.slice(0, 64));
  const overLimit = Math.max(0, lines.length - MAX_TEAM_NAMES);
  const names = lines.slice(0, MAX_TEAM_NAMES);

  const counts = new Map<string, { label: string; count: number }>();
  for (const name of names) {
    const key = name.toLocaleLowerCase();
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { label: name, count: 1 });
  }
  const dupGroups = [...counts.values()].filter((c) => c.count > 1);
  const duplicateLabels = dupGroups.map((c) => c.label);
  const duplicateCount = dupGroups.reduce((s, g) => s + g.count, 0);

  return { names, overLimit, duplicateLabels, duplicateCount };
}

function teamLabel(i: number, custom: string[]): string {
  const customName = custom[i]?.trim();
  return customName || `Team ${i + 1}`;
}

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

function statusLine(
  teamCount: number,
  nameCount: number,
  sizes: number[],
  sitsOut: string | null,
  asPairs: boolean,
): string {
  if (sitsOut) {
    return `Made ${teamCount} ${plural(teamCount, "pair", "pairs")} from ${nameCount} names; ${sitsOut} sits out.`;
  }
  if (asPairs) {
    return `Made ${teamCount} ${plural(teamCount, "pair", "pairs")} from ${nameCount} names: ${sizes.join(", ")}.`;
  }
  return `Made ${teamCount} ${plural(teamCount, "team", "teams")} from ${nameCount} names: ${sizes.join(", ")}.`;
}

/** Deal shuffled indices round-robin into `g` teams. */
function dealRoundRobin(indices: number[], g: number): number[][] {
  const teams: number[][] = Array.from({ length: g }, () => []);
  indices.forEach((idx, i) => {
    teams[i % g]!.push(idx);
  });
  return teams;
}

export function clampTeamN(mode: TeamMode, n: number, nameCount: number): number {
  if (mode === "groups") {
    return Math.min(Math.max(2, n), MAX_TEAMS, Math.max(2, nameCount));
  }
  return Math.min(Math.max(1, n), MAX_PER_TEAM, Math.max(1, nameCount));
}

export function generateTeams(names: string[], settings: TeamSettings): TeamResult {
  const n = names.length;
  if (n < 2) {
    return {
      teams: [],
      sitsOut: null,
      memberIndices: [],
      sitsOutIndex: null,
      status: "Add at least 2 names.",
    };
  }

  const customNames = settings.teamNames
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  let sitsOutIndex: number | null = null;
  let workingIndices = names.map((_, i) => i);
  let g: number;
  let asPairs = false;

  if (settings.mode === "groups") {
    g = Math.min(Math.max(2, settings.n), MAX_TEAMS, n);
    workingIndices = shuffle(workingIndices);
  } else {
    const k = Math.min(Math.max(1, settings.n), MAX_PER_TEAM, n);
    asPairs = k === 2;
    if (k === 2 && n % 2 === 1 && settings.leaveOut) {
      workingIndices = shuffle(workingIndices);
      sitsOutIndex = workingIndices[workingIndices.length - 1]!;
      workingIndices = workingIndices.slice(0, -1);
      g = workingIndices.length / 2;
    } else if (k === 2 && n % 2 === 1) {
      g = Math.floor(n / 2);
      workingIndices = shuffle(workingIndices);
    } else {
      g = Math.ceil(n / k);
      workingIndices = shuffle(workingIndices);
    }
  }

  g = Math.max(1, Math.min(g, workingIndices.length));
  const memberIndices = dealRoundRobin(workingIndices, g);
  const teams: TeamCard[] = memberIndices.map((idxs, i) => ({
    name: teamLabel(i, customNames),
    members: idxs.map((idx) => names[idx]!),
  }));

  const sitsOut = sitsOutIndex !== null ? names[sitsOutIndex]! : null;
  const sizes = teams.map((t) => t.members.length);
  const status = statusLine(teams.length, n, sizes, sitsOut, asPairs);

  return { teams, sitsOut, memberIndices, sitsOutIndex, status };
}

export function formatTeamsPlain(
  teams: TeamCard[],
  sitsOut: string | null,
): string {
  const lines = teams.map((t) => `${t.name}: ${t.members.join(", ")}`);
  if (sitsOut) lines.push(`Sits out: ${sitsOut}`);
  return lines.join("\n");
}

/** Rebuild result cards from share payload indices. */
export function teamsFromIndices(
  names: string[],
  memberIndices: number[][],
  sitsOutIndex: number | null,
  teamNames: string[],
  asPairs = false,
): TeamResult {
  const customNames = teamNames.map((s) => s.trim()).filter(Boolean);
  const teams: TeamCard[] = memberIndices.map((idxs, i) => ({
    name: teamLabel(i, customNames),
    members: idxs.map((idx) => names[idx]!).filter(Boolean),
  }));
  const sitsOut =
    sitsOutIndex !== null && sitsOutIndex >= 0 && sitsOutIndex < names.length
      ? names[sitsOutIndex]!
      : null;
  const sizes = teams.map((t) => t.members.length);
  const status = statusLine(teams.length, names.length, sizes, sitsOut, asPairs || Boolean(sitsOut));
  return { teams, sitsOut, memberIndices, sitsOutIndex, status };
}
