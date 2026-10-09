"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeChips } from "@/components/tools/ThemeChips";
import { ToolConfetti } from "@/components/tools/Confetti";
import { encodeShareHash, readShareFromLocation } from "@/lib/share-codec";
import { track } from "@/lib/track";
import { useSound } from "@/lib/tools/sound";
import {
  loadToolTheme,
  resolveToolTheme,
  saveToolTheme,
  segColor,
  type ToolThemeId,
} from "@/lib/tools/theme";
import {
  FUN_TEAMS,
  MAX_PER_TEAM,
  MAX_TEAMS,
  TEAM_SAMPLE_NAMES,
  clampTeamN,
  formatTeamsPlain,
  funTeamColor,
  generateTeams,
  parseTeamNames,
  teamsFromIndices,
  type TeamMode,
  type TeamResult,
  type TeamSettings,
} from "@/lib/teams";
import { labelInkForBg } from "@/lib/tools/contrast";
import "@/app/styles/tools-themes.css";

const STORAGE_KEY = "exestools.spinner.v1.random-team-generator";
const TOOL_ID = "random-team-generator" as const;

type StoredTeam = {
  choices: string[];
  updatedAt: number;
  team: {
    mode: TeamMode;
    n: number;
    leaveOut: boolean;
    teamNames: string[];
  };
};

type ShareTeamExtra = {
  team: {
    mode: TeamMode;
    n: number;
    leaveOut: boolean;
    teamNames: string[];
    r: number[][];
    out: number | null;
  };
};

function loadStored(): StoredTeam | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTeam;
    if (!Array.isArray(parsed.choices)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStored(payload: StoredTeam): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

type Props = {
  initialPresetQuery?: string | null;
};

export function TeamGenerator({ initialPresetQuery = null }: Props) {
  const [text, setText] = useState(() => TEAM_SAMPLE_NAMES.join("\n"));
  const [mode, setMode] = useState<TeamMode>("groups");
  const [n, setN] = useState(2);
  const [leaveOut, setLeaveOut] = useState(false);
  const [teamNamesText, setTeamNamesText] = useState("");
  const [showTeamNames, setShowTeamNames] = useState(false);
  const [result, setResult] = useState<TeamResult | null>(null);
  const [sharedMode, setSharedMode] = useState(false);
  const [toast, setToast] = useState("");
  const [clampNote, setClampNote] = useState("");
  const [ready, setReady] = useState(false);
  const [themeChoice, setThemeChoice] = useState<ToolThemeId>("auto");
  const [confettiFire, setConfettiFire] = useState(0);
  const sound = useSound();
  const allowSaveRef = useRef(true);
  const toastTimer = useRef(0);
  const resolvedTheme = resolveToolTheme(themeChoice, TOOL_ID);

  const parsed = useMemo(() => parseTeamNames(text), [text]);
  const names = parsed.names;
  const teamNames = useMemo(
    () =>
      teamNamesText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [teamNamesText],
  );

  const settings: TeamSettings = useMemo(
    () => ({ mode, n, leaveOut, teamNames }),
    [mode, n, leaveOut, teamNames],
  );

  const showLeaveOut = mode === "size" && n === 2 && names.length % 2 === 1;
  const canGenerate = names.length >= 2;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }, []);

  const applyClampStatus = useCallback(
    (nameCount: number, nextMode: TeamMode, nextN: number) => {
      if (nextMode === "groups" && nextN > MAX_TEAMS) {
        setClampNote("The most teams you can make is 50.");
      } else if (nextMode === "groups" && nextN > nameCount && nameCount >= 2) {
        setClampNote(
          `You have ${nameCount} names, so the most you can make is ${nameCount} teams.`,
        );
      } else {
        setClampNote("");
      }
    },
    [],
  );

  const effectiveN = useMemo(
    () => clampTeamN(mode, n, names.length),
    [mode, n, names.length],
  );
  useEffect(() => {
    applyClampStatus(names.length, mode, n);
  }, [names.length, mode, n, applyClampStatus]);

  useEffect(() => {
    const fromHash = readShareFromLocation();
    const stored = loadStored();
    const wantPairs = initialPresetQuery === "pairs";

    if (fromHash && fromHash.choices.length >= 1) {
      setText(fromHash.choices.join("\n"));
      const team = fromHash.extra.team as ShareTeamExtra["team"] | undefined;
      if (team && typeof team === "object") {
        setMode(team.mode === "size" ? "size" : "groups");
        setN(typeof team.n === "number" ? team.n : 2);
        setLeaveOut(Boolean(team.leaveOut));
        setTeamNamesText(Array.isArray(team.teamNames) ? team.teamNames.join("\n") : "");
        if (Array.isArray(team.r) && team.r.length > 0) {
          setResult(
            teamsFromIndices(
              fromHash.choices,
              team.r,
              typeof team.out === "number" ? team.out : null,
              Array.isArray(team.teamNames) ? team.teamNames : [],
            ),
          );
        }
      }
      setSharedMode(true);
      allowSaveRef.current = false;
      track("share_open", { toolId: TOOL_ID, via: "hash" });
    } else if (stored && stored.choices.length >= 1) {
      setText(stored.choices.join("\n"));
      if (stored.team) {
        setMode(stored.team.mode === "size" ? "size" : "groups");
        setN(stored.team.n || 2);
        setLeaveOut(Boolean(stored.team.leaveOut));
        setTeamNamesText((stored.team.teamNames || []).join("\n"));
      }
      track("return_visit", { toolId: TOOL_ID });
    }

    if (wantPairs && !(fromHash && fromHash.choices.length >= 1)) {
      setMode("size");
      setN(2);
      track("preset_load", { toolId: TOOL_ID, preset: "pairs" });
    }

    setThemeChoice(loadToolTheme(TOOL_ID));
    setReady(true);
  }, [initialPresetQuery]);

  useEffect(() => {
    if (!ready || !allowSaveRef.current || sharedMode) return;
    saveStored({
      choices: names,
      updatedAt: Date.now(),
      team: { mode, n: effectiveN, leaveOut, teamNames },
    });
  }, [ready, sharedMode, names, mode, effectiveN, leaveOut, teamNames]);

  const runGenerate = () => {
    if (!canGenerate) return;
    sound.unlock();
    const nextSettings: TeamSettings = {
      mode,
      n: effectiveN,
      leaveOut: showLeaveOut ? leaveOut : false,
      teamNames,
    };
    const next = generateTeams(names, nextSettings);
    setResult(next);
    sound.chime();
    setConfettiFire((n) => n + 1);
    track("spin", {
      toolId: TOOL_ID,
      choiceCount: names.length,
      teamCount: next.teams.length,
    });
  };

  const onCopyTeams = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatTeamsPlain(result.teams, result.sitsOut));
      showToast("Teams copied.");
    } catch {
      showToast("Could not copy — check browser permissions.");
    }
  };

  const onShare = async () => {
    if (!result) return;
    try {
      const extra: ShareTeamExtra = {
        team: {
          mode,
          n: effectiveN,
          leaveOut: showLeaveOut ? leaveOut : false,
          teamNames,
          r: result.memberIndices,
          out: result.sitsOutIndex,
        },
      };
      const hash = encodeShareHash(names, TOOL_ID, extra);
      const url = `${window.location.origin}/random-team-generator${hash}`;
      await navigator.clipboard.writeText(url);
      track("share_create", { toolId: TOOL_ID });
      showToast("Share link copied.");
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "LIST_TOO_LONG"
          ? "List too long to share via URL."
          : "Could not copy share link.";
      showToast(msg);
    }
  };

  const keepShared = () => {
    allowSaveRef.current = true;
    saveStored({
      choices: names,
      updatedAt: Date.now(),
      team: { mode, n: effectiveN, leaveOut, teamNames },
    });
    setSharedMode(false);
    showToast("Kept on this device.");
  };

  const dismissShared = () => {
    const stored = loadStored();
    setText((stored?.choices?.length ? stored.choices : [...TEAM_SAMPLE_NAMES]).join("\n"));
    if (stored?.team) {
      setMode(stored.team.mode === "size" ? "size" : "groups");
      setN(stored.team.n || 2);
      setLeaveOut(Boolean(stored.team.leaveOut));
      setTeamNamesText((stored.team.teamNames || []).join("\n"));
    } else {
      setMode("groups");
      setN(2);
      setLeaveOut(false);
      setTeamNamesText("");
    }
    setResult(null);
    allowSaveRef.current = true;
    setSharedMode(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/random-team-generator");
    }
  };

  const statusMessage = !canGenerate
    ? "Add at least 2 names."
    : clampNote ||
      (result ? result.status : "Ready — press Generate teams.");

  const dupeNotice =
    parsed.duplicateCount > 0
      ? `${parsed.duplicateCount} names appear more than once (${parsed.duplicateLabels.slice(0, 3).join(", ")}${parsed.duplicateLabels.length > 3 ? "…" : ""}). Add an initial to tell them apart.`
      : null;

  return (
    <div className="team-generator" data-tool-theme={resolvedTheme}>
      {sharedMode ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-surface-2 px-3 py-2.5 text-sm print:hidden">
          <p className="flex-1 text-muted">
            Shared teams — not saved on this device until you keep them.
          </p>
          <button
            type="button"
            onClick={keepShared}
            className="min-h-11 rounded-lg bg-accent-strong px-3 py-2 text-xs font-semibold text-slate-950"
          >
            Save to this device
          </button>
          <button
            type="button"
            onClick={dismissShared}
            className="min-h-11 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 print:hidden">
          <div>
            <h2 className="text-base font-bold text-foreground">Names</h2>
            <p className="mt-0.5 text-xs text-muted">
              One name per line, up to 200. Empty lines ignored. Duplicates are kept but flagged.
            </p>
          </div>
          <label className="sr-only" htmlFor="team-names">
            Names list
          </label>
          <textarea
            id="team-names"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
              track("entries_edited", { toolId: TOOL_ID });
            }}
            rows={12}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm leading-relaxed text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full bg-surface-2 px-2.5 py-1 font-bold text-foreground">
              {names.length} {names.length === 1 ? "name" : "names"}
            </span>
            {parsed.overLimit > 0 ? (
              <span className="font-medium text-amber-300" role="status">
                Only the first 200 names are used.
              </span>
            ) : null}
          </div>
          {dupeNotice ? (
            <p className="text-xs font-medium text-amber-300" role="status">
              {dupeNotice}
            </p>
          ) : null}

          <div>
            <p className="text-sm font-semibold text-foreground">How to split</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Split mode">
              <SegBtn
                active={mode === "groups"}
                onClick={() => {
                  setMode("groups");
                  setN((v) => Math.max(2, v));
                  setResult(null);
                }}
                label="Number of teams"
              />
              <SegBtn
                active={mode === "size"}
                onClick={() => {
                  setMode("size");
                  setResult(null);
                }}
                label="People per team"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">
                {mode === "groups" ? "Teams" : "People per team"}
              </span>
              <input
                type="number"
                min={mode === "groups" ? 2 : 1}
                max={mode === "groups" ? MAX_TEAMS : MAX_PER_TEAM}
                value={n}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const v = Number.isFinite(raw) ? raw : mode === "groups" ? 2 : 1;
                  setN(v);
                  setResult(null);
                }}
                onBlur={() => {
                  const clamped = clampTeamN(mode, n, Math.max(names.length, 2));
                  if (clamped !== n) setN(clamped);
                }}
                className="min-h-12 w-24 rounded-lg border border-border bg-surface-2 px-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="2 teams"
                onClick={() => {
                  setMode("groups");
                  setN(2);
                  setResult(null);
                }}
              />
              <Chip
                label="3 teams"
                onClick={() => {
                  setMode("groups");
                  setN(3);
                  setResult(null);
                }}
              />
              <Chip
                label="4 teams"
                onClick={() => {
                  setMode("groups");
                  setN(4);
                  setResult(null);
                }}
              />
              <Chip
                label="Pairs"
                onClick={() => {
                  setMode("size");
                  setN(2);
                  setResult(null);
                }}
              />
            </div>
          </div>

          {showLeaveOut ? (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={leaveOut}
                onChange={(e) => {
                  setLeaveOut(e.target.checked);
                  setResult(null);
                }}
                className="h-4 w-4 accent-cyan-500"
              />
              Leave one person out
            </label>
          ) : null}

          <div>
            <button
              type="button"
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-accent hover:underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setShowTeamNames((v) => !v)}
            >
              {showTeamNames ? "Hide team names" : "Optional team names"}
            </button>
            {showTeamNames ? (
              <textarea
                value={teamNamesText}
                onChange={(e) => {
                  setTeamNamesText(e.target.value);
                  setResult(null);
                }}
                rows={3}
                placeholder={"Team Red\nTeam Blue"}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            ) : null}
          </div>

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

          <div className="sticky bottom-0 z-30 -mx-1 border-t border-border bg-surface/95 px-1 py-2 backdrop-blur print:hidden sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={runGenerate}
              className="min-h-12 w-full rounded-xl bg-accent-strong px-4 py-3 text-base font-bold text-slate-950 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {result ? "Reshuffle" : "Generate teams"}
            </button>
          </div>

          <p className="text-sm text-muted" aria-live="polite" role="status">
            {statusMessage}
          </p>

          <p className="text-xs text-muted">
            Your list is saved in this browser. Share links carry the list inside the link, so anyone
            with the link can see it.{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="team-results min-h-[280px] print:col-span-full">
          {result && result.teams.length > 0 ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2 print:hidden">
                <ActionBtn label="Copy teams" onClick={() => void onCopyTeams()} />
                <ActionBtn label="Copy share link" onClick={() => void onShare()} />
                <ActionBtn label="Print" onClick={() => window.print()} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
                {result.teams.map((team, ti) => {
                  const funIdx = FUN_TEAMS.findIndex((t) => t.name === team.name);
                  const band =
                    funIdx >= 0 ? funTeamColor(funIdx) : segColor(resolvedTheme, ti);
                  const ink = labelInkForBg(band);
                  return (
                    <article
                      key={`${team.name}-${ti}`}
                      className="et-team-card overflow-hidden rounded-2xl border border-border bg-surface"
                      style={{ animationDelay: `${Math.min(ti * 60, 360)}ms` }}
                    >
                      <header
                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold"
                        style={{ background: band, color: ink }}
                      >
                        <span className="min-w-0 truncate">{team.name}</span>
                        <span className="shrink-0 rounded-full bg-black/20 px-2 py-0.5 text-xs">
                          {team.members.length}
                        </span>
                      </header>
                      <ul className="space-y-1 px-4 py-3 text-sm text-foreground">
                        {team.members.map((m, i) => (
                          <li key={`${m}-${i}`}>• {m}</li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
              {result.sitsOut ? (
                <p className="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
                  Sits out: <strong>{result.sitsOut}</strong>
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-muted print:hidden">
              Press Generate teams to see your groups here.
            </div>
          )}
        </div>
      </div>

      {toast ? (
        <p
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-accent-strong px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg print:hidden"
          role="status"
        >
          {toast}
        </p>
      ) : null}

      <ToolConfetti
        fire={confettiFire}
        colors={Array.from({ length: 6 }, (_, i) => segColor(resolvedTheme, i))}
      />
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active
          ? "bg-accent-strong text-slate-950"
          : "border border-border bg-surface-2 text-foreground hover:border-accent"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {label}
    </button>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {label}
    </button>
  );
}
