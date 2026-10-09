"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CardGrid } from "@/components/bingo/CardGrid";
import {
  calledListText,
  drawNext,
  formatCall,
  isFinished,
  newCaller,
  restoreCaller,
  undoLast,
  type CallerState,
} from "@/lib/bingo/caller";
import {
  NUMBERS_MAX_MAX,
  NUMBERS_MIN_MAX,
  callPool,
  cardErrorMessage,
  generateCards,
  type BingoMode,
  type Card,
  type CardSetConfig,
} from "@/lib/bingo/cards";
import {
  decodePlayerHash,
  decodeSetHash,
  encodePlayerHash,
  playerUrl,
  readBingoHash,
  setUrl,
  type SharedSet,
} from "@/lib/bingo/codec";
import {
  MAX_CARDS,
  MAX_SUBTITLE_LENGTH,
  MAX_TITLE_LENGTH,
  canHaveFree,
  clampCardCount,
  itemsNeeded,
  listStatus,
  parseList,
  type GridSize,
} from "@/lib/bingo/list";
import { PRESET_META } from "@/lib/bingo/preset-meta";
import { newSeed } from "@/lib/bingo/rng";
import {
  HASH_KEY,
  clearHashHandoff,
  clearMarks,
  loadHashHandoff,
  loadMarks,
  loadStoredBingo,
  saveMark,
  saveStoredBingo,
  type StoredBingo,
} from "@/lib/bingo/storage";
import {
  checkCard,
  evaluate,
  winMessage,
  type Pattern,
} from "@/lib/bingo/win";
import { track } from "@/lib/track";

const PrintSheets = dynamic(
  () => import("@/components/bingo/PrintSheets").then((m) => m.PrintSheets),
  { ssr: false },
);

const BingoHostPanels = dynamic(
  () => import("@/components/bingo/BingoHostPanels").then((m) => m.BingoHostPanels),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[280px] animate-pulse rounded-3xl border border-border bg-surface p-5 print:hidden"
        aria-hidden
      />
    ),
  },
);

const BingoPlayerLinks = dynamic(
  () => import("@/components/bingo/BingoPlayerLinks").then((m) => m.BingoPlayerLinks),
  {
    ssr: false,
    loading: () => (
      <div
        className="mt-3 min-h-24 animate-pulse rounded-2xl border border-border p-3"
        aria-hidden
      />
    ),
  },
);

const TOOL_ID = "bingo-card-generator";

function defaultPaper(): "a4" | "letter" {
  try {
    const lang = navigator.language || "";
    if (/^(en-US|en-CA|es-MX)/i.test(lang)) return "letter";
  } catch {
    /* ignore */
  }
  return "a4";
}

function emptyBingo(): StoredBingo {
  return {
    v: 1,
    mode: "words",
    text: "",
    max: 30,
    size: 5,
    free: true,
    count: 30,
    title: "Bingo",
    subtitle: "",
    paper: defaultPaper(),
    perPage: 2,
    callSheet: true,
  };
}

function settingsFingerprint(s: {
  mode: BingoMode;
  text: string;
  max: number;
  size: GridSize;
  free: boolean;
  count: number;
}): string {
  return JSON.stringify({
    mode: s.mode,
    text: s.text,
    max: s.max,
    size: s.size,
    free: s.free,
    count: s.count,
  });
}

function takeIncomingHash(): string | null {
  const fromUrl = window.location.hash;
  if (/^#[bp]=v1\./.test(fromUrl)) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
    try {
      sessionStorage.setItem(HASH_KEY, fromUrl);
    } catch {
      /* ignore */
    }
    return fromUrl;
  }
  return loadHashHandoff();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function Switch({
  id,
  label,
  checked,
  disabled,
  onChange,
  helper,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  helper?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-border p-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {helper ? <p className="mt-1 text-xs text-muted">{helper}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
          checked ? "bg-accent-strong" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function Stepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
  onClampAnnounce,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onClampAnnounce?: (msg: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-lg font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (!Number.isFinite(raw)) return;
            onChange(Math.min(max, Math.max(min, Math.round(raw))));
          }}
          onBlur={(e) => {
            const raw = Number(e.target.value);
            const next = clampCardCount(raw);
            if (next !== value) onChange(next);
            if (Number.isFinite(raw) && raw > max) {
              onClampAnnounce?.(`Set to ${max} cards, the most per set.`);
            }
          }}
          className="w-16 min-h-11 rounded-xl border border-border bg-background px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-lg font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function RadioChip({
  name,
  checked,
  onChange,
  children,
  disabled,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:checked]:border-accent has-[:checked]:bg-surface-2 ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}

type PlayerPayload = { set: SharedSet; card: number };

function PlayerView({
  payload,
  onMakeOwn,
}: {
  payload: PlayerPayload;
  onMakeOwn: () => void;
}) {
  const { set, card: cardNumber } = payload;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState("");
  const tracked = useRef(false);

  const result = useMemo(() => generateCards(set), [set]);
  const card = result.ok ? result.cards[cardNumber - 1] : null;
  const cellCount = set.size * set.size;

  const [marks, setMarks] = useState<boolean[]>(() =>
    loadMarks(set.seed, cardNumber, cellCount),
  );

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("bingo_player_open", {
        toolId: TOOL_ID,
        mode: set.mode,
        size: set.size,
      });
    }
    headingRef.current?.focus();
  }, [set.mode, set.size]);

  useEffect(() => {
    setMarks(loadMarks(set.seed, cardNumber, cellCount));
  }, [set.seed, cardNumber, cellCount]);

  const toggle = (index: number) => {
    if (!card || card.cells[index] === null) return;
    setMarks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      saveMark(set.seed, cardNumber, next);
      const rep = evaluate(set.size, next.map((m, i) => m || card.cells[i] === null));
      if (rep.lines.length > 0 || rep.full) {
        setStatus(
          `Line complete! Call "Bingo!" and show your card number: ${cardNumber}.`,
        );
      } else {
        setStatus("");
      }
      return next;
    });
  };

  const clear = () => {
    if (!window.confirm("Clear your marks on this card?")) return;
    const empty = Array(cellCount).fill(false);
    setMarks(empty);
    clearMarks(set.seed, cardNumber);
    setStatus("Marks cleared.");
  };

  if (!result.ok || !card) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-foreground">
          This player link looks incomplete or damaged. Ask the host to send it again.
        </p>
        <button
          type="button"
          onClick={onMakeOwn}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Make your own bingo cards
        </button>
      </div>
    );
  }

  const marksWithFree = marks.map((m, i) => m || card.cells[i] === null);

  return (
    <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-bold text-foreground outline-none"
      >
        {set.title || "Bingo"}
      </h2>
      {set.subtitle ? <p className="text-sm text-muted">{set.subtitle}</p> : null}
      <p className="text-sm text-muted">
        Card {cardNumber} · Set{" "}
        <span className="font-mono" aria-label={`Set code ${[...set.seed].join(" ")}`}>
          {set.seed}
        </span>
      </p>

      <div className="mx-auto w-full max-w-[min(100%,28rem)] min-w-0">
        <CardGrid
          card={card}
          size={set.size}
          mode={set.mode}
          title={set.title}
          subtitle={set.subtitle}
          seed={set.seed}
          interactive
          marks={marksWithFree}
          onToggle={toggle}
        />
      </div>

      <p className="text-sm text-muted">
        Tap a square when it&apos;s called. Your marks are saved on this device.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={clear}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear my marks
        </button>
        <button
          type="button"
          onClick={onMakeOwn}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Make your own bingo cards
        </button>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {status}
      </div>
      {status ? <p className="text-sm font-semibold text-foreground">{status}</p> : null}
    </div>
  );
}

export function BingoTool() {
  const [ready, setReady] = useState(false);
  /** True only after localStorage (and cards/caller) have been applied — gates autosave. */
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<BingoMode>("words");
  const [text, setText] = useState("");
  const [presetId, setPresetId] = useState<string | undefined>();
  const [presetHint, setPresetHint] = useState("");
  const [max, setMax] = useState(30);
  const [size, setSize] = useState<GridSize>(5);
  const [free, setFree] = useState(true);
  const [count, setCount] = useState(30);
  const [title, setTitle] = useState("Bingo");
  const [subtitle, setSubtitle] = useState("");
  const [paper, setPaper] = useState<"a4" | "letter">("a4");
  const [perPage, setPerPage] = useState<2 | 4>(2);
  const [callSheet, setCallSheet] = useState(true);
  const [seed, setSeed] = useState<string | undefined>();
  const [cards, setCards] = useState<Card[]>([]);
  const [sameSquares, setSameSquares] = useState(false);
  const [generatedFp, setGeneratedFp] = useState<string | null>(null);
  const [caller, setCaller] = useState<CallerState>(() => newCaller([]));
  const [previewIdx, setPreviewIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [playerLinksOpen, setPlayerLinksOpen] = useState(false);
  const [playerCardN, setPlayerCardN] = useState(1);
  const [checkN, setCheckN] = useState(1);
  const [pattern, setPattern] = useState<Pattern>("line");
  const [checkMsg, setCheckMsg] = useState("");
  const [checkHighlight, setCheckHighlight] = useState<number[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [callerAnnounce, setCallerAnnounce] = useState("");
  const [printing, setPrinting] = useState(false);
  const [player, setPlayer] = useState<PlayerPayload | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  const cardsHeadingRef = useRef<HTMLHeadingElement>(null);
  const modeControlRef = useRef<HTMLDivElement>(null);
  const callNextRef = useRef<HTMLButtonElement>(null);
  const checkResultRef = useRef<HTMLParagraphElement>(null);
  const statusTimer = useRef(0);
  const saveTimer = useRef(0);
  const shareTracked = useRef(false);
  const callTrackedAt = useRef(0);
  const presetsLoadRef = useRef<Promise<typeof import("@/lib/bingo/presets")> | null>(
    null,
  );

  const listStatusId = useId();
  const makeDescId = useId();
  const checkSelectId = useId();

  const freeEffective = free && canHaveFree(size);
  const parsed = useMemo(() => parseList(text), [text]);
  const needed = itemsNeeded(size, freeEffective);

  const announce = useCallback((msg: string) => {
    setStatus(msg);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 5000);
  }, []);

  const currentFp = useMemo(
    () => settingsFingerprint({ mode, text, max, size, free: freeEffective, count }),
    [mode, text, max, size, freeEffective, count],
  );
  const outdated = Boolean(cards.length && generatedFp && generatedFp !== currentFp);

  const buildConfig = useCallback(
    (useSeed: string): CardSetConfig => ({
      mode,
      size: mode === "bingo75" ? 5 : size,
      free: freeEffective,
      count,
      seed: useSeed,
      ...(mode === "words" ? { items: parsed.items } : {}),
      ...(mode === "numbers" ? { max } : {}),
    }),
    [mode, size, freeEffective, count, parsed.items, max],
  );

  const toSharedSet = useCallback(
    (useSeed: string): SharedSet => ({
      ...buildConfig(useSeed),
      title: title.slice(0, MAX_TITLE_LENGTH),
      ...(subtitle.trim()
        ? { subtitle: subtitle.slice(0, MAX_SUBTITLE_LENGTH) }
        : {}),
    }),
    [buildConfig, title, subtitle],
  );

  const buildStored = useCallback(
    (called: string[] = caller.called): StoredBingo => ({
      v: 1,
      mode,
      text: text.slice(0, 12_000),
      presetId,
      max,
      size,
      free,
      count,
      title,
      subtitle,
      paper,
      perPage,
      callSheet,
      seed,
      caller: { called },
    }),
    [
      mode,
      text,
      presetId,
      max,
      size,
      free,
      count,
      title,
      subtitle,
      paper,
      perPage,
      callSheet,
      seed,
      caller.called,
    ],
  );

  const persist = useCallback(() => {
    if (!hydrated) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveStoredBingo(buildStored());
    }, 300);
  }, [hydrated, buildStored]);

  const storedSnapshotRef = useRef<StoredBingo>(buildStored());
  storedSnapshotRef.current = buildStored();
  const hydratedRef = useRef(hydrated);
  hydratedRef.current = hydrated;

  /** Sync write — used after Call next / Undo so a fast reload can't drop the last call. */
  const persistNow = useCallback(
    (called?: string[]) => {
      if (!hydrated) return;
      window.clearTimeout(saveTimer.current);
      const next = buildStored(called);
      storedSnapshotRef.current = next;
      saveStoredBingo(next);
    },
    [hydrated, buildStored],
  );

  useEffect(() => {
    if (!hydrated) return;
    persist();
  }, [hydrated, persist]);

  useEffect(() => {
    const flush = () => {
      if (!hydratedRef.current) return;
      window.clearTimeout(saveTimer.current);
      saveStoredBingo(storedSnapshotRef.current);
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.clearTimeout(saveTimer.current);
    };
  }, []);

  const restoreCardsFromStored = (stored: StoredBingo) => {
    if (!stored.seed) return;
    const cfg: CardSetConfig = {
      mode: stored.mode,
      size: stored.mode === "bingo75" ? 5 : stored.size,
      free: stored.free && canHaveFree(stored.size),
      count: stored.count,
      seed: stored.seed,
      ...(stored.mode === "words" ? { items: parseList(stored.text).items } : {}),
      ...(stored.mode === "numbers" ? { max: stored.max } : {}),
    };
    const gen = generateCards(cfg);
    if (!gen.ok) return;
    setCards(gen.cards);
    setSameSquares(gen.sameSquaresOnEveryCard);
    setGeneratedFp(
      settingsFingerprint({
        mode: stored.mode,
        text: stored.text,
        max: stored.max,
        size: stored.mode === "bingo75" ? 5 : stored.size,
        free: stored.free && canHaveFree(stored.size),
        count: stored.count,
      }),
    );
    const pool = callPool(cfg);
    setCaller(restoreCaller(pool, stored.caller?.called));
  };

  const applySharedSet = useCallback(
    (shared: SharedSet, announceOpen = true) => {
      const nextSize = shared.mode === "bingo75" ? 5 : shared.size;
      setMode(shared.mode);
      setSize(nextSize);
      setFree(shared.free);
      setCount(shared.count);
      setTitle(shared.title || "Bingo");
      setSubtitle(shared.subtitle ?? "");
      setSeed(shared.seed);
      setPresetId(undefined);
      setPresetHint("");
      if (shared.mode === "words") {
        const t = (shared.items ?? []).join("\n");
        setText(t);
      } else if (shared.mode === "numbers") {
        setMax(shared.max ?? 30);
        setText("");
      } else {
        setText("");
      }
      const cfg: CardSetConfig = {
        mode: shared.mode,
        size: nextSize,
        free: shared.free && canHaveFree(nextSize),
        count: shared.count,
        seed: shared.seed,
        ...(shared.mode === "words" ? { items: shared.items } : {}),
        ...(shared.mode === "numbers" ? { max: shared.max } : {}),
      };
      const gen = generateCards(cfg);
      if (gen.ok) {
        setCards(gen.cards);
        setSameSquares(gen.sameSquaresOnEveryCard);
        setGeneratedFp(
          settingsFingerprint({
            mode: shared.mode,
            text: shared.mode === "words" ? (shared.items ?? []).join("\n") : "",
            max: shared.max ?? 30,
            size: nextSize,
            free: shared.free && canHaveFree(nextSize),
            count: shared.count,
          }),
        );
        setPreviewIdx(0);
        setCheckN(1);
        setPlayerCardN(1);
        const pool = callPool(cfg);
        setCaller(newCaller(pool));
        if (announceOpen) {
          announce(
            `Opened shared set. Made ${gen.cards.length} different cards. Set code ${shared.seed}.`,
          );
        }
      } else {
        setError(cardErrorMessage(gen.error));
        setCards([]);
      }
    },
    [announce],
  );

  useEffect(() => {
    const stored = loadStoredBingo() ?? emptyBingo();
    setMode(stored.mode);
    setText(stored.text);
    setPresetId(stored.presetId);
    setMax(stored.max);
    setSize(stored.size);
    setFree(stored.free);
    setCount(stored.count);
    setTitle(stored.title || "Bingo");
    setSubtitle(stored.subtitle);
    setPaper(stored.paper);
    setPerPage(stored.perPage);
    setCallSheet(stored.callSheet);
    setSeed(stored.seed);

    const hash = takeIncomingHash();
    const kind = hash ? readBingoHash(hash) : null;

    if (kind === "player" && hash) {
      const decoded = decodePlayerHash(hash);
      if (decoded) {
        setPlayer(decoded);
        if (!shareTracked.current) {
          shareTracked.current = true;
          track("share_open", { toolId: TOOL_ID, via: "hash" });
        }
      } else {
        announce("This player link looks incomplete or damaged.");
      }
      setHydrated(true);
      setReady(true);
      return;
    }

    if (kind === "set" && hash) {
      const shared = decodeSetHash(hash);
      if (!shared) {
        announce("This set link looks incomplete or damaged.");
        if (!shareTracked.current) {
          shareTracked.current = true;
          track("share_open", { toolId: TOOL_ID, via: "hash" });
        }
      } else {
        const localText = stored.text.trim();
        const sharedText =
          shared.mode === "words" ? (shared.items ?? []).join("\n").trim() : "";
        const differs =
          Boolean(localText) &&
          (shared.mode !== stored.mode ||
            (shared.mode === "words" && localText !== sharedText) ||
            (shared.mode === "numbers" && shared.max !== stored.max) ||
            stored.seed !== shared.seed);
        const open =
          !differs ||
          window.confirm(
            "Open the shared cards? This replaces your list on this device.",
          );
        if (open) {
          applySharedSet(shared);
          if (!shareTracked.current) {
            shareTracked.current = true;
            track("share_open", { toolId: TOOL_ID, via: "hash" });
          }
        } else if (stored.seed) {
          restoreCardsFromStored(stored);
        }
      }
      setHydrated(true);
      setReady(true);
      return;
    }

    restoreCardsFromStored(stored);
    setHydrated(true);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const trackGenerate = (
    result: "success" | "not_enough_items" | "not_enough_unique" | "bad",
    opts: { isNew: boolean; cardsN: number; itemsN: number },
  ) => {
    const mapped =
      result === "not_enough_items" || result === "not_enough_unique"
        ? result
        : result === "success"
          ? "success"
          : "not_enough_items";
    track("bingo_generate", {
      toolId: TOOL_ID,
      result: mapped,
      mode,
      size: mode === "bingo75" ? 5 : size,
      free: freeEffective ? 1 : 0,
      cards: opts.cardsN,
      items: opts.itemsN,
      preset: presetId ?? "custom",
      is_new_set: opts.isNew ? 1 : 0,
    });
  };

  const makeCards = (forceNewSeed: boolean) => {
    setError("");
    const isNew = forceNewSeed || !seed;
    const nextSeed = isNew ? newSeed() : seed!;
    const cfg = buildConfig(nextSeed);
    const gen = generateCards(cfg);
    const itemsN = mode === "words" ? parsed.items.length : mode === "numbers" ? max : 75;

    if (!gen.ok) {
      setError(cardErrorMessage(gen.error));
      const code =
        gen.error.code === "NOT_ENOUGH_ITEMS"
          ? "not_enough_items"
          : gen.error.code === "NOT_ENOUGH_UNIQUE"
            ? "not_enough_unique"
            : "bad";
      trackGenerate(code, { isNew, cardsN: count, itemsN });
      return;
    }

    setSeed(nextSeed);
    setCards(gen.cards);
    setSameSquares(gen.sameSquaresOnEveryCard);
    setGeneratedFp(currentFp);
    setPreviewIdx(0);
    setCheckN(1);
    setPlayerCardN(1);
    setCheckMsg("");
    setCheckHighlight([]);
    const pool = callPool(cfg);
    setCaller(newCaller(pool));
    callTrackedAt.current = 0;
    announce(
      `Made ${gen.cards.length} different cards. Set code ${nextSeed}.`,
    );
    trackGenerate("success", { isNew, cardsN: gen.cards.length, itemsN });
    window.requestAnimationFrame(() => cardsHeadingRef.current?.focus());
  };

  const onMakeCards = () => makeCards(false);

  const onNewCards = () => {
    if (caller.called.length > 0) {
      if (
        !window.confirm(
          "Make a new set? Cards you've printed or shared won't match the new set, and the called list will be cleared.",
        )
      ) {
        return;
      }
    }
    makeCards(true);
  };

  const notEnoughHint =
    mode === "words" && parsed.items.length < needed
      ? cardErrorMessage({
          code: "NOT_ENOUGH_ITEMS",
          needed,
          have: parsed.items.length,
        })
      : mode === "numbers" && max < needed
        ? cardErrorMessage({
            code: "NOT_ENOUGH_ITEMS",
            needed,
            have: max,
          })
        : "";

  const makeDisabled = Boolean(notEnoughHint) || (mode === "words" && parsed.items.length === 0);

  /** Full theme lists load on first chip click only (keeps initial JS light). */
  const loadPreset = async (id: string) => {
    if (!presetsLoadRef.current) {
      presetsLoadRef.current = import("@/lib/bingo/presets");
    }
    const mod = await presetsLoadRef.current;
    const p = mod.presetById(id);
    if (!p) return;
    const current = text.trim();
    const matchesPreset = mod.PRESETS.some((x) => mod.presetText(x) === current);
    if (current && !matchesPreset) {
      if (!window.confirm(`Replace your list with the ${p.label} theme?`)) return;
    }
    setText(mod.presetText(p));
    setTitle(p.title);
    setSize(p.size);
    setFree(p.free);
    setPresetId(p.id);
    setPresetHint(p.hint);
    setMode("words");
    track("preset_load", { toolId: TOOL_ID, preset: p.id });
    announce(`Loaded ${p.label} theme.`);
  };

  const onModeChange = (next: BingoMode) => {
    if (next === mode) return;
    setMode(next);
    setTitle("Bingo");
    setPresetId(undefined);
    setPresetHint("");
    if (next === "bingo75") {
      setSize(5);
      setFree(true);
    }
  };

  const onSizeChange = (next: GridSize) => {
    if (mode === "bingo75") return;
    setSize(next);
    if (!canHaveFree(next)) setFree(false);
  };

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.exestools.com";

  const copySetLink = async () => {
    if (!seed || !cards.length) return;
    try {
      const url = setUrl(origin, toSharedSet(seed));
      if (await copyText(url)) {
        announce("Set link copied.");
        track("bingo_share", { toolId: TOOL_ID, kind: "set", method: "copy" });
      } else announce("Couldn't copy the link.");
    } catch {
      announce("This list is too long for a link. Shorten it and try again.");
    }
  };

  const copyPlayerLink = async (n: number, share = false) => {
    if (!seed || !cards.length) return;
    try {
      const url = playerUrl(origin, toSharedSet(seed), n);
      if (share && navigator.share) {
        await navigator.share({ url, title: title || "Bingo card" });
        track("bingo_share", {
          toolId: TOOL_ID,
          kind: "player",
          method: "share_sheet",
        });
        announce("Player link shared.");
        return;
      }
      if (await copyText(url)) {
        announce(`Player link for card ${n} copied.`);
        track("bingo_share", { toolId: TOOL_ID, kind: "player", method: "copy" });
      } else announce("Couldn't copy the link.");
    } catch {
      announce("Couldn't share that link.");
    }
  };

  const copyAllPlayerLinks = async () => {
    if (!seed || !cards.length) return;
    try {
      const shared = toSharedSet(seed);
      const lines = cards.map(
        (c) => `Card ${c.number}: ${origin}/bingo-card-generator${encodePlayerHash(shared, c.number)}`,
      );
      if (await copyText(lines.join("\n"))) {
        announce("All player links copied.");
        track("bingo_share", {
          toolId: TOOL_ID,
          kind: "player_all",
          method: "copy",
        });
      }
    } catch {
      announce("This list is too long for player links. Shorten it and try again.");
    }
  };

  const onCallNext = () => {
    const { state, call } = drawNext(caller);
    if (!call) {
      announce("Everything has been called. Start a new game to play again.");
      return;
    }
    setCaller(state);
    persistNow(state.called);
    const label = formatCall(call, mode);
    setCallerAnnounce(label);
    const n = state.called.length;
    if (n === 1 || n % 10 === 0) {
      track("bingo_call", { toolId: TOOL_ID, mode, calls: n });
    }
  };

  const onUndoCall = () => {
    if (!caller.called.length) return;
    const last = caller.called[caller.called.length - 1]!;
    const next = undoLast(caller);
    setCaller(next);
    persistNow(next.called);
    announce(`Took back ${formatCall(last, mode)}.`);
    setCallerAnnounce("");
  };

  const onCopyCalled = async () => {
    const t = calledListText(caller, mode, title || "Bingo");
    if (await copyText(t)) {
      announce("Called list copied.");
      track("bingo_share", {
        toolId: TOOL_ID,
        kind: "called_list",
        method: "copy",
      });
    }
  };

  const onNewGame = () => {
    if (
      caller.called.length &&
      !window.confirm("Start a new game? The called list will be cleared.")
    ) {
      return;
    }
    const pool =
      seed && cards.length
        ? callPool(buildConfig(seed))
        : callPool({
            mode,
            items: parsed.items,
            max,
          });
    setCaller(newCaller(pool));
    callTrackedAt.current = 0;
    setCallerAnnounce("");
    announce("New game started.");
    window.requestAnimationFrame(() => callNextRef.current?.focus());
  };

  const onCheck = () => {
    if (!cards.length || !seed) return;
    const card = cards[checkN - 1];
    if (!card) return;
    const z = mode === "bingo75" ? 5 : size;
    const { win, report } = checkCard(card.cells, z, caller.called, pattern);
    const msg = winMessage(checkN, win, pattern, report, z);
    setCheckMsg(msg);
    const cells: number[] = [];
    if (win) {
      if (pattern === "corners") {
        cells.push(0, z - 1, z * (z - 1), z * z - 1);
      } else if (pattern === "full") {
        for (let i = 0; i < z * z; i++) cells.push(i);
      } else {
        const line = report.lines.find(
          (l) => pattern === "line" || l.kind === pattern,
        );
        if (line) cells.push(...line.cells);
      }
    }
    setCheckHighlight(cells);
    track("bingo_check", { toolId: TOOL_ID, pattern, win: win ? 1 : 0 });
    window.requestAnimationFrame(() => checkResultRef.current?.focus());
  };

  const onPrint = () => {
    if (!cards.length || !seed) return;
    setPrinting(true);
    track("bingo_print", {
      toolId: TOOL_ID,
      paper,
      per_page: perPage,
      cards: cards.length,
      call_sheet: callSheet ? 1 : 0,
    });
  };

  const onReset = () => {
    if (
      !window.confirm(
        "Clear your list, settings, cards and called list on this device?",
      )
    ) {
      return;
    }
    const alsoMarks = window.confirm("Also clear card marks saved on this device?");
    clearHashHandoff();
    try {
      localStorage.removeItem("exestools.bingo.v1");
    } catch {
      /* ignore */
    }
    if (alsoMarks) clearMarks();
    const fresh = emptyBingo();
    setMode(fresh.mode);
    setText("");
    setPresetId(undefined);
    setPresetHint("");
    setMax(fresh.max);
    setSize(fresh.size);
    setFree(fresh.free);
    setCount(fresh.count);
    setTitle(fresh.title);
    setSubtitle("");
    setPaper(fresh.paper);
    setPerPage(fresh.perPage);
    setCallSheet(true);
    setSeed(undefined);
    setCards([]);
    setSameSquares(false);
    setGeneratedFp(null);
    setCaller(newCaller([]));
    setCheckMsg("");
    setCheckHighlight([]);
    setPlayerLinksOpen(false);
    setMoreOpen(false);
    announce("Cleared.");
    window.requestAnimationFrame(() => modeControlRef.current?.focus());
  };

  const leavePlayer = () => {
    clearHashHandoff();
    setPlayer(null);
    shareTracked.current = false;
  };

  const currentCall = caller.called[caller.called.length - 1] ?? null;
  const finished = isFinished(caller);
  const previewCard = cards[previewIdx];
  const checkCardData = cards[checkN - 1];
  const checkMarks = checkCardData
    ? checkCardData.cells.map(
        (c) =>
          c === null ||
          caller.called.some((x) => x.toLocaleLowerCase() === c.toLocaleLowerCase()),
      )
    : [];

  const listLive =
    mode === "words" ? listStatus(parsed, needed) : mode === "numbers"
      ? `Numbers 1 to ${max}. A card needs ${needed} squares.`
      : "75-ball cards use B 1–15 through O 61–75.";

  if (!ready) {
    return (
      <div
        className="min-h-[620px] animate-pulse rounded-3xl border border-border bg-surface p-5"
        aria-hidden
      />
    );
  }

  if (player) {
    return (
      <div className="bingo-tool min-w-0">
        <PlayerView payload={player} onMakeOwn={leavePlayer} />
        <p className="mt-3 text-sm text-muted">
          For fun at home, in class and at parties. Not for real-money games.
        </p>
      </div>
    );
  }

  const gridSize = mode === "bingo75" ? 5 : size;

  return (
    <div className="bingo-tool min-w-0">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5 print:hidden">
          {/* Your list */}
          <section aria-labelledby="bg-list" className="min-w-0">
            <h2 id="bg-list" className="text-lg font-bold text-foreground">
              Your list
            </h2>

            <div
              ref={modeControlRef}
              tabIndex={-1}
              role="radiogroup"
              aria-label="Bingo type"
              className="mt-3 flex flex-wrap gap-2 outline-none"
            >
              {(
                [
                  ["words", "Words"],
                  ["bingo75", "75-ball (1–75)"],
                  ["numbers", "Numbers"],
                ] as const
              ).map(([value, label]) => (
                <RadioChip
                  key={value}
                  name="bg-mode"
                  checked={mode === value}
                  onChange={() => onModeChange(value)}
                >
                  {label}
                </RadioChip>
              ))}
            </div>

            {mode === "words" ? (
              <>
                <p className="mt-3 text-xs font-semibold text-muted">Start from a theme</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_META.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => void loadPreset(p.id)}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <label htmlFor="bg-items" className="mt-3 block text-xs text-muted">
                  Items, one per line
                </label>
                <textarea
                  id="bg-items"
                  rows={10}
                  spellCheck
                  autoCapitalize="sentences"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setPresetId(undefined);
                  }}
                  className="mt-1 w-full min-w-0 resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <p className="mt-1 text-xs text-muted">
                  Every theme is just a starting list. Edit, add or delete any line.
                </p>
                {presetHint ? (
                  <p className="mt-1 text-xs text-muted">{presetHint}</p>
                ) : null}
                <p id={listStatusId} className="mt-2 text-xs text-muted">
                  {listLive}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (await copyText(text)) {
                        announce("List copied.");
                        track("bingo_share", {
                          toolId: TOOL_ID,
                          kind: "list",
                          method: "copy",
                        });
                      }
                    }}
                    className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Copy list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!text.trim() || window.confirm("Clear your list?")) {
                        setText("");
                        setPresetId(undefined);
                        setPresetHint("");
                        announce("List cleared.");
                      }
                    }}
                    className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Clear list
                  </button>
                </div>
              </>
            ) : null}

            {mode === "bingo75" ? (
              <p className="mt-3 text-sm text-muted">
                Cards use B 1–15, I 16–30, N 31–45, G 46–60 and O 61–75, five numbers per
                column. Grid locked to 5×5.
              </p>
            ) : null}

            {mode === "numbers" ? (
              <div className="mt-3 min-w-0">
                <label htmlFor="bg-max" className="text-xs text-muted">
                  Highest number
                </label>
                <input
                  id="bg-max"
                  type="number"
                  inputMode="numeric"
                  min={NUMBERS_MIN_MAX}
                  max={NUMBERS_MAX_MAX}
                  value={max}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    setMax(
                      Math.min(NUMBERS_MAX_MAX, Math.max(NUMBERS_MIN_MAX, Math.round(n))),
                    );
                  }}
                  className="mt-1 w-24 min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <p className="mt-1 text-xs text-muted">
                  Cards use numbers from 1 to {max}. Good for young players (try 1–20 on a
                  3×3 card).
                </p>
              </div>
            ) : null}
          </section>

          {/* Settings */}
          <section aria-labelledby="bg-settings" className="min-w-0">
            <h2 id="bg-settings" className="text-lg font-bold text-foreground">
              Card settings
            </h2>

            <fieldset className="mt-3">
              <legend className="text-xs text-muted">Grid size</legend>
              <div role="radiogroup" aria-label="Grid size" className="mt-1 flex flex-wrap gap-2">
                {([3, 4, 5] as const).map((s) => (
                  <RadioChip
                    key={s}
                    name="bg-size"
                    checked={gridSize === s}
                    disabled={mode === "bingo75" && s !== 5}
                    onChange={() => onSizeChange(s)}
                  >
                    {s}×{s}
                  </RadioChip>
                ))}
              </div>
              {mode === "bingo75" ? (
                <p className="mt-1 text-xs text-muted">75-ball cards are always 5×5.</p>
              ) : null}
            </fieldset>

            <div className="mt-3">
              <Switch
                id="bg-free"
                label="FREE centre square"
                checked={freeEffective}
                disabled={!canHaveFree(gridSize)}
                onChange={setFree}
                helper={
                  !canHaveFree(gridSize)
                    ? "A 4×4 card has no centre square."
                    : undefined
                }
              />
            </div>

            <div className="mt-3">
              <Stepper
                id="bg-count"
                label="Number of cards"
                value={count}
                min={1}
                max={MAX_CARDS}
                onChange={setCount}
                onClampAnnounce={announce}
              />
            </div>

            <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="bg-title" className="text-xs text-muted">
                  Title
                </label>
                <input
                  id="bg-title"
                  type="text"
                  maxLength={MAX_TITLE_LENGTH}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="bg-subtitle" className="text-xs text-muted">
                  Subtitle (optional)
                </label>
                <input
                  id="bg-subtitle"
                  type="text"
                  maxLength={MAX_SUBTITLE_LENGTH}
                  placeholder="e.g. Room 12 · Friday 18 Dec"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
            </div>

            <fieldset className="mt-3">
              <legend className="text-xs text-muted">Paper</legend>
              <div role="radiogroup" aria-label="Paper" className="mt-1 flex flex-wrap gap-2">
                <RadioChip name="bg-paper" checked={paper === "a4"} onChange={() => setPaper("a4")}>
                  A4
                </RadioChip>
                <RadioChip
                  name="bg-paper"
                  checked={paper === "letter"}
                  onChange={() => setPaper("letter")}
                >
                  Letter
                </RadioChip>
              </div>
            </fieldset>

            <fieldset className="mt-3">
              <legend className="text-xs text-muted">Cards per page</legend>
              <div
                role="radiogroup"
                aria-label="Cards per page"
                className="mt-1 flex flex-wrap gap-2"
              >
                <RadioChip name="bg-pp" checked={perPage === 2} onChange={() => setPerPage(2)}>
                  2 per page (large)
                </RadioChip>
                <RadioChip name="bg-pp" checked={perPage === 4} onChange={() => setPerPage(4)}>
                  4 per page
                </RadioChip>
              </div>
            </fieldset>

            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={callSheet}
                onChange={(e) => setCallSheet(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Include a call sheet when printing
            </label>
          </section>

          <div>
            <button
              type="button"
              disabled={makeDisabled}
              aria-describedby={makeDisabled ? makeDescId : undefined}
              onClick={onMakeCards}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 sm:w-auto"
            >
              Make cards
            </button>
            {makeDisabled && notEnoughHint ? (
              <p id={makeDescId} className="mt-2 text-xs text-muted">
                {notEnoughHint}
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
              {error}
            </p>
          ) : null}

          {outdated ? (
            <div className="rounded-2xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
              Your list or settings changed. Press Make cards to update the set.
            </div>
          ) : null}

          {sameSquares && cards.length > 0 && !outdated ? (
            <p className="text-sm text-muted">
              Every card has the same squares in a different order, so several players may
              finish a full card together. Add a few more items for more variety.
            </p>
          ) : null}

          {/* Your cards */}
          {cards.length > 0 && seed ? (
            <section aria-labelledby="bg-cards" className="min-w-0">
              <h2
                id="bg-cards"
                ref={cardsHeadingRef}
                tabIndex={-1}
                className="text-lg font-bold text-foreground outline-none"
              >
                Your cards
              </h2>
              <p className="mt-1 text-sm text-muted">
                {cards.length} cards · Set code{" "}
                <span
                  className="font-mono"
                  aria-label={`Set code ${[...seed].join(" ")}`}
                >
                  {seed}
                </span>
              </p>

              {!showAll && previewCard ? (
                <div className="mt-3 min-w-0">
                  <div className="mx-auto w-full max-w-[min(100%,28rem)] min-w-0">
                    <CardGrid
                      card={previewCard}
                      size={gridSize}
                      mode={mode}
                      title={title}
                      subtitle={subtitle}
                      seed={seed}
                    />
                  </div>
                  <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={previewIdx <= 0}
                      onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span role="status" aria-live="polite" className="text-sm text-muted">
                      Card {previewIdx + 1} of {cards.length}
                    </span>
                    <button
                      type="button"
                      disabled={previewIdx >= cards.length - 1}
                      onClick={() =>
                        setPreviewIdx((i) => Math.min(cards.length - 1, i + 1))
                      }
                      className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}

              {showAll ? (
                <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                  {cards.map((c) => (
                    <CardGrid
                      key={c.number}
                      card={c}
                      size={gridSize}
                      mode={mode}
                      title={title}
                      subtitle={subtitle}
                      seed={seed}
                      compact
                    />
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {showAll ? "Show one" : "Show all"}
                </button>
                <button
                  type="button"
                  onClick={onPrint}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Print cards
                </button>
                <button
                  type="button"
                  onClick={() => void copySetLink()}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Copy set link
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerLinksOpen((v) => !v)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Player links
                </button>
                <button
                  type="button"
                  onClick={onNewCards}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  New cards
                </button>
              </div>

              {playerLinksOpen ? (
                <BingoPlayerLinks
                  cards={cards}
                  playerCardN={playerCardN}
                  setPlayerCardN={setPlayerCardN}
                  onCopyLink={() => void copyPlayerLink(playerCardN)}
                  onShareLink={() => void copyPlayerLink(playerCardN, true)}
                  onCopyAll={() => void copyAllPlayerLinks()}
                  canShare={typeof navigator !== "undefined" && "share" in navigator}
                />
              ) : null}

              <p className="mt-2 text-xs text-muted">
                To save a PDF, use your browser&apos;s print dialog and choose Save as PDF.
              </p>
            </section>
          ) : null}

          <div>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
            >
              More
            </button>
            {moreOpen ? (
              <button
                type="button"
                onClick={onReset}
                className="ml-2 inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        {cards.length > 0 ? (
          <BingoHostPanels
            mode={mode}
            title={title}
            subtitle={subtitle}
            seed={seed}
            cards={cards}
            gridSize={gridSize}
            caller={caller}
            currentCall={currentCall}
            finished={finished}
            callerAnnounce={callerAnnounce}
            callNextRef={callNextRef}
            checkResultRef={checkResultRef}
            checkSelectId={checkSelectId}
            checkN={checkN}
            setCheckN={setCheckN}
            pattern={pattern}
            setPattern={setPattern}
            checkMsg={checkMsg}
            checkHighlight={checkHighlight}
            checkCardData={checkCardData}
            checkMarks={checkMarks}
            onCallNext={onCallNext}
            onUndoCall={onUndoCall}
            onCopyCalled={() => void onCopyCalled()}
            onNewGame={onNewGame}
            onCheck={onCheck}
          />
        ) : (
          <div className="min-w-0 rounded-3xl border border-border bg-surface p-3 sm:p-5 print:hidden lg:sticky lg:top-4 lg:self-start">
            <h2 className="text-lg font-bold text-foreground">Caller</h2>
            <p className="mt-2 text-sm text-muted">
              Make your cards first. The caller and card checker open here.
            </p>
          </div>
        )}
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {status}
        {mode === "words" ? ` ${listLive}` : ""}
      </div>
      {status ? (
        <p className="mt-2 text-sm text-muted print:hidden" aria-hidden>
          {status}
        </p>
      ) : null}

      <p className="mt-3 text-sm text-muted print:hidden">
        For fun at home, in class and at parties. Not for real-money games.
      </p>

      {printing && seed && cards.length ? (
        <PrintSheets
          cards={cards}
          size={gridSize}
          mode={mode}
          title={title}
          subtitle={subtitle}
          seed={seed}
          paper={paper}
          perPage={perPage}
          callSheet={callSheet}
          callItems={
            mode === "words"
              ? parsed.items
              : mode === "numbers"
                ? Array.from({ length: max }, (_, i) => String(i + 1))
                : Array.from({ length: 75 }, (_, i) => String(i + 1))
          }
          onDone={() => setPrinting(false)}
        />
      ) : null}
    </div>
  );
}
