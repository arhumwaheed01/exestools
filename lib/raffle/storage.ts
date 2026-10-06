import type { DuplicateMode } from "./entries";
import type { RafflePick } from "./draw";
import type { DrawRecord } from "./record";

export interface RaffleState {
  v: 1;
  mode: "list" | "range";
  listText: string;
  multipleTickets: boolean;
  duplicates: DuplicateMode;
  range: { start: string; end: string; prefix: string; pad: boolean; excludeText: string };
  title: string;
  winners: number;
  alternates: number;
  prizesText: string;
  allowRepeatWinners: boolean;
  reveal: "all" | "one";
  draw: { picks: RafflePick[]; record: DrawRecord } | null;
}

export const STORAGE_KEY = "exestools.raffle.v1";
export const HANDOFF_KEY = "exestools.raffle.hash.v1";

export function emptyState(): RaffleState {
  return {
    v: 1,
    mode: "list",
    listText: "",
    multipleTickets: false,
    duplicates: "combine",
    range: { start: "1", end: "100", prefix: "", pad: false, excludeText: "" },
    title: "",
    winners: 1,
    alternates: 0,
    prizesText: "",
    allowRepeatWinners: false,
    reveal: "all",
    draw: null,
  };
}

export function loadState(): RaffleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const p = JSON.parse(raw);
    if (p?.v !== 1) return emptyState();
    return { ...emptyState(), ...p, v: 1 };
  } catch {
    return emptyState();
  }
}

export function saveState(state: RaffleState): void {
  try {
    const empty =
      !state.listText.trim() &&
      !state.title &&
      !state.draw &&
      state.mode === "list" &&
      !state.multipleTickets &&
      state.duplicates === "combine" &&
      state.winners === 1 &&
      state.alternates === 0 &&
      !state.prizesText &&
      !state.allowRepeatWinners &&
      state.reveal === "all" &&
      state.range.start === "1" &&
      state.range.end === "100" &&
      !state.range.prefix &&
      !state.range.pad &&
      !state.range.excludeText;
    // Always save for raffle - pack doesn't require remove on empty like secret santa. Just save.
    void empty;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") throw e;
  }
}
