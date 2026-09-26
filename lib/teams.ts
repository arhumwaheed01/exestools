import { shuffle } from "@/lib/random";

export const MAX_TEAM_NAMES = 200;
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
  const duplicateLabels = [...counts.values()]
    .filter((c) => c.count > 1)
    .map((c) => c.label);

  return { names, overLimit, duplicateLabels };
}

function teamLabel(i: number, custom: string[]): string {
  const customName = custom[i]?.trim();
  return customName || `Team ${i + 1}`;
}

/** Deal shuffled indices round-robin into `g` teams. */
function dealRoundRobin(indices: number[], g: number): number[][] {
  const teams: number[][] = Array.from({ length: g }, () => []);
  indices.forEach((idx, i) => {
    teams[i % g]!.push(idx);
  });
  return teams;
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

  if (settings.mode === "groups") {
    g = Math.min(Math.max(2, settings.n), n);
    workingIndices = shuffle(workingIndices);
  } else {
    // People per team
    const k = Math.min(Math.max(1, settings.n), n);
    if (k === 2 && n % 2 === 1 && settings.leaveOut) {
      workingIndices = shuffle(workingIndices);
      sitsOutIndex = workingIndices[workingIndices.length - 1]!;
      workingIndices = workingIndices.slice(0, -1);
      g = workingIndices.length / 2;
    } else if (k === 2 && n % 2 === 1) {
      // One group of 3: floor(n/2) teams
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
  const status = sitsOut
    ? `Made ${teams.length} pairs from ${n} names; ${sitsOut} sits out.`
    : `Made ${teams.length} teams from ${n} names: ${sizes.join(", ")}.`;

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
  const status = sitsOut
    ? `Made ${teams.length} pairs from ${names.length} names; ${sitsOut} sits out.`
    : `Made ${teams.length} teams from ${names.length} names: ${sizes.join(", ")}.`;
  return { teams, sitsOut, memberIndices, sitsOutIndex, status };
}
