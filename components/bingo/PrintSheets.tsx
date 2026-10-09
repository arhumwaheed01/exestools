"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BINGO_LETTERS,
  FREE,
  cellLabel,
  columnRange,
  type BingoMode,
  type Card,
  type Cell,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";
import { cellFontPt, longestItemLength } from "@/components/bingo/CardGrid";

const PRINT_ROOT_ID = "bingo-print-root";

/** Direct child of <body> so print CSS `body > *:not(#bingo-print-root)` works. */
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

function PrintCard({
  card,
  size,
  mode,
  title,
  subtitle,
  seed,
  cardMm,
}: {
  card: Card;
  size: GridSize;
  mode: BingoMode;
  title: string;
  subtitle: string;
  seed: string;
  cardMm: number;
}) {
  const longest = longestItemLength(card.cells);
  const pt = cellFontPt(longest);

  return (
    <div
      className="bingo-card"
      style={{
        width: `${cardMm}mm`,
        maxWidth: "100%",
        margin: "0 auto",
        border: "2px solid #000",
        color: "#000",
        background: "#fff",
        padding: "3mm",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        breakInside: "avoid",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "14pt",
          lineHeight: 1.2,
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
      >
        {title || "Bingo"}
      </div>
      {subtitle ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "10pt",
            lineHeight: 1.2,
            marginTop: "1mm",
            overflowWrap: "break-word",
            hyphens: "auto",
          }}
        >
          {subtitle}
        </div>
      ) : null}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "2mm",
          tableLayout: "fixed",
        }}
      >
        {mode === "bingo75" ? (
          <thead>
            <tr>
              {BINGO_LETTERS.map((letter) => (
                <th
                  key={letter}
                  style={{
                    border: "1px solid #000",
                    padding: "1mm",
                    fontSize: "11pt",
                    fontWeight: 700,
                  }}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {Array.from({ length: size }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: size }, (_, c) => {
                const cell = card.cells[r * size + c] as Cell;
                const isFree = cell === null;
                return (
                  <td
                    key={c}
                    style={{
                      border: "1px solid #000",
                      width: `${100 / size}%`,
                      aspectRatio: "1",
                      textAlign: "center",
                      verticalAlign: "middle",
                      fontSize: `${pt}pt`,
                      lineHeight: 1.15,
                      overflowWrap: "break-word",
                      hyphens: "auto",
                      padding: "1mm",
                      background: isFree ? "#f0f0f0" : "#fff",
                      fontWeight: isFree ? 700 : 400,
                    }}
                  >
                    {isFree ? FREE : cellLabel(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "2mm",
          textAlign: "center",
          fontSize: "9pt",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        Card {card.number} · Set {seed}
      </div>
    </div>
  );
}

function CallSheet({
  mode,
  items,
  title,
}: {
  mode: BingoMode;
  items: string[];
  title: string;
}) {
  if (mode === "bingo75") {
    return (
      <div
        className="bingo-sheet"
        style={{
          breakAfter: "page",
          padding: "4mm",
          color: "#000",
          background: "#fff",
        }}
      >
        <h2 style={{ fontSize: "14pt", margin: "0 0 4mm" }}>{title} — call sheet</h2>
        <div style={{ display: "grid", gap: "3mm" }}>
          {BINGO_LETTERS.map((letter, col) => {
            const [lo, hi] = columnRange(col);
            return (
              <div key={letter}>
                <div style={{ fontWeight: 700, marginBottom: "1mm" }}>{letter}</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                    gap: "1mm",
                    fontSize: "9pt",
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
      </div>
    );
  }

  return (
    <div
      className="bingo-sheet"
      style={{
        breakAfter: "page",
        padding: "4mm",
        color: "#000",
        background: "#fff",
      }}
    >
      <h2 style={{ fontSize: "14pt", margin: "0 0 4mm" }}>{title} — call sheet</h2>
      <ol style={{ columns: 2, fontSize: "10pt", margin: 0, paddingLeft: "5mm" }}>
        {items.map((item) => (
          <li key={item} style={{ breakInside: "avoid", marginBottom: "1mm" }}>
            {item}
          </li>
        ))}
      </ol>
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
  onDone: () => void;
}) {
  const doneRef = useRef(false);
  const [root, setRoot] = useState<HTMLElement | null>(null);

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
  @page { size: ${paperSize} portrait; margin: 10mm; }
  body > *:not(#${PRINT_ROOT_ID}) { display: none !important; }
  #${PRINT_ROOT_ID} { display: block !important; }
  .bingo-sheet { break-after: page; display: grid; gap: 8mm; }
  .bingo-sheet.per-2 { grid-template-rows: 1fr 1fr; }
  .bingo-sheet.per-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
  .bingo-card { break-inside: avoid; border: 2px solid #000; color: #000; background: #fff; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

    const after = () => finish();
    window.addEventListener("afterprint", after);
    const t = window.setTimeout(() => {
      window.print();
      finish();
    }, 50);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", after);
    };
  }, [onDone, paper, root]);

  if (!root) return null;

  const cardMm = perPage === 2 ? 120 : 88;
  const sheets: Card[][] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    sheets.push(cards.slice(i, i + perPage));
  }

  return createPortal(
    <>
      {sheets.map((sheet, si) => (
        <div
          key={si}
          className={`bingo-sheet per-${perPage}`}
          style={{
            display: "grid",
            gap: "8mm",
            ...(perPage === 2
              ? { gridTemplateRows: "1fr 1fr" }
              : { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }),
            breakAfter: "page",
            minHeight: "80vh",
            alignContent: "start",
          }}
        >
          {sheet.map((card) => (
            <PrintCard
              key={card.number}
              card={card}
              size={size}
              mode={mode}
              title={title}
              subtitle={subtitle}
              seed={seed}
              cardMm={cardMm}
            />
          ))}
        </div>
      ))}
      {callSheet ? (
        <CallSheet mode={mode} items={callItems} title={title || "Bingo"} />
      ) : null}
    </>,
    root,
  );
}
