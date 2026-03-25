"use client";

import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolResult } from "@/components/tools/ToolResult";
import type { CompareToolPageContent } from "@/lib/content/textToolPageTypes";

type Props = {
  slug: string;
  ui: CompareToolPageContent["ui"];
};

export function CompareToolClient({ slug, ui }: Props) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const result = useMemo(() => {
    if (slug === "text-similarity-checker") {
      return similarityResult(left, right);
    }
    return diffResult(left, right);
  }, [left, right, slug]);

  return (
    <ToolLayout
      input={
        <div className="grid grid-cols-1 gap-4">
          <ToolInput
            label="Text A"
            placeholder={ui.leftPlaceholder}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
          />
          <ToolInput
            label="Text B"
            placeholder={ui.rightPlaceholder}
            value={right}
            onChange={(e) => setRight(e.target.value)}
          />
        </div>
      }
      result={<ToolResult label={ui.resultHeading} emptyHint="Result appears here.">{result}</ToolResult>}
    />
  );
}

function diffResult(a: string, b: string): string {
  if (!a && !b) return "";
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const max = Math.max(aLines.length, bLines.length);
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    const l = aLines[i] ?? "";
    const r = bLines[i] ?? "";
    if (l !== r) {
      out.push(`Line ${i + 1}`);
      out.push(`- ${l}`);
      out.push(`+ ${r}`);
      out.push("");
    }
  }
  return out.length ? out.join("\n") : "No differences found.";
}

function similarityResult(a: string, b: string): string {
  if (!a && !b) return "";
  const aTokens = new Set(a.toLowerCase().match(/\b[\w']+\b/g) ?? []);
  const bTokens = new Set(b.toLowerCase().match(/\b[\w']+\b/g) ?? []);
  const union = new Set([...aTokens, ...bTokens]);
  let inter = 0;
  union.forEach((t) => {
    if (aTokens.has(t) && bTokens.has(t)) inter++;
  });
  const score = union.size ? (inter / union.size) * 100 : 100;
  return `Similarity score: ${score.toFixed(2)}%\nShared terms: ${inter}\nUnique terms: ${union.size}`;
}

