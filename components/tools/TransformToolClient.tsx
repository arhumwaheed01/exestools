"use client";

import { useCallback, useMemo, useState } from "react";
import { LuCopy, LuCopyCheck, LuTrash2 } from "react-icons/lu";
import type { TransformToolUi } from "@/lib/content/textToolPageTypes";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  ui: TransformToolUi;
  inputLabel?: string;
  compute: (value: string) => string;
};

export function TransformToolClient({
  ui,
  inputLabel = "Input",
  compute,
}: Props) {
  const [input, setInput] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<null | "in" | "out">(null);

  const output = useMemo(() => compute(input), [input, compute]);

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
      setCopiedTarget(null);
    }
  }, [input, flashCopied]);

  const handleCopyOut = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashCopied("out");
    } catch {
      setCopiedTarget(null);
    }
  }, [output, flashCopied]);

  const handleClear = useCallback(() => {
    setInput("");
    setCopiedTarget(null);
  }, []);

  return (
    <ToolLayout
      input={
        <ToolInput
          label={inputLabel}
          helperText="Friendly tip: paste real text to see live output."
          placeholder={ui.textareaPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck
          aria-label={ui.textareaPlaceholder}
        />
      }
      result={
        <ToolResult
          label={ui.outputHeading}
          emptyHint={ui.outputEmptyHint}
        >
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
