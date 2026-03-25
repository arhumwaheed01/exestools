"use client";

import { useCallback, useMemo, useState } from "react";
import { LuCopy, LuCopyCheck, LuTrash2 } from "react-icons/lu";
import type { TextReverseMode } from "@/lib/textTransforms";
import { reverseText } from "@/lib/textTransforms";
import type { TransformToolUi } from "@/lib/content/textToolPageTypes";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  ui: TransformToolUi;
};

export function TextReverserToolClient({ ui }: Props) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TextReverseMode>("characters");
  const [copiedTarget, setCopiedTarget] = useState<null | "in" | "out">(null);

  const output = useMemo(
    () => reverseText(input, mode),
    [input, mode],
  );

  const flashCopied = useCallback((target: "in" | "out") => {
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 2000);
  }, []);

  const handleCopyIn = useCallback(async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      flashCopied("in");
    } catch {
      /* ignore */
    }
  }, [input, flashCopied]);

  const handleCopyOut = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashCopied("out");
    } catch {
      /* ignore */
    }
  }, [output, flashCopied]);

  const handleClear = useCallback(() => {
    setInput("");
    setCopiedTarget(null);
  }, []);

  const charLabel = ui.reverseModeCharacters ?? "Characters";
  const lineLabel = ui.reverseModeLines ?? "Lines";

  return (
    <ToolLayout
      input={
        <ToolInput
          label="Input"
          helperText="Choose a reverse mode, then edit text to see instant output."
          placeholder={ui.textareaPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          aria-label={ui.textareaPlaceholder}
        />
      }
      result={
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <fieldset className="min-w-0 rounded-xl border border-input-border/80 bg-surface/60 p-3">
            <legend className="sr-only">Reverse mode</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode("characters")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === "characters"
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-background text-secondary-text ring-1 ring-input-border hover:ring-primary/40"
                }`}
                aria-pressed={mode === "characters"}
              >
                {charLabel}
              </button>
              <button
                type="button"
                onClick={() => setMode("lines")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  mode === "lines"
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-background text-secondary-text ring-1 ring-input-border hover:ring-primary/40"
                }`}
                aria-pressed={mode === "lines"}
              >
                {lineLabel}
              </button>
            </div>
          </fieldset>
          <ToolResult
            label={ui.outputHeading}
            emptyHint={ui.outputEmptyHint}
            className="min-h-0 flex-1"
          >
            {output}
          </ToolResult>
        </div>
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
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium leading-relaxed text-secondary-text transition-all duration-200 hover:border-primary/40 hover:bg-surface hover:text-primary disabled:pointer-events-none disabled:opacity-45"
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
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium leading-relaxed text-secondary-text transition-all duration-200 hover:border-primary/40 hover:bg-surface hover:text-primary"
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
