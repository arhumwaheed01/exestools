"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CardGrid } from "@/components/bingo/CardGrid";
import {
  BINGO_LETTERS,
  columnRange,
  type BingoMode,
  type Card,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";
import type { ThemeId } from "@/lib/bingo/themes";
import type { PrintInk } from "@/lib/bingo/storage";

const PRINT_ROOT_ID = "bingo-print-root";

function ensurePrintRoot(): HTMLElement {
  let root = document.getElementById(PRINT_ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = PRINT_ROOT_ID;
    root.setAttribute("class", "hidden print:block");
    document.body.appendChild(root);
  }
  return root;
}

function CallSheet({
  mode,
  items,
  title,
  theme,
  mono,
}: {
  mode: BingoMode;
  items: string[];
  title: string;
  theme: ThemeId;
  mono: boolean;
}) {
  return (
    <div
      className={`bingo-sheet bingo-card ${mono ? "bingo-print-mono" : ""}`}
      data-theme={theme}
      style={{ breakAfter: "page", padding: "4mm" }}
    >
      <div className="bc-band rounded-t-[4mm] bg-[var(--bc-band)] px-4 py-3 text-center text-[var(--bc-band-ink)]">
        <p className="text-[14pt] font-extrabold">{title} — call sheet</p>
      </div>
      {mode === "bingo75" ? (
        <div style={{ display: "grid", gap: "3mm", marginTop: "4mm" }}>
          {BINGO_LETTERS.map((letter, col) => {
            const [lo, hi] = columnRange(col);
            return (
              <div key={letter}>
                <div style={{ fontWeight: 700, marginBottom: "1mm", color: "#000" }}>{letter}</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                    gap: "1mm",
                    fontSize: "9pt",
                    color: "#000",
                  }}
                >
                  {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => (
                    <div
                      key={n}
                      style={{
                        border: "1px solid #000",
                        textAlign: "center",
                        padding: "1mm",
                      }}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ol
          style={{
            columns: 3,
            fontSize: "10pt",
            margin: "4mm 0 0",
            paddingLeft: "5mm",
            color: "#000",
          }}
        >
          {items.map((item) => (
            <li key={item} style={{ breakInside: "avoid", marginBottom: "1mm" }}>
              {item}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function PrintSheets({
  cards,
  size,
  mode,
  title,
  subtitle,
  seed,
  paper,
  perPage,
  callSheet,
  callItems,
  theme,
  printInk,
  onDone,
}: {
  cards: Card[];
  size: GridSize;
  mode: BingoMode;
  title: string;
  subtitle: string;
  seed: string;
  paper: "a4" | "letter";
  perPage: 2 | 4;
  callSheet: boolean;
  callItems: string[];
  theme: ThemeId;
  printInk: PrintInk;
  onDone: () => void;
}) {
  const doneRef = useRef(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const mono = printInk === "mono";

  useEffect(() => {
    setRoot(ensurePrintRoot());
  }, []);

  useEffect(() => {
    if (!root) return;
    doneRef.current = false;
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone();
    };

    const styleId = "bingo-page-size";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    const paperSize = paper === "letter" ? "letter" : "A4";
    style.textContent = `
@media print {
  html { color-scheme: light !important; background: #fff !important; }
  @page { size: ${paperSize} portrait; margin: 10mm; }
  body > *:not(#${PRINT_ROOT_ID}) { display: none !important; }
  #${PRINT_ROOT_ID} { display: block !important; }
  .bingo-sheet { break-after: page; display: grid; gap: 6mm; align-content: start; page-break-inside: avoid; }
  .bingo-sheet.per-2 { grid-template-rows: 1fr 1fr; }
  .bingo-sheet.per-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
  .bingo-sheet .bingo-card {
    break-inside: avoid;
    page-break-inside: avoid;
    max-width: none !important;
    width: ${perPage === 2 ? "120mm" : "88mm"};
    margin: 0 auto;
    border-radius: 4mm;
    box-shadow: none !important;
  }
  .bingo-sheet.per-2 .bingo-card {
    max-height: ${paper === "letter" ? "4.9in" : "48vh"};
  }
  .bingo-sheet.per-4 .bingo-card .bc-title { font-size: 14pt !important; }
  .bingo-sheet.per-4 .bingo-card .bc-letter { font-size: 16pt !important; }
  .bingo-sheet.per-4 .bingo-card .bc-cell,
  .bingo-sheet.per-4 .bingo-card .bc-cell-label {
    font-size: 8.5pt !important;
    overflow-wrap: normal !important;
    word-break: keep-all !important;
    hyphens: auto !important;
  }
  .bingo-card .bc-band { display: block !important; }
  .bingo-card .bc-foot { display: block !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

    const after = () => finish();
    window.addEventListener("afterprint", after);
    const t = window.setTimeout(() => {
      window.print();
      finish();
    }, 80);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", after);
    };
  }, [onDone, paper, perPage, root]);

  if (!root) return null;

  const sheets: Card[][] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    sheets.push(cards.slice(i, i + perPage));
  }

  return createPortal(
    <>
      {sheets.map((sheet, si) => (
        <div
          key={si}
          className={`bingo-sheet per-${perPage}${mono ? " bingo-print-mono" : ""}`}
        >
          {sheet.map((card) => (
            <CardGrid
              key={card.number}
              card={card}
              size={size}
              mode={mode}
              title={title}
              subtitle={subtitle}
              seed={seed}
              theme={theme}
              compact
              className={mono ? "bingo-print-mono" : ""}
            />
          ))}
        </div>
      ))}
      {callSheet ? (
        <CallSheet
          mode={mode}
          items={callItems}
          title={title || "Bingo"}
          theme={theme}
          mono={mono}
        />
      ) : null}
    </>,
    root,
  );
}
