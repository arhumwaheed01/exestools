"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  decodeReveal,
  decodeSetup,
  readHash,
  revealUrl,
  setupUrl,
  type RevealPayload,
  type SetupPayload,
} from "@/lib/secret-santa/codec";
import { drawSecretSanta, MAX_PARTICIPANTS, MIN_PARTICIPANTS } from "@/lib/secret-santa/draw";
import { describeFailure } from "@/lib/secret-santa/messages";
import {
  addNames,
  findDuplicateIndexes,
  MAX_NAME_LENGTH,
  normalizeName,
  splitPasted,
} from "@/lib/secret-santa/participants";
import {
  clearState,
  emptyState,
  HANDOFF_KEY,
  loadState,
  makeDrawCode,
  randomId,
  saveState,
  type EventDetails,
  type ExclusionRule,
  type Participant,
  type SavedDraw,
  type SecretSantaState,
} from "@/lib/secret-santa/storage";
import { ToolConfetti } from "@/components/tools/Confetti";
import { track } from "@/lib/track";
import { useSound } from "@/lib/tools/sound";
import { resolveToolTheme } from "@/lib/tools/theme";
import { ConfirmDialog } from "./ConfirmDialog";
import "@/app/styles/tools-themes.css";

const TOOL_ID = "secret-santa-generator";
const SITE_ORIGIN = "https://www.exestools.com";
const SAMPLE_NAMES = ["Ava", "Noah", "Mia", "Liam", "Sophia"] as const;

type ViewMode = "tool" | "reveal" | "reveal-bad";
type ConfirmKind =
  | null
  | "clear-list"
  | "edit-list"
  | "redraw"
  | "reset"
  | "replace-setup";

function takeIncoming(): { kind: "reveal" | "setup"; token: string } | null {
  const fromUrl = readHash(window.location.hash);
  if (fromUrl) {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
    return fromUrl;
  }
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const { k, t } = JSON.parse(raw) as { k: "r" | "s"; t: string };
    return { kind: k === "r" ? "reveal" : "setup", token: t };
  } catch {
    return null;
  }
}

function formatExchangeDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(date);
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function hasDetailsFilled(d: EventDetails): boolean {
  return Boolean(d.eventName || d.budget || d.date || d.note);
}

function buildLinksText(
  participants: Participant[],
  links: Map<string, string>,
  details: EventDetails,
  code: string,
): string {
  const title = details.eventName
    ? `Secret Santa — ${details.eventName} (draw ${code})`
    : `Secret Santa (draw ${code})`;
  const metaParts: string[] = [];
  if (details.budget) metaParts.push(`Budget: ${details.budget}`);
  if (details.date) metaParts.push(`Exchange date: ${formatShortDate(details.date)}`);
  const lines = [title];
  if (metaParts.length) lines.push(metaParts.join(" · "));
  lines.push("Send each person only their own link.", "");
  for (const p of participants) {
    lines.push(`${p.name}: ${links.get(p.id) ?? ""}`);
  }
  return lines.join("\n");
}

function setupEqual(a: SecretSantaState, payload: SetupPayload): boolean {
  if (a.participants.length !== payload.p.length) return false;
  if (a.participants.some((p, i) => p.name !== payload.p[i])) return false;
  if (Boolean(a.singleCycle) !== Boolean(payload.o)) return false;
  const ax = a.exclusions
    .map((r) => {
      const from = a.participants.findIndex((p) => p.id === r.a);
      const to = a.participants.findIndex((p) => p.id === r.b);
      return `${from},${to},${r.mutual ? 1 : 0}`;
    })
    .sort()
    .join("|");
  const bx = payload.x
    .map((t) => `${t[0]},${t[1]},${t[2]}`)
    .sort()
    .join("|");
  return ax === bx;
}

function stateFromSetup(payload: SetupPayload): SecretSantaState {
  const participants = payload.p.map((name) => ({ id: randomId(), name }));
  const exclusions: ExclusionRule[] = payload.x.map(([from, to, mutual]) => ({
    id: randomId(),
    a: participants[from]!.id,
    b: participants[to]!.id,
    mutual: mutual === 1,
  }));
  return {
    v: 1,
    participants,
    exclusions,
    details: {
      eventName: payload.e ?? "",
      budget: payload.b ?? "",
      date: payload.d ?? "",
      note: payload.n ?? "",
    },
    singleCycle: payload.o === 1,
    draw: null,
  };
}

export function SecretSantaTool() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewMode>("tool");
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confettiFire, setConfettiFire] = useState(0);
  const sound = useSound();
  const festiveTheme = resolveToolTheme("auto", TOOL_ID);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [exclusions, setExclusions] = useState<ExclusionRule[]>([]);
  const [details, setDetails] = useState<EventDetails>({
    eventName: "",
    budget: "",
    date: "",
    note: "",
  });
  const [singleCycle, setSingleCycle] = useState(false);
  const [draw, setDraw] = useState<SavedDraw | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [exFrom, setExFrom] = useState("");
  const [exTo, setExTo] = useState("");
  const [exMutual, setExMutual] = useState(true);
  const [status, setStatus] = useState("");
  const [drawError, setDrawError] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [listLocked, setListLocked] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [pendingSetup, setPendingSetup] = useState<SetupPayload | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [printMode, setPrintMode] = useState<"none" | "links" | "slips">("none");
  const [eventOpen, setEventOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const linksHeadingRef = useRef<HTMLHeadingElement>(null);
  const revealHeadingRef = useRef<HTMLHeadingElement>(null);
  const statusTimer = useRef(0);
  const saveTimer = useRef(0);
  const revealTracked = useRef(false);

  const announce = useCallback((msg: string) => {
    setStatus(msg);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 4000);
  }, []);

  const skipCount = (n: number, singular: string, plural: string) =>
    `Skipped ${n} ${n === 1 ? singular : plural}`;

  const persist = useCallback(
    (next: Partial<SecretSantaState> & { participants?: Participant[]; exclusions?: ExclusionRule[] }) => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const state: SecretSantaState = {
          v: 1,
          participants: next.participants ?? participants,
          exclusions: next.exclusions ?? exclusions,
          details: next.details ?? details,
          singleCycle: next.singleCycle ?? singleCycle,
          draw: next.draw !== undefined ? next.draw : draw,
        };
        saveState(state);
      }, 300);
    },
    [participants, exclusions, details, singleCycle, draw],
  );

  const applySetup = useCallback(
    (payload: SetupPayload, announceLoad: boolean) => {
      const next = stateFromSetup(payload);
      setParticipants(next.participants);
      setExclusions(next.exclusions);
      setDetails(next.details);
      setSingleCycle(next.singleCycle);
      setDraw(null);
      setListLocked(false);
      setShowMatches(false);
      setDrawError("");
      setEventOpen(hasDetailsFilled(next.details));
      saveState(next);
      track("share_open", { toolId: TOOL_ID, via: "hash" });
      if (announceLoad) {
        announce(
          `Loaded a shared setup: ${next.participants.length} people, ${next.exclusions.length} exclusions. Press Draw names to create your own links.`,
        );
      }
    },
    [announce],
  );

  const handleIncoming = useCallback(() => {
    const inc = takeIncoming();
    if (!inc) return;

    if (inc.kind === "reveal") {
      const payload = decodeReveal(inc.token);
      if (!payload) {
        setView("reveal-bad");
        setReveal(null);
      } else {
        setReveal(payload);
        setView("reveal");
        setRevealed(false);
        revealTracked.current = false;
      }
      return;
    }

    try {
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      /* ignore */
    }
    const payload = decodeSetup(inc.token);
    if (!payload) {
      announce("This setup link looks incomplete or damaged.");
      return;
    }
    const current = loadState();
    if (current.participants.length === 0 || setupEqual(current, payload)) {
      applySetup(payload, true);
    } else {
      setPendingSetup(payload);
      setConfirm("replace-setup");
    }
  }, [announce, applySetup]);

  useEffect(() => {
    const stored = loadState();
    setParticipants(stored.participants);
    setExclusions(stored.exclusions);
    setDetails(stored.details);
    setSingleCycle(stored.singleCycle);
    setDraw(stored.draw);
    setListLocked(Boolean(stored.draw));
    setEventOpen(hasDetailsFilled(stored.details));
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    handleIncoming();
    setReady(true);

    const onHash = () => handleIncoming();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    if (!ready || view !== "tool") return;
    persist({ participants, exclusions, details, singleCycle, draw });
  }, [ready, view, participants, exclusions, details, singleCycle, draw, persist]);

  useEffect(() => {
    document.body.dataset.ssPrint = printMode;
    return () => {
      delete document.body.dataset.ssPrint;
    };
  }, [printMode]);

  const names = useMemo(() => participants.map((p) => p.name), [participants]);
  const dupIndexes = useMemo(() => findDuplicateIndexes(names), [names]);
  const dupSet = useMemo(() => new Set(dupIndexes), [dupIndexes]);
  const firstDupName = dupIndexes.length ? names[dupIndexes[0]!] : null;

  const byId = useMemo(() => {
    const m = new Map<string, Participant>();
    participants.forEach((p) => m.set(p.id, p));
    return m;
  }, [participants]);

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return SITE_ORIGIN;
  }, [ready]);

  const personLinks = useMemo(() => {
    const map = new Map<string, string>();
    if (!draw) return map;
    for (const p of participants) {
      const receiverId = draw.pairs[p.id];
      const receiver = receiverId ? byId.get(receiverId) : null;
      if (!receiver) continue;
      const payload: RevealPayload = {
        v: 1,
        g: p.name,
        r: receiver.name,
        c: draw.code,
      };
      if (details.eventName) payload.e = details.eventName;
      if (details.budget) payload.b = details.budget;
      if (details.date) payload.d = details.date;
      if (details.note) payload.n = details.note;
      map.set(p.id, revealUrl(origin, payload));
    }
    return map;
  }, [draw, participants, byId, details, origin]);

  const drawDisabledReason = useMemo(() => {
    if (participants.length < MIN_PARTICIPANTS) return "Add at least 3 people to draw names.";
    if (firstDupName) return `"${firstDupName}" is on the list twice. Add an initial so each name is unique.`;
    return "";
  }, [participants.length, firstDupName]);

  const addPerson = (raw: string) => {
    const result = addNames(
      participants.map((p) => p.name),
      [raw],
    );
    if (result.added.length === 0) {
      if (result.skippedDuplicates.length)
        announce(`${skipCount(result.skippedDuplicates.length, "duplicate", "duplicates")}.`);
      else if (result.skippedTooLong.length)
        announce(
          `${skipCount(result.skippedTooLong.length, "name", "names")} over 40 characters.`,
        );
      else if (result.skippedOverLimit.length)
        announce(`The list is full (50 people). ${result.skippedOverLimit.length} names weren't added.`);
      return;
    }
    const next = [
      ...participants,
      ...result.added.map((name) => ({ id: randomId(), name })),
    ];
    setParticipants(next);
    setNameInput("");
    announce(`Added ${result.added.length} names.`);
  };

  const addPasted = () => {
    const incoming = splitPasted(pasteText);
    const result = addNames(
      participants.map((p) => p.name),
      incoming,
    );
    const next = [
      ...participants,
      ...result.added.map((name) => ({ id: randomId(), name })),
    ];
    setParticipants(next);
    setPasteText("");
    setPasteOpen(false);
    const parts: string[] = [];
    if (result.added.length)
      parts.push(
        `Added ${result.added.length} ${result.added.length === 1 ? "name" : "names"}.`,
      );
    if (result.skippedDuplicates.length)
      parts.push(`${skipCount(result.skippedDuplicates.length, "duplicate", "duplicates")}.`);
    if (result.skippedTooLong.length)
      parts.push(
        `${skipCount(result.skippedTooLong.length, "name", "names")} over 40 characters.`,
      );
    if (result.skippedOverLimit.length)
      parts.push(
        `The list is full (50 people). ${result.skippedOverLimit.length} names weren't added.`,
      );
    announce(parts.join(" ") || "No names added.");
  };

  const removePerson = (id: string, focusNext?: string | null) => {
    const person = byId.get(id);
    const removedRules = exclusions.filter((r) => r.a === id || r.b === id);
    const nextPeople = participants.filter((p) => p.id !== id);
    const nextEx = exclusions.filter((r) => r.a !== id && r.b !== id);
    setParticipants(nextPeople);
    setExclusions(nextEx);
    if (exFrom === id) setExFrom("");
    if (exTo === id) setExTo("");
    const msg =
      removedRules.length > 0
        ? `Removed ${person?.name ?? "person"} and ${removedRules.length} exclusion${removedRules.length === 1 ? "" : "s"} that included them.`
        : `Removed ${person?.name ?? "person"}.`;
    announce(msg);
    requestAnimationFrame(() => {
      if (focusNext) {
        document
          .querySelector<HTMLButtonElement>(`[data-remove-id="${focusNext}"]`)
          ?.focus();
      } else {
        nameInputRef.current?.focus();
      }
    });
  };

  const commitEdit = (id: string) => {
    const name = normalizeName(editDraft);
    if (!name || name.length > MAX_NAME_LENGTH) {
      setEditingId(null);
      return;
    }
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    setEditingId(null);
  };

  const addExclusion = () => {
    if (!exFrom || !exTo || exFrom === exTo) {
      announce("Pick two different people.");
      return;
    }
    if (exclusions.length >= 200) {
      announce("You can add up to 200 exclusions.");
      return;
    }
    const reverse = exclusions.find((r) => r.a === exTo && r.b === exFrom && !r.mutual);
    const same = exclusions.find(
      (r) =>
        (r.a === exFrom && r.b === exTo) ||
        (r.mutual && r.a === exTo && r.b === exFrom),
    );
    if (same) {
      announce("That exclusion already exists.");
      return;
    }
    if (reverse && !exMutual) {
      setExclusions((prev) =>
        prev.map((r) => (r.id === reverse.id ? { ...r, mutual: true } : r)),
      );
      announce("Merged into a two-way exclusion.");
      return;
    }
    if (reverse && exMutual) {
      setExclusions((prev) =>
        prev.map((r) => (r.id === reverse.id ? { ...r, mutual: true } : r)),
      );
      announce("Merged into a two-way exclusion.");
      return;
    }
    setExclusions((prev) => [
      ...prev,
      { id: randomId(), a: exFrom, b: exTo, mutual: exMutual },
    ]);
    announce("Exclusion added.");
  };

  const runDraw = (isRedraw: boolean) => {
    if (drawDisabledReason) return;
    setDrawing(true);
    setDrawError("");
    setStatus("Drawing…");
    window.setTimeout(() => {
      const index = new Map(participants.map((p, i) => [p.id, i]));
      const rules = exclusions
        .map((r) => {
          const from = index.get(r.a);
          const to = index.get(r.b);
          if (from === undefined || to === undefined) return null;
          return { from, to, mutual: r.mutual };
        })
        .filter((r): r is { from: number; to: number; mutual: boolean } => r !== null);

      const res = drawSecretSanta(participants.length, rules, { singleCycle });
      if (!res.ok) {
        setDrawError(describeFailure(res, names));
        setDrawing(false);
        setStatus("");
        track("secret_santa_draw", {
          toolId: TOOL_ID,
          result: res.reason,
          participants: participants.length,
          exclusions: exclusions.length,
          single_cycle: singleCycle ? 1 : 0,
          has_details: hasDetailsFilled(details) ? 1 : 0,
          is_redraw: isRedraw ? 1 : 0,
        });
        return;
      }

      const pairs: Record<string, string> = {};
      res.assignment.forEach((receiverIdx, giverIdx) => {
        pairs[participants[giverIdx]!.id] = participants[receiverIdx]!.id;
      });
      const nextDraw: SavedDraw = {
        code: makeDrawCode(),
        createdAt: Date.now(),
        pairs,
      };
      setDraw(nextDraw);
      setListLocked(true);
      setShowMatches(false);
      setDrawing(false);
      sound.unlock();
      sound.fanfare();
      setConfettiFire((n) => n + 1);
      announce(`Names drawn for ${participants.length} people. Draw code ${nextDraw.code}.`);
      track("secret_santa_draw", {
        toolId: TOOL_ID,
        result: "success",
        participants: participants.length,
        exclusions: exclusions.length,
        single_cycle: singleCycle ? 1 : 0,
        has_details: hasDetailsFilled(details) ? 1 : 0,
        is_redraw: isRedraw ? 1 : 0,
      });
      requestAnimationFrame(() => linksHeadingRef.current?.focus());
    }, 0);
  };

  const copyText = async (text: string, okMsg: string, method: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      announce(okMsg);
      if (id) {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 2000);
      }
      track("secret_santa_copy_link", { toolId: TOOL_ID, method });
    } catch {
      announce("Couldn't copy. Check your browser's clipboard permission.");
    }
  };

  const copyAllLinks = () => {
    if (!draw) return;
    const text = buildLinksText(participants, personLinks, details, draw.code);
    void copyText(text, `All ${participants.length} links copied. Send each person only their own link.`, "all");
  };

  const downloadLinks = () => {
    if (!draw) return;
    const text = buildLinksText(participants, personLinks, details, draw.code);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `secret-santa-links-${draw.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    announce("Download started.");
    track("secret_santa_copy_link", { toolId: TOOL_ID, method: "download" });
  };

  const printLinks = () => {
    setPrintMode("links");
    track("secret_santa_copy_link", { toolId: TOOL_ID, method: "print_links" });
    window.setTimeout(() => {
      window.print();
      setPrintMode("none");
    }, 50);
  };

  const printSlips = () => {
    setPrintMode("slips");
    track("secret_santa_copy_link", { toolId: TOOL_ID, method: "print_slips" });
    window.setTimeout(() => {
      window.print();
      setPrintMode("none");
    }, 50);
  };

  const copySetup = () => {
    const index = new Map(participants.map((p, i) => [p.id, i]));
    const payload: SetupPayload = {
      v: 1,
      p: participants.map((p) => p.name),
      x: exclusions.map((r) => [
        index.get(r.a)!,
        index.get(r.b)!,
        r.mutual ? 1 : 0,
      ]),
    };
    if (singleCycle) payload.o = 1;
    if (details.eventName) payload.e = details.eventName;
    if (details.budget) payload.b = details.budget;
    if (details.date) payload.d = details.date;
    if (details.note) payload.n = details.note;
    void copyText(setupUrl(origin, payload), "Setup link copied.", "setup");
  };

  const shareOne = async (p: Participant, url: string) => {
    try {
      await navigator.share({
        title: "Your Secret Santa link",
        text: `Hi ${p.name}, tap Reveal to see who you're buying for.`,
        url,
      });
      track("secret_santa_copy_link", { toolId: TOOL_ID, method: "share_sheet" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  };

  const exitReveal = () => {
    try {
      sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      /* ignore */
    }
    setView("tool");
    setReveal(null);
    setRevealed(false);
    const stored = loadState();
    setParticipants(stored.participants);
    setExclusions(stored.exclusions);
    setDetails(stored.details);
    setSingleCycle(stored.singleCycle);
    setDraw(stored.draw);
    setListLocked(Boolean(stored.draw));
  };

  const onRevealTap = () => {
    sound.unlock();
    setRevealed(true);
    sound.fanfare();
    setConfettiFire((n) => n + 1);
    requestAnimationFrame(() => revealHeadingRef.current?.focus());
    if (!revealTracked.current && reveal) {
      revealTracked.current = true;
      track("secret_santa_reveal", {
        toolId: TOOL_ID,
        has_budget: reveal.b ? 1 : 0,
        has_date: reveal.d ? 1 : 0,
        has_note: reveal.n ? 1 : 0,
      });
    }
  };

  const loadSample = () => {
    if (listLocked && draw) return;
    const result = addNames([], [...SAMPLE_NAMES]);
    setParticipants(result.added.map((name) => ({ id: randomId(), name })));
    setExclusions([]);
    setDraw(null);
    setListLocked(false);
    announce("Sample list loaded — add real names before you draw.");
  };

  if (!ready) {
    return (
      <div
        className="min-h-[560px] animate-pulse rounded-3xl border border-border bg-surface p-5"
        aria-hidden
      />
    );
  }

  if (view === "reveal-bad") {
    return (
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-8">
        <p className="text-base text-foreground">
          This link looks incomplete or damaged. Ask the organizer to send it again.
        </p>
        <button
          type="button"
          onClick={exitReveal}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
        >
          Run your own Secret Santa
        </button>
      </div>
    );
  }

  if (view === "reveal" && reveal) {
    const eventTitle = reveal.e || "Secret Santa";
    return (
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-8"
        data-tool-theme={festiveTheme}
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgb(255 255 255 / 0.08) 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, rgb(255 255 255 / 0.07) 0 1.5px, transparent 2px), radial-gradient(circle at 40% 75%, rgb(255 255 255 / 0.06) 0 2px, transparent 3px)",
        }}
      >
        <div className="et-prize-ribbon mb-3" aria-hidden />
        <h2 className="mt-1 text-xl font-bold text-foreground">{eventTitle}</h2>
        <p className="mt-3 text-sm text-muted">
          Hi {reveal.g},
          <br />
          Someone organized a Secret Santa draw and this link is just for you.
        </p>

        {!revealed ? (
          <button
            type="button"
            aria-expanded="false"
            onClick={onRevealTap}
            className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-accent-strong px-4 text-base font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
          >
            Tap to reveal who you&apos;re buying for
          </button>
        ) : (
          <div
            className="ss-reveal-anim et-result-banner mt-6 rounded-2xl border border-border px-4 py-4"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--t-win, #991b1b) 85%, #0f172a), color-mix(in srgb, var(--t-accent, #b91c1c) 55%, #14532d))",
            }}
            aria-live="polite"
          >
            <h3
              ref={revealHeadingRef}
              tabIndex={-1}
              className="text-sm font-semibold uppercase tracking-wide text-cyan-200 outline-none"
            >
              You&apos;re buying for
            </h3>
            <p className="mt-1 min-w-0 text-[28px] font-extrabold leading-tight text-white [overflow-wrap:anywhere]">
              {reveal.r}
            </p>
            {reveal.b ? <p className="mt-3 text-sm text-white/80">Budget: {reveal.b}</p> : null}
            {reveal.d ? (
              <p className="mt-1 text-sm text-white/80">
                Exchange date: {formatExchangeDate(reveal.d)}
              </p>
            ) : null}
            {reveal.n ? (
              <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">Note: {reveal.n}</p>
            ) : null}
            <p className="mt-2 text-xs text-white/70">Draw code {reveal.c}</p>
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-white/35 px-4 text-sm font-bold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              Hide again
            </button>
          </div>
        )}

        <p className="mt-6 text-sm text-muted">
          Not {reveal.g}? This link is meant for {reveal.g}. Close this page without revealing.
        </p>
        <p className="mt-2 text-sm text-muted">
          Your match is stored in this link, not on our servers. Keep the message with your link so
          you can open it again.
        </p>
        <button
          type="button"
          onClick={exitReveal}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Run your own Secret Santa
        </button>
        <ToolConfetti fire={confettiFire} colors={["#b91c1c", "#15803d", "#fbbf24", "#fff"]} />
      </div>
    );
  }

  const locked = listLocked && Boolean(draw);

  return (
    <div className="ss-tool min-w-0" data-tool-theme={festiveTheme}>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5">
          {/* Participants */}
          <section aria-labelledby="ss-who" className="min-w-0">
            <div className="flex min-w-0 items-baseline justify-between gap-2">
              <h2 id="ss-who" className="text-lg font-bold text-foreground">
                Who&apos;s taking part
              </h2>
              <p className="text-xs text-muted">
                {participants.length} / {MAX_PARTICIPANTS} people
              </p>
            </div>

            {!locked ? (
              <>
                <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="ss-name" className="sr-only">
                      Name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="ss-name"
                      type="text"
                      maxLength={MAX_NAME_LENGTH}
                      autoComplete="off"
                      enterKeyHint="done"
                      value={nameInput}
                      disabled={participants.length >= MAX_PARTICIPANTS}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPerson(nameInput);
                        }
                      }}
                      className="w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      placeholder="Name"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={participants.length >= MAX_PARTICIPANTS}
                    onClick={() => addPerson(nameInput)}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setPasteOpen((v) => !v)}
                    className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Paste a list
                  </button>
                  {participants.length === 0 ? (
                    <button
                      type="button"
                      onClick={loadSample}
                      className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Try a sample
                    </button>
                  ) : null}
                </div>
                {pasteOpen ? (
                  <div className="mt-2 space-y-2">
                    <label htmlFor="ss-paste" className="block text-xs text-muted">
                      Paste names, one per line
                    </label>
                    <textarea
                      id="ss-paste"
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={addPasted}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Add names
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirm("edit-list")}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
              >
                Edit list
              </button>
            )}

            <ul className="mt-3 space-y-2">
              {participants.map((p, i) => {
                const nextId = participants[i + 1]?.id ?? null;
                const isDup = dupSet.has(i);
                return (
                  <li
                    key={p.id}
                    aria-invalid={isDup || undefined}
                    className={`flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5 ${
                      isDup ? "border-red-500" : "border-border"
                    }`}
                  >
                    {editingId === p.id && !locked ? (
                      <input
                        value={editDraft}
                        maxLength={MAX_NAME_LENGTH}
                        aria-invalid={isDup}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onBlur={() => commitEdit(p.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit(p.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        autoFocus
                      />
                    ) : (
                      <span className="min-w-0 flex-1 px-1 text-sm font-medium text-foreground [overflow-wrap:anywhere]">
                        {p.name}
                      </span>
                    )}
                    {!locked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(p.id);
                            setEditDraft(p.name);
                          }}
                          className="inline-flex min-h-11 shrink-0 items-center px-2 text-xs font-semibold text-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          data-remove-id={p.id}
                          aria-label={`Remove ${p.name}`}
                          onClick={() => removePerson(p.id, nextId)}
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          ✕
                        </button>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {firstDupName ? (
              <p className="mt-2 text-sm text-red-600" role="status">
                &quot;{firstDupName}&quot; is on the list twice. Add an initial so each name is
                unique.
              </p>
            ) : null}
          </section>

          {/* Exclusions */}
          <section aria-labelledby="ss-exclusions">
            <h2 id="ss-exclusions" className="text-lg font-bold text-foreground">
              Exclusions
            </h2>
            <p className="mt-1 text-sm text-muted">
              Use exclusions for couples or anyone who shouldn&apos;t draw a certain person. Too many
              exclusions in a small group can make a draw impossible. You&apos;ll see who&apos;s
              stuck.
            </p>
            {!locked && participants.length >= 2 ? (
              <div className="mt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ss-ex-from" className="text-xs text-muted">
                      Person
                    </label>
                    <select
                      id="ss-ex-from"
                      value={exFrom}
                      onChange={(e) => setExFrom(e.target.value)}
                      className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="">Select…</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ss-ex-to" className="text-xs text-muted">
                      can&apos;t draw
                    </label>
                    <select
                      id="ss-ex-to"
                      value={exTo}
                      onChange={(e) => setExTo(e.target.value)}
                      className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <option value="">Select…</option>
                      {participants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <fieldset>
                  <legend className="text-xs text-muted">Direction</legend>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="ss-dir"
                        checked={exMutual}
                        onChange={() => setExMutual(true)}
                      />
                      Neither draws the other
                    </label>
                    <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="ss-dir"
                        checked={!exMutual}
                        onChange={() => setExMutual(false)}
                      />
                      One-way
                    </label>
                  </div>
                </fieldset>
                <button
                  type="button"
                  onClick={addExclusion}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Add exclusion
                </button>
              </div>
            ) : null}
            <ul className="mt-3 space-y-2">
              {exclusions.map((r) => {
                const a = byId.get(r.a)?.name ?? "?";
                const b = byId.get(r.b)?.name ?? "?";
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      <span aria-hidden>
                        {a} {r.mutual ? "⇄" : "→"} {b}
                      </span>
                      <span className="sr-only">
                        {r.mutual
                          ? `${a} and ${b} won't draw each other`
                          : `${a} won't draw ${b}`}
                      </span>
                    </span>
                    {!locked ? (
                      <button
                        type="button"
                        aria-label={`Remove exclusion ${a} and ${b}`}
                        onClick={() => {
                          setExclusions((prev) => prev.filter((x) => x.id !== r.id));
                          announce("Exclusion removed.");
                        }}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        ✕
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Event details */}
          <details
            className="rounded-2xl border border-border p-3"
            open={eventOpen}
            onToggle={(e) => setEventOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-lg font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Event details (optional)
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="ss-event" className="text-xs text-muted">
                  Event name
                </label>
                <input
                  id="ss-event"
                  maxLength={60}
                  value={details.eventName}
                  onChange={(e) => setDetails((d) => ({ ...d, eventName: e.target.value }))}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="ss-budget" className="text-xs text-muted">
                  Budget
                </label>
                <input
                  id="ss-budget"
                  maxLength={30}
                  placeholder="e.g. $25, £20 or A$30"
                  value={details.budget}
                  onChange={(e) => setDetails((d) => ({ ...d, budget: e.target.value }))}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="ss-date" className="text-xs text-muted">
                  Exchange date
                </label>
                <input
                  id="ss-date"
                  type="date"
                  value={details.date}
                  onChange={(e) => setDetails((d) => ({ ...d, date: e.target.value }))}
                  className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="ss-note" className="text-xs text-muted">
                  Note
                </label>
                <textarea
                  id="ss-note"
                  maxLength={200}
                  rows={3}
                  value={details.note}
                  onChange={(e) => setDetails((d) => ({ ...d, note: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <p className="mt-1 text-xs text-muted">{details.note.length} / 200</p>
              </div>
              <p className="text-xs text-muted">
                Links you&apos;ve already sent keep the details they had when you copied them.
              </p>
            </div>
          </details>

          {/* Options */}
          <div className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Single loop</p>
              <p className="mt-1 text-xs text-muted">
                Everyone in one chain: A buys for B, B for C … and the last person for A. Stricter,
                so it can fail with many exclusions.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Single loop"
              aria-checked={singleCycle}
              disabled={locked}
              onClick={() => setSingleCycle((v) => !v)}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              <span
                className={`relative inline-flex h-7 w-12 items-center rounded-full ${
                  singleCycle ? "bg-accent-strong" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                    singleCycle ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </button>
          </div>

          {drawError ? (
            <p className="rounded-xl border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200" role="alert">
              {drawError}
            </p>
          ) : null}

          <div className="sticky bottom-0 z-30 -mx-1 border-t border-border bg-surface/95 px-1 py-2 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none sm:supports-[padding:max(0px)]:pb-0">
            <button
              type="button"
              disabled={Boolean(drawDisabledReason) || drawing || locked}
              aria-describedby={drawDisabledReason ? "ss-draw-hint" : undefined}
              onClick={() => runDraw(false)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              {drawing ? "Drawing…" : "Draw names"}
            </button>
          </div>
          {drawDisabledReason ? (
            <p id="ss-draw-hint" className="text-xs text-muted">
              {drawDisabledReason}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirm("clear-list")}
              disabled={locked || participants.length === 0}
              className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
            >
              Clear list
            </button>
          </div>
        </div>

        {/* Links panel */}
        <div
          className="ss-links-panel min-w-0 rounded-3xl border border-border bg-surface p-3 sm:p-5 lg:sticky lg:top-4 lg:self-start"
          data-print="links"
        >
          {draw ? (
            <>
              <h2
                ref={linksHeadingRef}
                tabIndex={-1}
                className="text-lg font-bold text-foreground outline-none"
              >
                Links are ready — draw {draw.code}
              </h2>
              <p className="mt-2 text-sm text-muted">
                Send each link only to the person named. Links are scrambled, not encrypted, so
                anyone who has a link can open it.
              </p>
              <ul className="mt-4 space-y-2">
                {participants.map((p) => {
                  const url = personLinks.get(p.id) ?? "";
                  return (
                    <li
                      key={p.id}
                      className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                        {p.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          void copyText(url, `${p.name}'s link copied.`, "single", p.id)
                        }
                        className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent print:hidden"
                      >
                        {copiedId === p.id ? "Copied ✓" : "Copy link"}
                      </button>
                      {canShare ? (
                        <button
                          type="button"
                          onClick={() => void shareOne(p, url)}
                          className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent print:hidden"
                        >
                          Share
                        </button>
                      ) : null}
                      <span className="hidden w-full break-all text-xs text-muted print:block">
                        {url}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                <button
                  type="button"
                  onClick={copyAllLinks}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Copy all links
                </button>
                <button
                  type="button"
                  onClick={downloadLinks}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Download (.txt)
                </button>
                <button
                  type="button"
                  onClick={printLinks}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Print links
                </button>
                <button
                  type="button"
                  onClick={copySetup}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Copy setup link
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm("redraw")}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Redraw
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm("reset")}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Reset
                </button>
              </div>

              <div className="mt-5 flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-border p-3 print:hidden">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">Show all matches</p>
                  <p className="mt-1 text-xs text-muted">Off by default. Not saved across reloads.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Show all matches"
                  aria-checked={showMatches}
                  onClick={() => setShowMatches((v) => !v)}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    showMatches ? "bg-accent-strong" : "bg-border"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                      showMatches ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {showMatches ? (
                <div className="mt-3" data-print="slips">
                  <table className="w-full text-left text-sm">
                    <caption className="mb-2 text-left text-xs text-muted">
                      Organizer view — hide this before sharing your screen.
                    </caption>
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 pr-2 font-semibold">Person</th>
                        <th className="py-2 font-semibold">Buys for</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => {
                        const receiverId = draw.pairs[p.id];
                        const receiver = receiverId ? byId.get(receiverId)?.name : "—";
                        return (
                          <tr key={p.id} className="border-b border-border/60">
                            <td className="max-w-0 py-2 pr-2 [overflow-wrap:anywhere]">{p.name}</td>
                            <td className="max-w-0 py-2 [overflow-wrap:anywhere]">{receiver}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={printSlips}
                    className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent print:hidden"
                  >
                    Print slips
                  </button>
                  <div className="ss-slips hidden print:block">
                    {participants.map((p) => {
                      const receiverId = draw.pairs[p.id];
                      const receiver = receiverId ? byId.get(receiverId)?.name : "—";
                      return (
                        <div
                          key={`slip-${p.id}`}
                          className="mb-4 break-inside-avoid rounded border border-black p-4"
                        >
                          <p className="font-bold">{details.eventName || "Secret Santa"}</p>
                          <p className="mt-2 text-lg">
                            {p.name}, you&apos;re buying for {receiver}
                          </p>
                          {details.budget ? <p className="mt-1">Budget: {details.budget}</p> : null}
                          {details.date ? (
                            <p>Exchange date: {formatExchangeDate(details.date)}</p>
                          ) : null}
                          {details.note ? (
                            <p className="whitespace-pre-wrap">Note: {details.note}</p>
                          ) : null}
                          <p className="mt-2 text-xs">Draw code {draw.code}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-foreground">Links</h2>
              <p className="mt-2 text-sm text-muted">
                After the draw, you&apos;ll get one private link per person. Each link shows only
                that person&apos;s match. Links are scrambled, not encrypted. Anyone with a link can
                open it, including you.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 min-h-5 text-sm text-muted" role="status" aria-live="polite">
        {status}
      </p>

      <ConfirmDialog
        open={confirm === "clear-list"}
        title="Clear list?"
        body="This removes every name and exclusion from this browser."
        confirmLabel="Clear list"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setParticipants([]);
          setExclusions([]);
          setConfirm(null);
          announce("List cleared.");
          nameInputRef.current?.focus();
        }}
      />
      <ConfirmDialog
        open={confirm === "edit-list"}
        title="Edit the list?"
        body="Editing the list clears this draw. Links you've already sent will still open, but they won't match a new draw."
        confirmLabel="Clear draw and edit"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setDraw(null);
          setListLocked(false);
          setShowMatches(false);
          setConfirm(null);
          announce("Draw cleared. You can edit the list.");
        }}
      />
      <ConfirmDialog
        open={confirm === "redraw"}
        title="Redraw?"
        body="Everyone gets a new match and a new link. Links you've already sent will still show the old matches, so you'll need to send the new ones."
        confirmLabel="Redraw"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          runDraw(true);
        }}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        title="Reset everything?"
        body="This removes all names, exclusions, details and the draw from this browser."
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          window.clearTimeout(saveTimer.current);
          clearState();
          const empty = emptyState();
          setParticipants(empty.participants);
          setExclusions(empty.exclusions);
          setDetails(empty.details);
          setSingleCycle(false);
          setDraw(null);
          setListLocked(false);
          setShowMatches(false);
          setDrawError("");
          setEventOpen(false);
          setConfirm(null);
          announce("Reset complete.");
          // After dialog restores focus to the trigger, move to Name.
          window.setTimeout(() => nameInputRef.current?.focus(), 50);
        }}
      />
      <ConfirmDialog
        open={confirm === "replace-setup"}
        title="Replace your saved list?"
        body={
          pendingSetup
            ? `Replace your saved list with the shared setup (${pendingSetup.p.length} people, ${pendingSetup.x.length} exclusions)?`
            : ""
        }
        confirmLabel="Replace"
        cancelLabel="Keep mine"
        onCancel={() => {
          setPendingSetup(null);
          setConfirm(null);
        }}
        onConfirm={() => {
          if (pendingSetup) applySetup(pendingSetup, true);
          setPendingSetup(null);
          setConfirm(null);
        }}
      />
      <ToolConfetti fire={confettiFire} colors={["#b91c1c", "#15803d", "#fbbf24", "#fff"]} />
    </div>
  );
}
