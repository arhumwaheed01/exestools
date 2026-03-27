"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuCopy, LuCopyCheck, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import type { DevSpecialVariant, TransformToolUi } from "@/lib/content/textToolPageTypes";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  variant: DevSpecialVariant;
  ui: TransformToolUi;
};

function b64UrlToUtf8(seg: string): string {
  let s = seg.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): string {
  const parts = token.trim().split(".").filter(Boolean);
  if (parts.length < 2) {
    return "Paste a JWT with at least header and payload segments.";
  }
  try {
    const header = JSON.parse(b64UrlToUtf8(parts[0]!));
    const payload = JSON.parse(b64UrlToUtf8(parts[1]!));
    return `Header\n${JSON.stringify(header, null, 2)}\n\nPayload\n${JSON.stringify(payload, null, 2)}\n\nSignature (not verified)\n${parts[2] ?? "(none)"}`;
  } catch (e) {
    return `Could not decode JWT segments: ${e instanceof Error ? e.message : String(e)}`;
  }
}

function parseHeaders(raw: string): string {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "Paste raw HTTP headers (one Name: value per line).";
  const rows: string[] = [];
  for (const line of lines) {
    const i = line.indexOf(":");
    if (i === -1) rows.push(`(no colon) ${line}`);
    else rows.push(`${line.slice(0, i).trim()}: ${line.slice(i + 1).trim()}`);
  }
  return rows.join("\n");
}

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

function lookupIp(raw: string): string {
  const ip = raw.trim();
  if (!ip) return "Enter an IPv4 address like 203.0.113.10";
  if (!IPV4.test(ip)) return "This checker validates dotted IPv4 notation only (ex. 192.0.2.5).";
  const [a, b] = ip.split(".").map(Number);
  if (a === 10) return `${ip}: private range (RFC 1918 10.0.0.0/8).`;
  if (a === 172 && b !== undefined && b >= 16 && b <= 31) return `${ip}: private range (RFC 1918 172.16.0.0/12).`;
  if (a === 192 && b === 168) return `${ip}: private range (RFC 1918 192.168.0.0/16).`;
  if (a === 127) return `${ip}: loopback (127.0.0.0/8).`;
  return `${ip}: format OK (public/private classification is heuristic; no geolocation lookup).`;
}

function parseUa(ua: string): string {
  const t = ua.trim();
  if (!t) return "Paste a User-Agent string.";
  const parts: string[] = [];
  if (/Edg\//i.test(t)) parts.push("Browser family: likely Microsoft Edge (Chromium).");
  else if (/Chrome\//i.test(t) && !/Chromium/i.test(t)) parts.push("Browser family: likely Chrome (heuristic).");
  else if (/Safari/i.test(t) && !/Chrome/i.test(t)) parts.push("Browser family: likely Safari.");
  else if (/Firefox\//i.test(t)) parts.push("Browser family: likely Firefox.");
  else parts.push("Browser family: unrecognized. See raw string below.");

  if (/Windows NT/i.test(t)) parts.push("OS hint: Windows.");
  else if (/Mac OS X|macOS/i.test(t)) parts.push("OS hint: macOS.");
  else if (/Linux/i.test(t)) parts.push("OS hint: Linux.");
  else if (/Android/i.test(t)) parts.push("OS hint: Android.");
  else if (/iPhone|iPad|iOS/i.test(t)) parts.push("OS hint: iOS / iPadOS.");

  if (/Mobile/i.test(t)) parts.push("Device: mobile token present.");
  return `${parts.join("\n")}\n\nRaw\n${t}`;
}

function convertTimestamp(raw: string): string {
  const t = raw.trim();
  if (!t) {
    const now = Date.now();
    return `Current time\nUnix (ms): ${now}\nUnix (s): ${Math.floor(now / 1000)}\nISO UTC: ${new Date(now).toISOString()}`;
  }
  if (/^\d+$/.test(t)) {
    const n = Number(t);
    const ms = t.length <= 10 ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "Invalid numeric timestamp.";
    return `Parsed\nISO UTC: ${d.toISOString()}\nLocal: ${d.toString()}\nUnix (s): ${Math.floor(ms / 1000)}\nUnix (ms): ${ms}`;
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "Could not parse. Try ISO date text or Unix seconds/milliseconds.";
  return `Parsed\nISO UTC: ${d.toISOString()}\nLocal: ${d.toString()}\nUnix (s): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}`;
}

function genPassword(len: number, upper: boolean, lower: boolean, num: boolean, sym: boolean): string {
  let chars = "";
  if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (num) chars += "0123456789";
  if (sym) chars += "!@#$%^&*-_+=?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";
  const out = new Uint32Array(Math.max(4, len));
  crypto.getRandomValues(out);
  let s = "";
  for (let i = 0; i < len; i++) s += chars[out[i]! % chars.length]!;
  return s;
}

function describeCron(expr: string): string {
  const p = expr.trim().split(/\s+/).filter(Boolean);
  if (p.length !== 5) {
    return "Use five fields: minute hour day-of-month month day-of-week (some engines differ; verify in your environment).";
  }
  return `Expression\n${p.join(" ")}\n\nFields\nminute: ${p[0]}\nhour: ${p[1]}\nday of month: ${p[2]}\nmonth: ${p[3]}\nday of week: ${p[4]}`;
}

const CRON_PRESETS: { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Hourly :00", value: "0 * * * *" },
  { label: "Daily 00:00", value: "0 0 * * *" },
  { label: "Weekly Sun 00:00", value: "0 0 * * 0" },
  { label: "Monthly 1st 00:00", value: "0 0 1 * *" },
];

export function DevSpecialToolClient({ variant, ui }: Props) {
  const [input, setInput] = useState(() => (variant === "cron" ? "0 0 * * *" : ""));
  const [copiedTarget, setCopiedTarget] = useState<null | "in" | "out">(null);

  const [pwLen, setPwLen] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNum, setPwNum] = useState(true);
  const [pwSym, setPwSym] = useState(true);
  const [pwOut, setPwOut] = useState("");

  const [uuidOut, setUuidOut] = useState("");

  const regenUuid = useCallback(() => {
    try {
      setUuidOut(crypto.randomUUID());
    } catch {
      setUuidOut("UUID not supported in this context.");
    }
  }, []);

  const regenPw = useCallback(() => {
    setPwOut(genPassword(pwLen, pwUpper, pwLower, pwNum, pwSym));
  }, [pwLen, pwUpper, pwLower, pwNum, pwSym]);

  useEffect(() => {
    if (variant === "uuid") regenUuid();
  }, [variant, regenUuid]);

  useEffect(() => {
    if (variant === "password") regenPw();
  }, [variant, regenPw]);

  const output = useMemo(() => {
    switch (variant) {
      case "jwt":
        return input.trim() ? decodeJwt(input) : "";
      case "headers":
        return parseHeaders(input);
      case "ip":
        return input.trim() ? lookupIp(input) : "";
      case "ua":
        return input.trim() ? parseUa(input) : "";
      case "timestamp":
        return convertTimestamp(input);
      case "cron":
        return input.trim() ? describeCron(input) : "";
      case "password":
        return pwOut;
      case "uuid":
        return uuidOut;
      default:
        return "";
    }
  }, [variant, input, pwOut, uuidOut]);

  const flashCopied = useCallback((target: "in" | "out") => {
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 2000);
  }, []);

  const handleCopyOut = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashCopied("out");
    } catch {
      setCopiedTarget(null);
    }
  }, [output, flashCopied]);

  const handleCopyIn = useCallback(async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      flashCopied("in");
    } catch {
      setCopiedTarget(null);
    }
  }, [input, flashCopied]);

  const handleClear = useCallback(() => {
    setInput("");
    setCopiedTarget(null);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  if (variant === "password") {
    return (
      <ToolLayout
        input={
          <div className="flex flex-col gap-4 rounded-xl border border-input-border/90 bg-background p-4 md:p-5">
            <p className="text-sm font-semibold text-secondary-text">Options</p>
            <label className="flex flex-col gap-1 text-sm text-secondary-text">
              Length
              <input
                type="number"
                min={6}
                max={128}
                value={pwLen}
                onChange={(e) => setPwLen(Number(e.target.value) || 6)}
                className="rounded-lg border border-input-border bg-background px-3 py-2"
              />
            </label>
            <div className="flex flex-wrap gap-4 text-sm text-secondary-text">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pwUpper} onChange={(e) => setPwUpper(e.target.checked)} />
                A–Z
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pwLower} onChange={(e) => setPwLower(e.target.checked)} />
                a–z
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pwNum} onChange={(e) => setPwNum(e.target.checked)} />
                0–9
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={pwSym} onChange={(e) => setPwSym(e.target.checked)} />
                Symbols
              </label>
            </div>
            <button type="button" className="btn gap-2 px-4" onClick={regenPw}>
              <LuRefreshCw className="h-4 w-4" aria-hidden />
              Generate new
            </button>
          </div>
        }
        result={
          <ToolResult label={ui.outputHeading} emptyHint="Password appears here.">
            {pwOut}
          </ToolResult>
        }
        actions={
          <>
            <button
              type="button"
              className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
              onClick={handleCopyOut}
              disabled={!pwOut}
            >
              {copiedTarget === "out" ? (
                <>
                  <LuCopyCheck className="h-5 w-5" aria-hidden />
                  {ui.copySuccess}
                </>
              ) : (
                <>
                  <LuCopy className="h-5 w-5" aria-hidden />
                  {ui.copyOutput}
                </>
              )}
            </button>
          </>
        }
      />
    );
  }

  if (variant === "uuid") {
    return (
      <ToolLayout
        input={
          <div className="flex flex-col gap-4 rounded-xl border border-input-border/90 bg-background p-4 md:p-5">
            <p className="text-sm leading-relaxed text-secondary-text">
              RFC 4122 version 4 identifiers use random bytes from <code className="text-primary">crypto.getRandomValues</code> when
              available.
            </p>
            <button type="button" className="btn gap-2 px-4" onClick={regenUuid}>
              <LuRefreshCw className="h-4 w-4" aria-hidden />
              Generate new UUID
            </button>
          </div>
        }
        result={
          <ToolResult label={ui.outputHeading} emptyHint="UUID appears here.">
            {uuidOut}
          </ToolResult>
        }
        actions={
          <button
            type="button"
            className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
            onClick={handleCopyOut}
            disabled={!uuidOut}
          >
            {copiedTarget === "out" ? (
              <>
                <LuCopyCheck className="h-5 w-5" aria-hidden />
                {ui.copySuccess}
              </>
            ) : (
              <>
                <LuCopy className="h-5 w-5" aria-hidden />
                {ui.copyOutput}
              </>
            )}
          </button>
        }
      />
    );
  }

  if (variant === "cron") {
    return (
      <ToolLayout
        input={
          <div className="flex flex-col gap-4">
            <ToolInput
              label="Cron expression"
              as="input"
              helperText="Standard five-field cron. Adjust or pick a preset."
              placeholder="0 0 * * *"
              value={input}
              onChange={handleInputChange}
              spellCheck={false}
              aria-label="Cron expression"
            />
            <div className="flex flex-wrap gap-2">
              {CRON_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="rounded-lg border border-input-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary/50"
                  onClick={() => setInput(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        }
        result={
          <ToolResult label={ui.outputHeading} emptyHint={ui.outputEmptyHint}>
            {output}
          </ToolResult>
        }
        actions={
          <>
            <button
              type="button"
              className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
              onClick={handleCopyOut}
              disabled={!output}
            >
              {copiedTarget === "out" ? (
                <>
                  <LuCopyCheck className="h-5 w-5" aria-hidden />
                  {ui.copySuccess}
                </>
              ) : (
                <>
                  <LuCopy className="h-5 w-5" aria-hidden />
                  {ui.copyOutput}
                </>
              )}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface"
              onClick={handleClear}
            >
              <LuTrash2 className="h-5 w-5" aria-hidden />
              {ui.clearButton}
            </button>
          </>
        }
      />
    );
  }

  const inputLabel =
    variant === "jwt"
      ? "JWT string"
      : variant === "headers"
        ? "Raw headers"
        : variant === "ip"
          ? "IPv4 address"
          : variant === "ua"
            ? "User-Agent"
            : variant === "timestamp"
              ? "Timestamp or date"
              : "Input";

  return (
    <ToolLayout
      input={
        <ToolInput
          label={inputLabel}
          as={variant === "ip" || variant === "timestamp" ? "input" : "textarea"}
          helperText={
            variant === "timestamp"
              ? "Leave empty for “now”, or type Unix seconds/ms or a date string."
              : "Paste content to analyze. Processing stays in this tab."
          }
          placeholder={ui.textareaPlaceholder}
          value={input}
          onChange={handleInputChange}
          spellCheck={variant === "ua" || variant === "headers"}
          aria-label={ui.textareaPlaceholder}
        />
      }
      result={
        <ToolResult label={ui.outputHeading} emptyHint={ui.outputEmptyHint}>
          {output}
        </ToolResult>
      }
      actions={
        <>
          <button
            type="button"
            className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
            onClick={handleCopyOut}
            disabled={!output}
          >
            {copiedTarget === "out" ? (
              <>
                <LuCopyCheck className="h-5 w-5" aria-hidden />
                {ui.copySuccess}
              </>
            ) : (
              <>
                <LuCopy className="h-5 w-5" aria-hidden />
                {ui.copyOutput}
              </>
            )}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface disabled:pointer-events-none disabled:opacity-45"
            onClick={handleCopyIn}
            disabled={!input}
          >
            {copiedTarget === "in" ? (
              <>
                <LuCopyCheck className="h-5 w-5" aria-hidden />
                {ui.copySuccess}
              </>
            ) : (
              <>
                <LuCopy className="h-5 w-5" aria-hidden />
                {ui.copyInput}
              </>
            )}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface"
            onClick={handleClear}
          >
            <LuTrash2 className="h-5 w-5" aria-hidden />
            {ui.clearButton}
          </button>
        </>
      }
    />
  );
}
