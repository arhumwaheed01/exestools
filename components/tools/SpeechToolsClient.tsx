"use client";

import { useMemo, useState } from "react";
import type { SpeechToolPageContent } from "@/lib/content/textToolPageTypes";
import { ToolInput } from "@/components/tools/ToolInput";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  kind: SpeechToolPageContent["kind"];
  ui: SpeechToolPageContent["ui"];
};

export function SpeechToolsClient({ kind, ui }: Props) {
  const [text, setText] = useState("");
  const [transcript, setTranscript] = useState("");
  const status = useMemo(
    () => (kind === "speech-tts" ? "Ready to speak" : "Ready to listen"),
    [kind],
  );

  const speak = () => {
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const startListening = () => {
    const Ctor = (
      window as Window & {
        SpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
          start: () => void;
        };
        webkitSpeechRecognition?: new () => {
          lang: string;
          interimResults: boolean;
          onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
          start: () => void;
        };
      }
    ).SpeechRecognition
      ?? (
        window as Window & {
          webkitSpeechRecognition?: new () => {
            lang: string;
            interimResults: boolean;
            onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
            start: () => void;
          };
        }
      ).webkitSpeechRecognition;
    if (!Ctor) {
      setTranscript("Speech recognition is not supported in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const val = e.results?.[0]?.[0]?.transcript ?? "";
      setTranscript(val);
    };
    rec.start();
  };

  return (
    <ToolLayout
      input={
        <div className="space-y-3">
          <ToolInput
            label={kind === "speech-tts" ? "Text to speak" : "Manual text (optional)"}
            placeholder={ui.textareaPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {kind === "speech-tts" ? (
            <button type="button" className="btn" onClick={speak}>
              Speak text
            </button>
          ) : (
            <button type="button" className="btn" onClick={startListening}>
              Start speech capture
            </button>
          )}
          <p className="text-xs text-secondary-text/75">{status}</p>
        </div>
      }
      result={
        <ToolResult
          label={kind === "speech-tts" ? "Speech status" : "Transcript"}
          emptyHint={kind === "speech-tts" ? "Use Speak text to hear output." : "Transcript appears here."}
        >
          {kind === "speech-tts" ? text : transcript}
        </ToolResult>
      }
    />
  );
}

