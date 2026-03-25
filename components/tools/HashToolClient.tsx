"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LuCopy, LuCopyCheck, LuTrash2 } from "react-icons/lu";
import type { DevHashAlgorithm, TransformToolUi } from "@/lib/content/textToolPageTypes";
import { md5Hex } from "@/lib/cryptoMd5";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  algorithm: DevHashAlgorithm;
  ui: TransformToolUi;
};

async function digestWebCrypto(algorithm: "SHA-1" | "SHA-256", text: string) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algorithm, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function HashToolClient({ algorithm, ui }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<null | "in" | "out">(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!input) {
        setOutput("");
        return;
      }
      try {
        if (algorithm === "md5") {
          if (!cancelled) setOutput(md5Hex(input));
          return;
        }
        const hex = await digestWebCrypto(algorithm === "sha1" ? "SHA-1" : "SHA-256", input);
        if (!cancelled) setOutput(hex);
      } catch {
        if (!cancelled) setOutput("Hash error — try shorter input or a different browser.");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [input, algorithm]);

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
    setOutput("");
    setCopiedTarget(null);
  }, []);

  const algoLabel = useMemo(() => algorithm.toUpperCase(), [algorithm]);

  return (
    <ToolLayout
      input={
        <ToolInput
          label="Text to hash"
          helperText={`${algoLabel} digest updates as you type (client-side).`}
          placeholder={ui.textareaPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
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
