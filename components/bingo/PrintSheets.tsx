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
    // Content box after 10mm margins: Letter ≈259mm tall, A4 ≈277mm tall.
    const sheetH = paper === "letter" ? "258mm" : "276mm";
    const paperSize = paper === "letter" ? "letter" : "A4";
    style.textContent = `
@media print {
  html { color-scheme: light !important; background: #fff !important; }
  @page { size: ${paperSize} portrait; margin: 10mm; }
  body > *:not(#${PRINT_ROOT_ID}) { display: none !important; }
  #${PRINT_ROOT_ID} { display: block !important; }
  .bingo-sheet {
    break-after: page;
    page-break-after: always;
    break-inside: avoid;
    page-break-inside: avoid;
    display: grid;
    gap: 3mm;
    align-content: stretch;
    box-sizing: border-box;
    height: ${sheetH};
    max-height: ${sheetH};
    overflow: hidden;
  }
  .bingo-sheet.per-2 {
    grid-template-rows: 1fr 1fr;
  }
  .bingo-sheet.per-4 {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2.5mm;
  }
  .bingo-sheet .bingo-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    max-width: none !important;
    width: 100% !important;
    height: 100% !important;
    max-height: 100% !important;
    margin: 0 !important;
    border-radius: 2mm !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow: hidden !important;
    padding: 1mm !important;
  }
  .bingo-sheet .bingo-card .bc-band {
    display: block !important;
    padding: 1mm 2mm !important;
    flex: 0 0 auto !important;
  }
  .bingo-sheet .bingo-card .bc-title {
    font-size: 10pt !important;
    line-height: 1.05 !important;
    -webkit-line-clamp: 1 !important;
    line-clamp: 1 !important;
  }
  .bingo-sheet .bingo-card .bc-sub { display: none !important; }
  .bingo-sheet .bingo-card .bc-grid {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    gap: 0 !important;
    display: grid !important;
    align-content: stretch !important;
  }
  .bingo-sheet .bingo-card [role="gridcell"] {
    min-height: 0 !important;
    height: 100% !important;
    display: flex !important;
  }
  .bingo-sheet .bingo-card .bc-letter,
  .bingo-sheet .bingo-card .bc-cell {
    aspect-ratio: auto !important;
    min-height: 0 !important;
    height: 100% !important;
    width: 100% !important;
    flex: 1 1 auto !important;
  }
  .bingo-sheet.per-2 .bingo-card .bc-cell-label {
    font-size: clamp(7pt, 1.8vw, 10pt) !important;
  }
  .bingo-sheet .bingo-card .bc-foot {
    display: block !important;
    flex: 0 0 auto !important;
    font-size: 6.5pt !important;
    padding-top: 0.5mm !important;
  }
  .bingo-sheet.per-4 .bingo-card .bc-title { font-size: 9pt !important; }
  .bingo-sheet.per-4 .bingo-card .bc-letter { font-size: 11pt !important; }
  .bingo-sheet.per-4 .bingo-card .bc-cell,
  .bingo-sheet.per-4 .bingo-card .bc-cell-label {
    font-size: 7.5pt !important;
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
