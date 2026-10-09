"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/secret-santa/ConfirmDialog";
import { decodeResultHash, readResultHash, resultUrl } from "@/lib/raffle/codec";
import { drawNext, drawRaffle, MAX_ALTERNATES, MAX_WINNERS, type RafflePick } from "@/lib/raffle/draw";
import {
  buildRange,
  parseEntries,
  type DuplicateMode,
  type Entrant,
} from "@/lib/raffle/entries";
import {
  countHint,
  describeDrawFailure,
  duplicateNotice,
  invalidExcludesMessage,
  issueMessage,
  listSummary,
  overLimitMessage,
  rangeErrorMessage,
  rangeSummary,
} from "@/lib/raffle/messages";
import {
  buildRecord,
  formatRecordText,
  formatTimestamp,
  listFingerprint,
  parsePrizes,
  prizeLabel,
  recordCsv,
  recordFileName,
  type DrawRecord,
} from "@/lib/raffle/record";
import { secureRandomInt, randomCode } from "@/lib/raffle/random";
import {
  emptyState,
  HANDOFF_KEY,
  loadState,
  saveState,
  type RaffleState,
} from "@/lib/raffle/storage";
import { ToolConfetti } from "@/components/tools/Confetti";
import { ThemeChips } from "@/components/tools/ThemeChips";
import { track } from "@/lib/track";
import { useSound } from "@/lib/tools/sound";
import {
  loadToolTheme,
  resolveToolTheme,
  saveToolTheme,
  type ToolThemeId,
} from "@/lib/tools/theme";
import "@/app/styles/tools-themes.css";

const TOOL_ID = "raffle-generator";

const SAMPLE_LIST = `Ava Lee x2
Ben
Chloe x5
Dev
Eli x3
Farah
Gus
Hana x2`;

type ConfirmKind = null | "clear-entries" | "try-sample" | "edit-entries" | "new-draw";
type SharedView = null | { kind: "valid"; record: DrawRecord } | { kind: "invalid" };

function takeIncoming(): string | null {
  const fromUrl = readResultHash(window.location.hash);
  if (fromUrl) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
    try {
      sessionStorage.setItem(HANDOFF_KEY, fromUrl);
    } catch {
      /* ignore */
    }
    return fromUrl;
  }
  try {
    return sessionStorage.getItem(HANDOFF_KEY);
  } catch {
    return null;
  }
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function countLines(text: string): number {
  return text.split(/\r\n|\n|\r/).filter((l) => l.trim()).length;
}

function padExample(prefix: string, endStr: string, pad: boolean): string {
  const end = Number(endStr);
  const n = Number.isFinite(end) && end >= 0 ? 1 : 1;
  const width = pad && Number.isFinite(end) && end >= 0 ? String(end).length : 0;
  const num = width ? String(n).padStart(width, "0") : String(n);
  return `Tickets look like ${prefix}${num}.`;
}

function drawButtonLabel(
  reveal: "all" | "one",
  winners: number,
  alternates: number,
  picks: readonly RafflePick[],
  prizes: readonly string[],
): string {
  if (reveal === "all") {
    if (alternates === 0) {
      return winners === 1 ? "Draw 1 winner" : `Draw ${winners} winners`;
    }
    const wPart = winners === 1 ? "1 winner" : `${winners} winners`;
    const aPart = alternates === 1 ? "1 alternate" : `${alternates} alternates`;
    return `Draw ${wPart} + ${aPart}`;
  }
  const winnersDone = picks.filter((p) => p.kind === "winner").length;
  const altsDone = picks.filter((p) => p.kind === "alternate").length;
  if (winnersDone < winners) {
    return `Draw ${prizeLabel(winnersDone + 1, prizes)}`;
  }
  if (altsDone < alternates) {
    return `Draw alternate ${altsDone + 1}`;
  }
  return "";
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
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={dec}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-lg font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const raw = Number(e.target.value);
            if (!Number.isFinite(raw)) return;
            onChange(Math.min(max, Math.max(min, Math.round(raw))));
          }}
          className="w-16 min-h-11 rounded-xl border border-border bg-background px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={inc}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-lg font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function RaffleTool() {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"list" | "range">("list");
  const [listText, setListText] = useState("");
  const [multipleTickets, setMultipleTickets] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMode>("combine");
  const [range, setRange] = useState(emptyState().range);
  const [title, setTitle] = useState("");
  const [winners, setWinners] = useState(1);
  const [alternates, setAlternates] = useState(0);
  const [prizesText, setPrizesText] = useState("");
  const [allowRepeatWinners, setAllowRepeatWinners] = useState(false);
  const [reveal, setReveal] = useState<"all" | "one">("all");
  const [picks, setPicks] = useState<RafflePick[]>([]);
  const [record, setRecord] = useState<DrawRecord | null>(null);
  const [frozenEntrants, setFrozenEntrants] = useState<Entrant[] | null>(null);
  const [drawMeta, setDrawMeta] = useState<{ code: string; createdAt: number; tzOffsetMin: number } | null>(
    null,
  );
  const [locked, setLocked] = useState(false);
  const [listMismatch, setListMismatch] = useState(false);
  const [status, setStatus] = useState("");
  const [drawError, setDrawError] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [shuffleLabel, setShuffleLabel] = useState("");
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [shared, setShared] = useState<SharedView>(null);
  const [fpOpen, setFpOpen] = useState(false);
  const [fingerprint, setFingerprint] = useState("");
  const [fpComputing, setFpComputing] = useState(false);
  const [fpUnavailable, setFpUnavailable] = useState(false);
  const [prizesOpen, setPrizesOpen] = useState(false);
  const [revealAnim, setRevealAnim] = useState<number[]>([]);
  const [themeChoice, setThemeChoice] = useState<ToolThemeId>("auto");
  const [confettiFire, setConfettiFire] = useState(0);
  const sound = useSound();
  const resolvedTheme = resolveToolTheme(themeChoice, TOOL_ID);

  const issuesId = useId();
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const drawButtonRef = useRef<HTMLButtonElement>(null);
  const extraAltButtonRef = useRef<HTMLButtonElement>(null);
  const listInputRef = useRef<HTMLTextAreaElement>(null);
  const rangeStartRef = useRef<HTMLInputElement>(null);
  const statusTimer = useRef(0);
  const saveTimer = useRef(0);
  const shareTracked = useRef(false);
  const drawTracked = useRef(false);
  const shuffleTimer = useRef(0);

  const announce = useCallback((msg: string) => {
    setStatus(msg);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 4000);
  }, []);

  const parsed = useMemo(
    () => parseEntries(listText, { multipleTickets, duplicates }),
    [listText, multipleTickets, duplicates],
  );
  const debouncedSummary = useDebounced(parsed, 150);

  const rangeBuilt = useMemo(() => {
    const start = Number(range.start);
    const end = Number(range.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return { ok: false as const, error: "not_whole" as const };
    }
    return buildRange({
      start,
      end,
      prefix: range.prefix,
      pad: range.pad,
      excludeText: range.excludeText,
    });
  }, [range]);

  const entrants = useMemo((): Entrant[] => {
    if (mode === "list") return parsed.entrants;
    if (rangeBuilt.ok) return rangeBuilt.entrants;
    return [];
  }, [mode, parsed, rangeBuilt]);

  const activeEntrants = frozenEntrants ?? entrants;
  const holders = useMemo(
    () => activeEntrants.map((e) => ({ tickets: e.tickets })),
    [activeEntrants],
  );
  const prizes = useMemo(() => parsePrizes(prizesText), [prizesText]);
  const displayEntrants = activeEntrants;

  const persist = useCallback(
    (patch: Partial<RaffleState>) => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const state: RaffleState = {
          v: 1,
          mode: patch.mode ?? mode,
          listText: patch.listText ?? listText,
          multipleTickets: patch.multipleTickets ?? multipleTickets,
          duplicates: patch.duplicates ?? duplicates,
          range: patch.range ?? range,
          title: patch.title ?? title,
          winners: patch.winners ?? winners,
          alternates: patch.alternates ?? alternates,
          prizesText: patch.prizesText ?? prizesText,
          allowRepeatWinners: patch.allowRepeatWinners ?? allowRepeatWinners,
          reveal: patch.reveal ?? reveal,
          draw:
            patch.draw !== undefined
              ? patch.draw
              : record && picks.length
                ? { picks, record }
                : null,
        };
        try {
          saveState(state);
        } catch (e) {
          if (e instanceof DOMException && e.name === "QuotaExceededError") {
            announce(
              "Couldn't save this list in your browser. It still works until you close the page.",
            );
          }
        }
      }, 300);
    },
    [
      mode,
      listText,
      multipleTickets,
      duplicates,
      range,
      title,
      winners,
      alternates,
      prizesText,
      allowRepeatWinners,
      reveal,
      record,
      picks,
      announce,
    ],
  );

  const handleIncoming = useCallback(() => {
    const hash = takeIncoming();
    if (!hash) return;
    const decoded = decodeResultHash(hash);
    if (!decoded) {
      setShared({ kind: "invalid" });
      if (!shareTracked.current) {
        shareTracked.current = true;
        track("share_open", { toolId: TOOL_ID, via: "hash", valid: 0 });
      }
      return;
    }
    setShared({ kind: "valid", record: decoded });
    if (!shareTracked.current) {
      shareTracked.current = true;
      track("share_open", { toolId: TOOL_ID, via: "hash", valid: 1 });
    }
  }, []);

  const closeShared = () => {
    try {
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      /* ignore */
    }
    setShared(null);
    shareTracked.current = false;
  };

  useEffect(() => {
    const stored = loadState();
    setMode(stored.mode);
    setListText(stored.listText);
    setMultipleTickets(stored.multipleTickets);
    setDuplicates(stored.duplicates);
    setRange(stored.range);
    setTitle(stored.title);
    setWinners(stored.winners);
    setAlternates(stored.alternates);
    setPrizesText(stored.prizesText);
    setAllowRepeatWinners(stored.allowRepeatWinners);
    setReveal(stored.reveal);
    setPrizesOpen(Boolean(stored.prizesText.trim()));
    if (stored.draw) {
      setPicks(stored.draw.picks);
      setRecord(stored.draw.record);
      setDrawMeta({
        code: stored.draw.record.code,
        createdAt: stored.draw.record.createdAt,
        tzOffsetMin: stored.draw.record.tzOffsetMin,
      });
      setLocked(true);
    }
    setFpUnavailable(typeof crypto === "undefined" || !crypto.subtle);
    handleIncoming();
    setThemeChoice(loadToolTheme(TOOL_ID));
    setReady(true);

    const onHash = () => handleIncoming();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!ready) return;
    persist({});
  }, [
    ready,
    mode,
    listText,
    multipleTickets,
    duplicates,
    range,
    title,
    winners,
    alternates,
    prizesText,
    allowRepeatWinners,
    reveal,
    picks,
    record,
    persist,
  ]);

  useEffect(() => {
    if (fpUnavailable || entrants.length === 0) {
      setFingerprint("");
      return;
    }
    setFpComputing(true);
    const t = window.setTimeout(() => {
      void listFingerprint(entrants)
        .then((fp) => {
          setFingerprint(fp);
          setFpComputing(false);
        })
        .catch(() => {
          setFpUnavailable(true);
          setFpComputing(false);
        });
    }, 300);
    return () => window.clearTimeout(t);
  }, [entrants, fpUnavailable]);

  useEffect(() => {
    if (!ready || !record || listMismatch) return;
    if (fpUnavailable) return;
    if (entrants.length === 0) return;
    void listFingerprint(entrants).then((fp) => {
      if (record.fingerprint !== "unavailable" && fp !== record.fingerprint) {
        setListMismatch(true);
      } else if (locked && !frozenEntrants) {
        setFrozenEntrants(entrants);
      }
    });
  }, [ready, record, entrants, locked, frozenEntrants, listMismatch, fpUnavailable]);

  const dupNotice = duplicateNotice(parsed, duplicates);
  const countHintText = countHint(parsed, multipleTickets);
  const issueMsgs = parsed.issues.map(issueMessage);
  const rangeErr =
    mode === "range" && !rangeBuilt.ok ? rangeErrorMessage(rangeBuilt.error) : null;
  const rangeInvalidExcludes =
    mode === "range" && rangeBuilt.ok
      ? invalidExcludesMessage(rangeBuilt.invalidExcludes)
      : null;
  const rangeLive =
    mode === "range" && rangeBuilt.ok
      ? rangeSummary(
          rangeBuilt.entrants.length,
          rangeBuilt.entrants[0]!.label,
          rangeBuilt.entrants[rangeBuilt.entrants.length - 1]!.label,
          rangeBuilt.excluded,
        )
      : null;

  const drawPreCheck = useMemo((): Extract<ReturnType<typeof drawRaffle>, { ok: false }> | null => {
    if (mode === "list") {
      if (parsed.issues.length > 0 || parsed.entrants.length === 0) return null;
      if (parsed.overLimit) return { ok: false, reason: "too_many_tickets", requested: parsed.totalTickets };
    } else {
      if (!rangeBuilt.ok || rangeBuilt.entrants.length === 0) return null;
    }
    const res = drawRaffle(holders, { winners, alternates, allowRepeatWinners });
    return res.ok ? null : res;
  }, [mode, parsed, rangeBuilt, holders, winners, alternates, allowRepeatWinners]);

  const drawDisabledReason = useMemo((): string => {
    if (listMismatch) return "The saved list changed since this draw. Start a new draw to continue.";
    if (locked && reveal === "one" && picks.length >= winners + alternates) return "";
    if (mode === "list") {
      if (parsed.issues.length > 0) return "Fix the lines listed above to draw.";
      if (parsed.overLimit) return overLimitMessage(parsed.totalTickets);
      if (parsed.entrants.length === 0) return "Add at least one name or ticket to draw.";
    } else {
      if (rangeErr) return rangeErr;
      if (!rangeBuilt.ok || rangeBuilt.entrants.length === 0)
        return "Add at least one name or ticket to draw.";
    }
    if (locked && reveal === "one" && picks.length > 0 && picks.length < winners + alternates) {
      const winnersDone = picks.filter((p) => p.kind === "winner").length;
      const kind: RafflePick["kind"] = winnersDone < winners ? "winner" : "alternate";
      const res = drawNext(holders, picks, kind, { allowRepeatWinners });
      if (!res.ok) return describeDrawFailure(res, allowRepeatWinners);
      return "";
    }
    if (drawPreCheck) return describeDrawFailure(drawPreCheck, allowRepeatWinners);
    return "";
  }, [
    listMismatch,
    locked,
    reveal,
    picks,
    winners,
    alternates,
    mode,
    parsed,
    rangeErr,
    rangeBuilt,
    drawPreCheck,
    allowRepeatWinners,
    holders,
  ]);

  const drawComplete =
    locked && picks.length >= winners + alternates && !drawing && !shuffling;

  const rebuildRecord = useCallback(
    (nextPicks: RafflePick[], meta: { code: string; createdAt: number; tzOffsetMin: number }) => {
      const ents = frozenEntrants ?? entrants;
      const fp = fpUnavailable ? "unavailable" : fingerprint;
      return buildRecord({
        code: meta.code,
        createdAt: meta.createdAt,
        tzOffsetMin: meta.tzOffsetMin,
        title,
        mode,
        entrants: ents,
        picks: nextPicks,
        prizes,
        allowRepeatWinners,
        multipleTickets,
        duplicates,
        excluded: mode === "range" && rangeBuilt.ok ? rangeBuilt.excluded : 0,
        fingerprint: fp || "unavailable",
        plannedWinners: winners,
        plannedAlternates: alternates,
      });
    },
    [
      frozenEntrants,
      entrants,
      fpUnavailable,
      fingerprint,
      title,
      mode,
      prizes,
      allowRepeatWinners,
      multipleTickets,
      duplicates,
      rangeBuilt,
      winners,
      alternates,
    ],
  );

  const trackDraw = useCallback(
    (result: string) => {
      if (drawTracked.current) return;
      drawTracked.current = true;
      track("raffle_draw", {
        toolId: TOOL_ID,
        result,
        mode,
        reveal,
        entrants: displayEntrants.length,
        tickets: displayEntrants.reduce((s, e) => s + e.tickets, 0),
        winners,
        alternates,
        multiple_tickets: mode === "list" && multipleTickets ? 1 : 0,
        dedupe: mode === "list" && duplicates === "dedupe" ? 1 : 0,
        allow_repeat: allowRepeatWinners ? 1 : 0,
        has_prizes: prizes.some((p) => p) ? 1 : 0,
      });
    },
    [
      mode,
      reveal,
      displayEntrants,
      winners,
      alternates,
      multipleTickets,
      duplicates,
      allowRepeatWinners,
      prizes,
    ],
  );

  const remainingLabels = useCallback(
    (currentPicks: readonly RafflePick[]) => {
      const ents = frozenEntrants ?? entrants;
      const pickedTickets = new Set(currentPicks.map((p) => p.ticket));
      const labels: string[] = [];
      let ticket = 1;
      for (const e of ents) {
        for (let t = 0; t < e.tickets; t++) {
          if (!pickedTickets.has(ticket)) labels.push(e.label);
          ticket++;
        }
      }
      return labels.length ? labels : ents.map((e) => e.label);
    },
    [frozenEntrants, entrants],
  );

  const playShuffle = useCallback(
    (finalLabel: string, onDone: () => void) => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        onDone();
        return;
      }
      setShuffling(true);
      const labels = remainingLabels(picks);
      const steps = 17;
      let step = 0;
      const tick = () => {
        if (step >= steps) {
          setShuffleLabel(finalLabel);
          setShuffling(false);
          onDone();
          return;
        }
        const idx = secureRandomInt(labels.length);
        setShuffleLabel(labels[idx]!);
        step++;
        const delay = step < steps - 3 ? 70 : 70 + (step - (steps - 3)) * 40;
        shuffleTimer.current = window.setTimeout(tick, delay);
      };
      tick();
    },
    [picks, remainingLabels],
  );

  const applyPicks = useCallback(
    (nextPicks: RafflePick[], meta: { code: string; createdAt: number; tzOffsetMin: number }) => {
      const nextRecord = rebuildRecord(nextPicks, meta);
      setPicks(nextPicks);
      setRecord(nextRecord);
      setDrawMeta(meta);
      persist({ draw: { picks: nextPicks, record: nextRecord } });
    },
    [rebuildRecord, persist],
  );

  const finishPick = useCallback(
    (nextPicks: RafflePick[], meta: { code: string; createdAt: number; tzOffsetMin: number }) => {
      applyPicks(nextPicks, meta);
      const last = nextPicks[nextPicks.length - 1]!;
      const ent = (frozenEntrants ?? entrants)[last.entrant]!;
      if (last.kind === "winner") {
        const pl = prizeLabel(last.position, prizes);
        const ticketPart = mode === "list" ? `, ticket #${last.ticket}` : "";
        announce(`${pl}: ${ent.label}${ticketPart}.`);
      } else {
        const ticketPart = mode === "list" ? ` · ticket #${last.ticket}` : "";
        announce(`Alternate ${last.position}: ${ent.label}${ticketPart}.`);
      }
      if (reveal === "all" && nextPicks.length === winners + alternates) {
        const w = nextPicks.filter((p) => p.kind === "winner").length;
        const a = nextPicks.filter((p) => p.kind === "alternate").length;
        const parts: string[] = [];
        if (w) parts.push(`${w} winner${w === 1 ? "" : "s"}`);
        if (a) parts.push(`${a} alternate${a === 1 ? "" : "s"}`);
        announce(`${parts.join(" and ")} drawn. Draw code ${meta.code}.`);
      }
      const planned = winners + alternates;
      const done = nextPicks.length >= planned;
      // All at once → results heading. One at a time → stay on Draw until complete.
      requestAnimationFrame(() => {
        if (reveal === "all" || done) resultsHeadingRef.current?.focus();
        else drawButtonRef.current?.focus();
      });
    },
    [applyPicks, frozenEntrants, entrants, prizes, mode, announce, reveal, winners, alternates],
  );

  const runDraw = () => {
    if (drawDisabledReason || drawing || shuffling) return;
    sound.unlock();
    if (reveal === "one" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sound.drumroll(1400);
    }
    setDrawError("");

    const isFirst = picks.length === 0;
    let meta = drawMeta;
    if (isFirst) {
      meta = {
        code: randomCode(),
        createdAt: Date.now(),
        tzOffsetMin: -new Date().getTimezoneOffset(),
      };
      setFrozenEntrants([...entrants]);
      setLocked(true);
    }
    if (!meta) return;

    if (reveal === "all") {
      setDrawing(true);
      window.setTimeout(() => {
        const res = drawRaffle(holders, { winners, alternates, allowRepeatWinners });
        if (!res.ok) {
          setDrawError(describeDrawFailure(res, allowRepeatWinners));
          setDrawing(false);
          trackDraw(res.reason);
          return;
        }
        applyPicks(res.picks, meta!);
        setRevealAnim(res.picks.map((_, i) => i));
        sound.fanfare();
        setConfettiFire((n) => n + 1);
        trackDraw("success");
        setDrawing(false);
        const w = res.picks.filter((p) => p.kind === "winner").length;
        const a = res.picks.filter((p) => p.kind === "alternate").length;
        announce(
          `${w} winner${w === 1 ? "" : "s"} and ${a} alternate${a === 1 ? "" : "s"} drawn. Draw code ${meta!.code}.`,
        );
        requestAnimationFrame(() => resultsHeadingRef.current?.focus());
      }, 0);
      return;
    }

    const winnersDone = picks.filter((p) => p.kind === "winner").length;
    const kind: RafflePick["kind"] = winnersDone < winners ? "winner" : "alternate";
    const pl = kind === "winner" ? prizeLabel(winnersDone + 1, prizes) : `alternate ${picks.filter((p) => p.kind === "alternate").length + 1}`;
    setDrawing(true);
    announce(`Drawing ${pl}…`);

    window.setTimeout(() => {
      const res = drawNext(holders, picks, kind, { allowRepeatWinners });
      if (!res.ok) {
        setDrawError(describeDrawFailure(res, allowRepeatWinners));
        setDrawing(false);
        if (isFirst) trackDraw(res.reason);
        return;
      }
      const last = res.picks[res.picks.length - 1]!;
      const ent = entrants[last.entrant]!;
      setDrawing(false);
      if (isFirst) trackDraw("success");
      playShuffle(ent.label, () => {
        finishPick(res.picks, meta!);
        sound.chime();
        setConfettiFire((n) => n + 1);
      });
    }, 0);
  };

  const runExtraAlternate = () => {
    if (listMismatch || drawing || shuffling) return;
    if (!drawMeta || !locked) return;
    setDrawError("");
    setDrawing(true);
    const res = drawNext(holders, picks, "alternate", { allowRepeatWinners });
    if (!res.ok) {
      setDrawError(describeDrawFailure(res, allowRepeatWinners));
      setDrawing(false);
      return;
    }
    const nextAlternates = alternates + 1;
    setAlternates(nextAlternates);
    const last = res.picks[res.picks.length - 1]!;
    const ent = (frozenEntrants ?? entrants)[last.entrant]!;
    setDrawing(false);
    playShuffle(ent.label, () => {
      const nextRecord = rebuildRecord(res.picks, drawMeta);
      const updated = { ...nextRecord, plannedAlternates: nextAlternates };
      setPicks(res.picks);
      setRecord(updated);
      persist({ draw: { picks: res.picks, record: updated }, alternates: nextAlternates });
      const ticketPart = mode === "list" ? ` · ticket #${last.ticket}` : "";
      announce(`Alternate ${last.position}: ${ent.label}${ticketPart}.`);
      track("raffle_extra_alternate", { toolId: TOOL_ID, alternates: nextAlternates });
      const canDrawMore =
        nextAlternates < MAX_ALTERNATES &&
        drawNext(holders, res.picks, "alternate", { allowRepeatWinners }).ok;
      requestAnimationFrame(() => {
        if (canDrawMore) extraAltButtonRef.current?.focus();
        else resultsHeadingRef.current?.focus();
      });
    });
  };

  const copyText = async (text: string, okMsg: string, method: string) => {
    try {
      await navigator.clipboard.writeText(text);
      announce(okMsg);
      track("raffle_export", { toolId: TOOL_ID, method });
    } catch {
      announce("Couldn't copy. Check your browser's clipboard permission.");
    }
  };

  const copyRecord = () => {
    if (!record) return;
    void copyText(formatRecordText(record), "Record copied.", "copy");
  };

  const downloadTxt = () => {
    if (!record) return;
    const blob = new Blob([formatRecordText(record)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = recordFileName(record, "txt");
    a.click();
    URL.revokeObjectURL(url);
    announce("Download started.");
    track("raffle_export", { toolId: TOOL_ID, method: "txt" });
  };

  const downloadCsv = () => {
    if (!record) return;
    const blob = new Blob(["\uFEFF" + recordCsv(record)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = recordFileName(record, "csv");
    a.click();
    URL.revokeObjectURL(url);
    announce("Download started.");
    track("raffle_export", { toolId: TOOL_ID, method: "csv" });
  };

  const printRecord = () => {
    track("raffle_export", { toolId: TOOL_ID, method: "print" });
    window.print();
  };

  const copyResultLink = () => {
    if (!record) return;
    try {
      const url = resultUrl(window.location.origin, record);
      void copyText(url, "Result link copied. Anyone with it can see the winners' names.", "link");
    } catch {
      announce("This result is too long for a link. Copy or download the record instead.");
    }
  };

  const clearDraw = () => {
    setPicks([]);
    setRecord(null);
    setDrawMeta(null);
    setFrozenEntrants(null);
    setLocked(false);
    setListMismatch(false);
    setRevealAnim([]);
    drawTracked.current = false;
    persist({ draw: null });
  };

  const applySample = () => {
    setListText(SAMPLE_LIST);
    setMultipleTickets(true);
    clearDraw();
    announce("Sample list loaded.");
  };

  const clearEntries = () => {
    if (mode === "list") setListText("");
    else setRange(emptyState().range);
    clearDraw();
    announce("Entries cleared.");
  };

  const inputsLocked = locked && !listMismatch;

  const extraAlternateOk = useMemo(() => {
    if (!drawComplete || listMismatch || alternates >= MAX_ALTERNATES) return false;
    return drawNext(holders, picks, "alternate", { allowRepeatWinners }).ok;
  }, [drawComplete, listMismatch, alternates, holders, picks, allowRepeatWinners]);

  if (!ready) {
    return (
      <div
        className="min-h-[620px] animate-pulse rounded-3xl border border-border bg-surface p-5"
        aria-hidden
      />
    );
  }

  const fpDisplay = fpUnavailable
    ? "unavailable on this connection"
    : fpComputing
      ? "…"
      : fingerprint || "…";

  const resultsHeading = record
    ? reveal === "one" && picks.length < winners + alternates
      ? `Drawing — draw ${record.code} (${picks.filter((p) => p.kind === "winner").length} of ${winners} winners)`
      : `Winners — draw ${record.code}`
    : "Results";

  const activeRecord = record;
  const showResultLink = activeRecord && activeRecord.fingerprint !== "unavailable" && !fpUnavailable;

  return (
    <div className="raffle-tool min-w-0" data-tool-theme={resolvedTheme}>
      {shared?.kind === "invalid" ? (
        <div className="mb-4 rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-base text-foreground">
            This result link looks incomplete or damaged. Ask the host to send it again.
          </p>
          <button
            type="button"
            onClick={closeShared}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            Close
          </button>
        </div>
      ) : null}

      {shared?.kind === "valid" ? (
        <SharedResultCard record={shared.record} onCopy={copyText} onClose={closeShared} />
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5 print:hidden">
          {/* Entries */}
          <section aria-labelledby="rf-entries" className="min-w-0">
            <h2 id="rf-entries" className="text-lg font-bold text-foreground">
              Entries
            </h2>

            <fieldset className="mt-3">
              <legend className="sr-only">Entry type</legend>
              <div
                role="radiogroup"
                aria-label="Entry type"
                className="flex flex-wrap gap-2"
              >
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold has-[:checked]:border-accent has-[:checked]:bg-surface-2">
                  <input
                    type="radio"
                    name="rf-mode"
                    checked={mode === "list"}
                    disabled={inputsLocked}
                    onChange={() => setMode("list")}
                    className="sr-only"
                  />
                  Names or tickets
                </label>
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold has-[:checked]:border-accent has-[:checked]:bg-surface-2">
                  <input
                    type="radio"
                    name="rf-mode"
                    checked={mode === "range"}
                    disabled={inputsLocked}
                    onChange={() => setMode("range")}
                    className="sr-only"
                  />
                  Number range
                </label>
              </div>
            </fieldset>

            {mode === "list" ? (
              <div className="mt-3 min-w-0">
                <label htmlFor="rf-list" className="text-sm font-semibold text-foreground">
                  Entries
                </label>
                <p className="mt-1 text-xs text-muted">
                  Names, emails or ticket numbers. Paste a spreadsheet column if that&apos;s easier.
                </p>
                <textarea
                  ref={listInputRef}
                  id="rf-list"
                  value={listText}
                  rows={10}
                  spellCheck={false}
                  autoComplete="off"
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  aria-invalid={issueMsgs.length > 0 || undefined}
                  aria-describedby={issueMsgs.length > 0 ? issuesId : undefined}
                  placeholder={
                    multipleTickets ? "Sam x3\nAva Lee\nBen x2" : "Sam\nAva Lee\nTicket 104"
                  }
                  onChange={(e) => setListText(e.target.value)}
                  onPaste={(e) => {
                    const el = e.currentTarget;
                    window.setTimeout(() => {
                      const p = parseEntries(el.value, { multipleTickets, duplicates });
                      const parts = [listSummary(p)];
                      const notice = duplicateNotice(p, duplicates);
                      if (notice) parts.push(notice);
                      announce(parts.join(" "));
                    }, 160);
                  }}
                  className="mt-2 w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent [overflow-wrap:anywhere]"
                />

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={inputsLocked}
                    onClick={() => {
                      if (listText.trim()) setConfirm("try-sample");
                      else applySample();
                    }}
                    className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                  >
                    Try a sample
                  </button>
                  <button
                    type="button"
                    disabled={inputsLocked && !listText.trim()}
                    onClick={() => {
                      if (countLines(listText) >= 20 || picks.length > 0) setConfirm("clear-entries");
                      else clearEntries();
                    }}
                    className="text-xs font-semibold text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
                  >
                    Clear
                  </button>
                  {inputsLocked ? (
                    <button
                      type="button"
                      onClick={() => setConfirm("edit-entries")}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Edit entries
                    </button>
                  ) : null}
                </div>

                <Switch
                  id="rf-multi"
                  label="Multiple tickets per person"
                  checked={multipleTickets}
                  disabled={inputsLocked}
                  onChange={setMultipleTickets}
                  helper="Add a count after a name, like Sam x3 or Sam *3, or paste two spreadsheet columns: name and number of tickets."
                />

                <fieldset className="mt-3">
                  <legend className="text-xs font-semibold text-foreground">Repeated names</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="rf-dup"
                        checked={duplicates === "combine"}
                        disabled={inputsLocked}
                        onChange={() => setDuplicates("combine")}
                      />
                      Count each line as a ticket
                    </label>
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="rf-dup"
                        checked={duplicates === "dedupe"}
                        disabled={inputsLocked}
                        onChange={() => setDuplicates("dedupe")}
                      />
                      One entry per name
                    </label>
                  </div>
                </fieldset>

                <p className="mt-2 text-sm text-muted">{listSummary(debouncedSummary)}</p>

                {dupNotice ? (
                  <p className="mt-2 rounded-xl border border-amber-400/50 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    {dupNotice}
                  </p>
                ) : null}
                {countHintText ? <p className="mt-2 text-xs text-muted">{countHintText}</p> : null}
                {parsed.overLimit ? (
                  <p className="mt-2 text-sm text-red-600">
                    {overLimitMessage(parsed.totalTickets)}
                  </p>
                ) : null}
                {issueMsgs.length > 0 ? (
                  <ul id={issuesId} className="mt-2 space-y-1 text-sm text-red-600">
                    {issueMsgs.slice(0, 5).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                    {issueMsgs.length > 5 ? (
                      <li>…and {issueMsgs.length - 5} more.</li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rf-start" className="text-xs text-muted">
                      First ticket
                    </label>
                    <input
                      ref={rangeStartRef}
                      id="rf-start"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={range.start}
                      readOnly={inputsLocked}
                      aria-readonly={inputsLocked}
                      onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
                      className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </div>
                  <div>
                    <label htmlFor="rf-end" className="text-xs text-muted">
                      Last ticket
                    </label>
                    <input
                      id="rf-end"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={range.end}
                      readOnly={inputsLocked}
                      aria-readonly={inputsLocked}
                      onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
                      className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="rf-prefix" className="text-xs text-muted">
                    Prefix (optional)
                  </label>
                  <input
                    id="rf-prefix"
                    type="text"
                    maxLength={10}
                    placeholder="e.g. A-"
                    value={range.prefix}
                    readOnly={inputsLocked}
                    aria-readonly={inputsLocked}
                    onChange={(e) => setRange((r) => ({ ...r, prefix: e.target.value }))}
                    className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <Switch
                  id="rf-pad"
                  label="Pad with zeros"
                  checked={range.pad}
                  disabled={inputsLocked}
                  onChange={(v) => setRange((r) => ({ ...r, pad: v }))}
                  helper={padExample(range.prefix, range.end, range.pad)}
                />
                <div>
                  <label htmlFor="rf-exclude" className="text-xs text-muted">
                    Leave out (optional)
                  </label>
                  <p className="text-xs text-muted">
                    Unsold or void tickets, like 37, 112-120. Separators: commas, semicolons, spaces,
                    new lines; ranges with - or –.
                  </p>
                  <textarea
                    id="rf-exclude"
                    rows={3}
                    value={range.excludeText}
                    readOnly={inputsLocked}
                    aria-readonly={inputsLocked}
                    onChange={(e) => setRange((r) => ({ ...r, excludeText: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                {inputsLocked ? (
                  <button
                    type="button"
                    onClick={() => setConfirm("edit-entries")}
                    className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Edit entries
                  </button>
                ) : null}
                {rangeLive ? <p className="text-sm text-muted">{rangeLive}</p> : null}
                {rangeErr ? (
                  <p className="text-sm text-red-600">{rangeErr}</p>
                ) : null}
                {rangeInvalidExcludes ? (
                  <p className="text-sm text-amber-700 dark:text-amber-200">
                    {rangeInvalidExcludes}
                  </p>
                ) : null}
              </div>
            )}

            <div className="mt-3 text-sm text-muted">
              <span>List fingerprint: {fpDisplay}</span>
              <button
                type="button"
                aria-expanded={fpOpen}
                onClick={() => setFpOpen((v) => !v)}
                className="ml-2 text-xs font-semibold text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
              >
                What&apos;s this?
              </button>
              {fpOpen ? (
                <p className="mt-2 text-xs leading-relaxed">
                  A short code made from your final list (names, ticket counts and order, after
                  repeated names are handled). Publish your list before the draw, and anyone can
                  paste it here with the same settings to get the same code. It shows the list
                  didn&apos;t change; it doesn&apos;t prove how winners were picked.
                </p>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-muted">
              Your entries and latest draw are saved in this browser, not on our servers. A result
              link carries the winners&apos; names, so anyone with the link can see them.{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-accent underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </section>

          {/* Draw settings */}
          <section aria-labelledby="rf-settings">
            <h2 id="rf-settings" className="text-lg font-bold text-foreground">
              Draw settings
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="rf-title" className="text-xs text-muted">
                  Raffle name (optional)
                </label>
                <input
                  id="rf-title"
                  type="text"
                  maxLength={60}
                  placeholder="e.g. Spring Fair raffle"
                  value={title}
                  readOnly={inputsLocked}
                  aria-readonly={inputsLocked}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Stepper
                  id="rf-winners"
                  label="Winners"
                  value={winners}
                  min={1}
                  max={MAX_WINNERS}
                  disabled={inputsLocked}
                  onChange={setWinners}
                />
                <div>
                  <Stepper
                    id="rf-alts"
                    label="Alternates"
                    value={alternates}
                    min={0}
                    max={MAX_ALTERNATES}
                    disabled={inputsLocked}
                    onChange={setAlternates}
                  />
                  <p className="mt-1 text-xs text-muted">
                    Backups, drawn after the winners, in order.
                  </p>
                </div>
              </div>

              <details
                className="rounded-2xl border border-border p-3"
                open={prizesOpen}
                onToggle={(e) => setPrizesOpen(e.currentTarget.open)}
              >
                <summary className="cursor-pointer text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent">
                  Prizes (optional)
                </summary>
                <div className="mt-3">
                  <p className="text-xs text-muted">
                    One prize per line, in draw order. Empty lines use 1st prize, 2nd prize…
                  </p>
                  <textarea
                    value={prizesText}
                    rows={4}
                    readOnly={inputsLocked}
                    aria-readonly={inputsLocked}
                    onChange={(e) => setPrizesText(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  {prizes.filter(Boolean).length > winners ? (
                    <p className="mt-1 text-xs text-muted">
                      You&apos;ve listed {prizes.filter(Boolean).length} prizes but you&apos;re
                      drawing {winners} winners.
                    </p>
                  ) : null}
                </div>
              </details>

              {mode === "list" ? (
                <Switch
                  id="rf-repeat"
                  label="Each person can win only once"
                  checked={!allowRepeatWinners}
                  disabled={inputsLocked}
                  onChange={(on) => setAllowRepeatWinners(!on)}
                  helper={
                    !allowRepeatWinners
                      ? "When someone wins, all their tickets leave the draw."
                      : "Only the winning ticket leaves, so people with several tickets can win again."
                  }
                />
              ) : null}

              <fieldset>
                <legend className="text-xs font-semibold text-foreground">Reveal</legend>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="rf-reveal"
                      checked={reveal === "all"}
                      disabled={inputsLocked}
                      onChange={() => setReveal("all")}
                    />
                    All at once
                  </label>
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="rf-reveal"
                      checked={reveal === "one"}
                      disabled={inputsLocked}
                      onChange={() => setReveal("one")}
                    />
                    One at a time
                  </label>
                </div>
              </fieldset>
            </div>
          </section>

          {shuffling ? (
            <div
              aria-hidden="true"
              className="flex min-h-16 items-center justify-center rounded-2xl border border-border bg-surface-2 px-4 text-xl font-bold text-foreground"
            >
              {shuffleLabel}
            </div>
          ) : null}

          {drawError ? (
            <p
              className="rounded-xl border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {drawError}
            </p>
          ) : null}

          <div className="print:hidden">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Theme</p>
            <ThemeChips
              value={themeChoice}
              onChange={(next) => {
                setThemeChoice(next);
                saveToolTheme(TOOL_ID, next);
              }}
            />
          </div>

          {drawComplete ? (
            <p className="text-sm font-semibold text-muted">Draw complete.</p>
          ) : (
            <div className="sticky bottom-0 z-30 -mx-1 border-t border-border bg-surface/95 px-1 py-2 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
              <button
                ref={drawButtonRef}
                type="button"
                disabled={
                  Boolean(drawDisabledReason) ||
                  drawing ||
                  shuffling ||
                  (locked && reveal === "all")
                }
                aria-describedby={drawDisabledReason ? "rf-draw-hint" : undefined}
                onClick={runDraw}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              >
                {drawing ? "Drawing…" : drawButtonLabel(reveal, winners, alternates, picks, prizes)}
              </button>
            </div>
          )}
          {drawDisabledReason && !drawComplete ? (
            <p id="rf-draw-hint" className="text-xs text-muted">
              {drawDisabledReason}
            </p>
          ) : null}
        </div>

        {/* Results — Draw stays at top of this sticky column on desktop */}
        <div className="min-w-0 rounded-3xl border border-border bg-surface p-3 sm:p-5 lg:sticky lg:top-4 lg:self-start print:hidden">
          {!drawComplete ? (
            <button
              type="button"
              disabled={
                Boolean(drawDisabledReason) ||
                drawing ||
                shuffling ||
                (locked && reveal === "all")
              }
              onClick={runDraw}
              className="mb-4 hidden min-h-12 w-full items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 lg:inline-flex"
            >
              {drawing ? "Drawing…" : drawButtonLabel(reveal, winners, alternates, picks, prizes)}
            </button>
          ) : (
            <p className="mb-3 hidden text-sm font-semibold text-muted lg:block">Draw complete.</p>
          )}
          <ResultsPanel
            heading={resultsHeading}
            headingRef={resultsHeadingRef}
            record={activeRecord}
            picks={picks}
            displayEntrants={displayEntrants}
            mode={mode}
            prizes={prizes}
            revealAnim={revealAnim}
            winners={winners}
            hasPicks={picks.length > 0}
          />

          {picks.length > 0 && activeRecord ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionBtn label="Copy record" onClick={copyRecord} />
              <ActionBtn label="Download .txt" onClick={downloadTxt} />
              <ActionBtn label="Download .csv" onClick={downloadCsv} />
              <ActionBtn label="Print" onClick={printRecord} />
              {showResultLink ? (
                <ActionBtn label="Copy result link" onClick={copyResultLink} />
              ) : null}
              <ActionBtn
                ref={extraAltButtonRef}
                label="Draw another alternate"
                onClick={runExtraAlternate}
                disabled={!extraAlternateOk}
              />
              <ActionBtn label="New draw" onClick={() => setConfirm("new-draw")} />
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 min-h-5 text-sm text-muted" role="status" aria-live="polite">
        {status}
      </p>

      <pre className="hidden whitespace-pre-wrap print:block">{record ? formatRecordText(record) : ""}</pre>

      <ConfirmDialog
        open={confirm === "clear-entries"}
        title="Clear all entries?"
        body="This also clears the current draw."
        confirmLabel="Clear"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          clearEntries();
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "try-sample"}
        title="Replace your list with the sample?"
        body="Your current entries will be replaced by the sample list."
        confirmLabel="Replace"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          applySample();
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "edit-entries" || confirm === "new-draw"}
        title="Start a new draw?"
        body="These winners will be cleared from this page. Copy or download the record first if you need it."
        confirmLabel={confirm === "edit-entries" ? "Clear draw and edit" : "New draw"}
        danger={confirm === "edit-entries"}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const kind = confirm;
          clearDraw();
          setConfirm(null);
          if (kind === "edit-entries") announce("Draw cleared. You can edit the entries.");
          window.setTimeout(() => {
            if (mode === "list") listInputRef.current?.focus();
            else rangeStartRef.current?.focus();
          }, 50);
        }}
      />
      <ToolConfetti fire={confettiFire} />
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  disabled,
  ref,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function rulesLine(r: DrawRecord): string {
  const rules =
    r.mode === "range"
      ? ["each ticket can win only once"]
      : [
          r.allowRepeatWinners
            ? "a person can win more than once (one prize per ticket)"
            : "each person can win only once",
        ];
  if (r.mode === "list") {
    if (r.multipleTickets) rules.push("multiple tickets per person on");
    rules.push(
      r.duplicates === "combine"
        ? "repeated names combined into extra tickets"
        : "repeated names ignored",
    );
  }
  return `Rules: ${rules.join("; ")}`;
}

const TRANSPARENCY_NOTICE =
  "This record is for transparency only. It isn't a certified, audited or legally compliant draw. Raffle and lottery laws vary by place; you're responsible for following the rules where you run your raffle.";

function ResultsPanel({
  heading,
  headingRef,
  record,
  picks,
  displayEntrants,
  mode,
  prizes,
  revealAnim,
  winners,
  hasPicks,
}: {
  heading: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  record: DrawRecord | null;
  picks: readonly RafflePick[];
  displayEntrants: readonly Entrant[];
  mode: "list" | "range";
  prizes: readonly string[];
  revealAnim: number[];
  winners: number;
  hasPicks: boolean;
}) {
  const notice = (
    <p className="mt-4 text-sm text-muted">{TRANSPARENCY_NOTICE}</p>
  );

  if (!hasPicks) {
    return (
      <div>
        <h2 className="text-lg font-bold text-foreground">Results</h2>
        <p className="mt-2 text-sm text-muted">
          Winners appear here. Each pick takes one ticket at random from the tickets still in the
          draw.
        </p>
        {notice}
      </div>
    );
  }

  const winnerPicks = picks.filter((p) => p.kind === "winner");
  const altPicks = picks.filter((p) => p.kind === "alternate");

  return (
    <div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-bold text-foreground outline-none"
      >
        {heading}
      </h2>
      {record?.title ? (
        <p className="mt-1 min-w-0 break-words text-sm text-muted [overflow-wrap:anywhere]">
          {record.title}
        </p>
      ) : null}

      <ol className="mt-4 space-y-3">
        {winnerPicks.map((p, i) => {
          const ent = displayEntrants[p.entrant];
          const pl = prizeLabel(p.position, prizes);
          const anim = revealAnim.includes(picks.indexOf(p));
          const ticketNo = mode === "list" ? p.ticket : p.position;
          return (
            <li
              key={`w-${i}`}
              className={`et-ticket ${anim ? "rf-reveal-anim" : ""}`}
              style={anim ? { animationDelay: `${Math.min(i * 60, 1140)}ms` } : undefined}
            >
              <div className="et-ticket-stub">#{String(ticketNo).padStart(2, "0")}</div>
              <div className="et-ticket-body">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">{pl}</p>
                <p className="min-w-0 text-lg font-bold text-foreground [overflow-wrap:anywhere]">
                  {ent?.label ?? "—"}
                </p>
                {mode === "list" ? (
                  <p className="text-xs text-muted">
                    Ticket #{p.ticket} · drawn {i + 1} of {winners}
                  </p>
                ) : (
                  <p className="text-xs text-muted">
                    Drawn {i + 1} of {winners}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {altPicks.length > 0 ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-foreground">Alternates (in order)</h3>
          <ul className="mt-2 space-y-2">
            {altPicks.map((p) => {
              const ent = displayEntrants[p.entrant];
              const ticketPart = mode === "list" ? ` · ticket #${p.ticket}` : "";
              return (
                <li key={`a-${p.position}`} className="min-w-0 text-sm text-foreground [overflow-wrap:anywhere]">
                  Alternate {p.position} · {ent?.label ?? "—"}
                  {ticketPart}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {notice}
    </div>
  );
}

function SharedResultCard({
  record,
  onCopy,
  onClose,
}: {
  record: DrawRecord;
  onCopy: (text: string, ok: string, method: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="mb-4 rounded-3xl border border-border bg-surface p-5 sm:p-6 print:hidden">
      <h2 className="text-lg font-bold text-foreground">Shared raffle result</h2>
      {record.title ? (
        <p className="mt-1 min-w-0 break-words text-base font-semibold [overflow-wrap:anywhere]">
          {record.title}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted">Draw code: {record.code}</p>
      <p className="text-sm text-muted">Drawn: {formatTimestamp(record.createdAt, record.tzOffsetMin)}</p>
      {record.mode === "range" && record.range ? (
        <p className="mt-1 text-sm text-muted">
          Tickets: {record.range.from} to {record.range.to}
          {record.range.excluded ? ` (${record.range.excluded} left out)` : ""}, {record.tickets}{" "}
          tickets in the draw
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">
          {record.entrants} names, {record.tickets} tickets
        </p>
      )}
      <p className="text-sm text-muted">{rulesLine(record)}</p>
      <p className="text-sm text-muted">List fingerprint: {record.fingerprint}</p>

      <ol className="mt-4 space-y-2">
        {record.winners.map((w, i) => (
          <li key={i} className="min-w-0 [overflow-wrap:anywhere]">
            <span className="text-xs text-muted">{w.prize}</span>
            <p className="font-semibold text-foreground">{w.label}</p>
            {w.ticket !== null ? (
              <p className="text-xs text-muted">ticket #{w.ticket}</p>
            ) : null}
          </li>
        ))}
      </ol>
      {record.alternates.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {record.alternates.map((a, i) => (
            <li key={i} className="min-w-0 text-sm text-foreground [overflow-wrap:anywhere]">
              Alternate {i + 1} · {a.label}
              {a.ticket !== null ? ` · ticket #${a.ticket}` : ""}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 text-sm text-muted">
        Shared by the host. ExesTools doesn&apos;t store draws, so we can&apos;t confirm this
        result. Ask the host for their record or a recording if you need to check.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ActionBtn
          label="Copy record"
          onClick={() => onCopy(formatRecordText(record), "Record copied.", "copy")}
        />
        <ActionBtn label="Close" onClick={onClose} />
      </div>
    </div>
  );
}
