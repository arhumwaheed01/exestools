"use client";

import { useMemo, useState } from "react";
import type { FindReplaceToolPageContent } from "@/lib/content/textToolPageTypes";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = { ui: FindReplaceToolPageContent["ui"] };

export function FindReplaceToolClient({ ui }: Props) {
  const [text, setText] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const output = useMemo(() => {
    if (!findText) return text;
    return text.split(findText).join(replaceText);
  }, [text, findText, replaceText]);

  return (
    <ToolLayout
      input={
        <div className="space-y-4">
          <ToolInput
            label="Input text"
            placeholder={ui.textareaPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="input"
              placeholder={ui.findPlaceholder}
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              aria-label={ui.findPlaceholder}
            />
            <input
              className="input"
              placeholder={ui.replacePlaceholder}
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              aria-label={ui.replacePlaceholder}
            />
          </div>
        </div>
      }
      result={
        <ToolResult label={ui.outputHeading} emptyHint="Updated text appears here.">
          {output}
        </ToolResult>
      }
    />
  );
}

