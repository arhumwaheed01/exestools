"use client";

import type { PdfToolVariant, TransformToolUi } from "@/lib/content/textToolPageTypes";
import { PdfEditorWorkspace } from "@/components/tools/PdfEditorWorkspace";
import { PdfToolsSimpleClient } from "@/components/tools/PdfToolsSimpleClient";

type Props = {
  variant: PdfToolVariant;
  ui: TransformToolUi;
};

export function PdfToolClient({ variant, ui }: Props) {
  if (variant === "pdf-editor-free") {
    return <PdfEditorWorkspace />;
  }
  return <PdfToolsSimpleClient variant={variant} ui={ui} />;
}
