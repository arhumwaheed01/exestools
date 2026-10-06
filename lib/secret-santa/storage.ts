export interface Participant {
  id: string;
  name: string;
}

export interface ExclusionRule {
  id: string;
  a: string;
  b: string;
  mutual: boolean;
}

export interface EventDetails {
  eventName: string;
  budget: string;
  date: string;
  note: string;
}

export interface SavedDraw {
  code: string;
  createdAt: number;
  pairs: Record<string, string>;
}

export interface SecretSantaState {
  v: 1;
  participants: Participant[];
  exclusions: ExclusionRule[];
  details: EventDetails;
  singleCycle: boolean;
  draw: SavedDraw | null;
}

export const STORAGE_KEY = "exestools.secretsanta.v1";
export const HANDOFF_KEY = "exestools.secretsanta.hash.v1";

export const emptyDetails = (): EventDetails => ({
  eventName: "",
  budget: "",
  date: "",
  note: "",
});

export const emptyState = (): SecretSantaState => ({
  v: 1,
  participants: [],
  exclusions: [],
  details: emptyDetails(),
  singleCycle: false,
  draw: null,
});

export function loadState(): SecretSantaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as SecretSantaState;
    if (parsed?.v !== 1 || !Array.isArray(parsed.participants)) return emptyState();
    return {
      v: 1,
      participants: parsed.participants,
      exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions : [],
      details: {
        eventName: parsed.details?.eventName ?? "",
        budget: parsed.details?.budget ?? "",
        date: parsed.details?.date ?? "",
        note: parsed.details?.note ?? "",
      },
      singleCycle: Boolean(parsed.singleCycle),
      draw: parsed.draw ?? null,
    };
  } catch {
    return emptyState();
  }
}

function isEmptyState(state: SecretSantaState): boolean {
  return (
    state.participants.length === 0 &&
    state.exclusions.length === 0 &&
    !state.details.eventName &&
    !state.details.budget &&
    !state.details.date &&
    !state.details.note &&
    !state.singleCycle &&
    !state.draw
  );
}

export function saveState(state: SecretSantaState): void {
  try {
    if (isEmptyState(state)) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function randomId(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i]! % chars.length];
  return out;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeDrawCode(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(4));
  let out = "";
  for (let i = 0; i < 4; i++) out += CODE_CHARS[bytes[i]! % CODE_CHARS.length];
  return out;
}
