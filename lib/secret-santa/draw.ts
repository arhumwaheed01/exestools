// Constrained derangement for Secret Santa. Pure functions, no DOM, no network.

export const MIN_PARTICIPANTS = 3;
export const MAX_PARTICIPANTS = 50;

/** Returns an integer in [0, maxExclusive). Must be uniform. */
export type RandomInt = (maxExclusive: number) => number;

/** Exclusion between participant indexes. mutual=false means only `from` may not draw `to`. */
export interface Exclusion {
  from: number;
  to: number;
  mutual: boolean;
}

export interface DrawOptions {
  /** Everyone in one loop (A→B→C→…→A). Off by default. */
  singleCycle?: boolean;
  /** Injected RNG for tests. Defaults to crypto-backed secureRandomInt. */
  randomInt?: RandomInt;
  /** Pure shuffle-and-check retries before falling back to search. */
  maxShuffleAttempts?: number;
  /** Node budget for the single-cycle backtracking search. */
  maxSearchSteps?: number;
}

export type DrawFailureReason =
  | "too_few"
  | "too_many"
  | "impossible"
  | "no_loop"
  | "not_found";

export type DrawResult =
  | { ok: true; assignment: number[] }
  | {
      ok: false;
      reason: DrawFailureReason;
      blockedGivers?: number[];
      blockedReceivers?: number[];
      hallGivers?: number[];
      hallReceivers?: number[];
    };

/** Crypto-backed uniform integer using rejection sampling (no modulo bias). */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > 2 ** 32) {
    throw new RangeError("maxExclusive must be an integer in 1..2^32");
  }
  const limit = Math.floor(2 ** 32 / maxExclusive) * maxExclusive;
  for (;;) {
    const x = nextUint32();
    if (x < limit) return x % maxExclusive;
  }
}

const pool = new Uint32Array(256);
let poolIndex = pool.length;
function nextUint32(): number {
  if (poolIndex >= pool.length) {
    globalThis.crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++]!;
}

/** In-place Fisher–Yates shuffle. */
export function shuffle<T>(arr: T[], randomInt: RandomInt = secureRandomInt): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** allowed[g][r] === true when giver g may draw receiver r. */
export function buildAllowed(n: number, exclusions: Exclusion[]): boolean[][] {
  const allowed = Array.from({ length: n }, (_, g) =>
    Array.from({ length: n }, (_, r) => g !== r),
  );
  for (const { from, to, mutual } of exclusions) {
    if (from < 0 || to < 0 || from >= n || to >= n || from === to) continue;
    allowed[from]![to] = false;
    if (mutual) allowed[to]![from] = false;
  }
  return allowed;
}

/** Validates a finished assignment against the rules. */
export function isValidAssignment(
  assignment: number[],
  allowed: boolean[][],
  singleCycle = false,
): boolean {
  const n = allowed.length;
  if (assignment.length !== n) return false;
  const seen = new Set<number>();
  for (let g = 0; g < n; g++) {
    const r = assignment[g]!;
    if (!Number.isInteger(r) || r < 0 || r >= n) return false;
    if (r === g || !allowed[g]![r] || seen.has(r)) return false;
    seen.add(r);
  }
  if (singleCycle) {
    let steps = 0;
    let cur = 0;
    do {
      cur = assignment[cur]!;
      steps++;
    } while (cur !== 0 && steps <= n);
    if (steps !== n) return false;
  }
  return true;
}

function randomizedMatching(allowed: boolean[][], randomInt: RandomInt): number[] {
  const n = allowed.length;
  const adj = allowed.map((row) =>
    shuffle(
      row.flatMap((ok, r) => (ok ? [r] : [])),
      randomInt,
    ),
  );
  const matchOfReceiver = new Array<number>(n).fill(-1);
  const tryAssign = (g: number, visited: boolean[]): boolean => {
    for (const r of adj[g]!) {
      if (visited[r]) continue;
      visited[r] = true;
      if (matchOfReceiver[r] === -1 || tryAssign(matchOfReceiver[r]!, visited)) {
        matchOfReceiver[r] = g;
        return true;
      }
    }
    return false;
  };
  for (const g of shuffle([...Array(n).keys()], randomInt)) {
    tryAssign(g, new Array<boolean>(n).fill(false));
  }
  return matchOfReceiver;
}

function diagnose(allowed: boolean[][], matchOfReceiver: number[]): DrawResult {
  const n = allowed.length;
  const blockedGivers = [...Array(n).keys()].filter((g) => !allowed[g]!.some(Boolean));
  const blockedReceivers = [...Array(n).keys()].filter((r) => !allowed.some((row) => row[r]));
  const giverMatched = new Array<boolean>(n).fill(false);
  matchOfReceiver.forEach((g) => {
    if (g >= 0) giverMatched[g] = true;
  });
  const start = giverMatched.findIndex((m) => !m);
  const hallGivers = new Set<number>();
  const hallReceivers = new Set<number>();
  if (start >= 0) {
    const queue = [start];
    hallGivers.add(start);
    while (queue.length) {
      const g = queue.shift()!;
      for (let r = 0; r < n; r++) {
        if (!allowed[g]![r] || hallReceivers.has(r)) continue;
        hallReceivers.add(r);
        const next = matchOfReceiver[r]!;
        if (next >= 0 && !hallGivers.has(next)) {
          hallGivers.add(next);
          queue.push(next);
        }
      }
    }
  }
  return {
    ok: false,
    reason: "impossible",
    blockedGivers,
    blockedReceivers,
    hallGivers: [...hallGivers].sort((a, b) => a - b),
    hallReceivers: [...hallReceivers].sort((a, b) => a - b),
  };
}

function drawSingleCycle(
  allowed: boolean[][],
  randomInt: RandomInt,
  maxShuffleAttempts: number,
  maxSearchSteps: number,
): DrawResult {
  const n = allowed.length;
  const toAssignment = (order: number[]) => {
    const a = new Array<number>(n);
    for (let k = 0; k < n; k++) a[order[k]!] = order[(k + 1) % n]!;
    return a;
  };
  for (let attempt = 0; attempt < maxShuffleAttempts; attempt++) {
    const order = shuffle([...Array(n).keys()], randomInt);
    let ok = true;
    for (let k = 0; k < n && ok; k++) ok = allowed[order[k]!]![order[(k + 1) % n]!]!;
    if (ok) return { ok: true, assignment: toAssignment(order) };
  }
  const start = randomInt(n);
  const path = [start];
  const used = new Array<boolean>(n).fill(false);
  used[start] = true;
  let steps = 0;
  let exhausted = true;
  const dfs = (): boolean => {
    if (++steps > maxSearchSteps) {
      exhausted = false;
      return false;
    }
    const last = path[path.length - 1]!;
    if (path.length === n) return allowed[last]![start]!;
    const options = shuffle(
      [...Array(n).keys()].filter((r) => !used[r] && allowed[last]![r]),
      randomInt,
    );
    for (const r of options) {
      used[r] = true;
      path.push(r);
      if (dfs()) return true;
      path.pop();
      used[r] = false;
      if (steps > maxSearchSteps) return false;
    }
    return false;
  };
  if (dfs()) return { ok: true, assignment: toAssignment(path) };
  return { ok: false, reason: exhausted ? "no_loop" : "not_found" };
}

export function drawSecretSanta(
  n: number,
  exclusions: Exclusion[],
  options: DrawOptions = {},
): DrawResult {
  const {
    singleCycle = false,
    randomInt = secureRandomInt,
    maxShuffleAttempts = 5000,
    maxSearchSteps = 200_000,
  } = options;

  if (n < MIN_PARTICIPANTS) return { ok: false, reason: "too_few" };
  if (n > MAX_PARTICIPANTS) return { ok: false, reason: "too_many" };

  const allowed = buildAllowed(n, exclusions);

  const probe = randomizedMatching(allowed, randomInt);
  if (probe.some((g) => g === -1)) return diagnose(allowed, probe);

  if (singleCycle) {
    const res = drawSingleCycle(allowed, randomInt, maxShuffleAttempts, maxSearchSteps);
    if (res.ok && !isValidAssignment(res.assignment, allowed, true)) {
      throw new Error("Internal error: invalid single-cycle assignment");
    }
    return res;
  }

  for (let attempt = 0; attempt < maxShuffleAttempts; attempt++) {
    const perm = shuffle([...Array(n).keys()], randomInt);
    let ok = true;
    for (let g = 0; g < n && ok; g++) ok = allowed[g]![perm[g]!]!;
    if (ok) return { ok: true, assignment: perm };
  }

  const matchOfReceiver = randomizedMatching(allowed, randomInt);
  const assignment = new Array<number>(n);
  matchOfReceiver.forEach((g, r) => {
    assignment[g] = r;
  });
  for (let k = 0; k < n * 50; k++) {
    const a = randomInt(n);
    const b = randomInt(n);
    if (a !== b && allowed[a]![assignment[b]!]! && allowed[b]![assignment[a]!]!) {
      [assignment[a], assignment[b]] = [assignment[b]!, assignment[a]!];
    }
  }
  if (!isValidAssignment(assignment, allowed)) {
    throw new Error("Internal error: invalid assignment");
  }
  return { ok: true, assignment };
}
