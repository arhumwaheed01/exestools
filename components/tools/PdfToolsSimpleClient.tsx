"use client";

import type { DragEvent } from "react";
import { useCallback, useRef, useState } from "react";
import {
  LuCheck,
  LuChevronDown,
  LuChevronUp,
  LuDownload,
  LuFileUp,
  LuLoaderCircle,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import type { PdfToolVariant, TransformToolUi } from "@/lib/content/textToolPageTypes";
import {
  MAX_MERGE_FILE_COUNT,
  MAX_MERGE_TOTAL_BYTES,
  MAX_PDF_FILE_BYTES,
} from "@/lib/pdf/constants";

type Props = {
  variant: PdfToolVariant;
  ui: TransformToolUi;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

async function readApiError(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  if (raw) {
    try {
      const j = JSON.parse(raw) as { error?: string };
      if (typeof j.error === "string" && j.error.trim()) return j.error;
    } catch {
      if (raw.length < 240) return raw;
    }
  }
  return res.statusText || "Request failed.";
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function isLikelyPdf(f: File): boolean {
  const n = f.name.toLowerCase();
  return (
    n.endsWith(".pdf") ||
    f.type === "application/pdf" ||
    f.type === "application/x-pdf"
  );
}

function isLikelyDocx(f: File): boolean {
  const n = f.name.toLowerCase();
  return (
    n.endsWith(".docx") ||
    (typeof f.type === "string" && f.type.includes("wordprocessingml"))
  );
}

const SIMPLE_VARIANTS = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-word",
  "word-to-pdf",
] as const satisfies readonly PdfToolVariant[];

type SimpleVariant = (typeof SIMPLE_VARIANTS)[number];

function isSimpleVariant(v: PdfToolVariant): v is SimpleVariant {
  return (SIMPLE_VARIANTS as readonly string[]).includes(v);
}

const VARIANT_COPY: Record<
  SimpleVariant,
  { title: string; subtitle: string; processLabel: string; successLine: string }
> = {
  "merge-pdf": {
    title: "Drop PDF files to combine",
    subtitle: `Order in the list = order in the merged file. Up to ${MAX_MERGE_FILE_COUNT} files, ${formatBytes(MAX_MERGE_TOTAL_BYTES)} total.`,
    processLabel: "Merge PDFs",
    successLine: "Merged PDF is ready.",
  },
  "split-pdf": {
    title: "Drop one PDF to split",
    subtitle:
      "Export every page as its own file (ZIP), or choose a page range for one PDF. Page numbers start at 1.",
    processLabel: "Split PDF",
    successLine: "Split complete.",
  },
  "compress-pdf": {
    title: "Drop a PDF to compress",
    subtitle:
      "Rebuilds the file to reduce size when possible. Results depend on how the PDF was made.",
    processLabel: "Compress PDF",
    successLine: "Compressed PDF is ready.",
  },
  "pdf-to-word": {
    title: "Drop a PDF to convert to Word",
    subtitle:
      "Extracts text into a .docx. Works best on text-based PDFs; layout may simplify.",
    processLabel: "Convert to Word",
    successLine: "Word document is ready.",
  },
  "word-to-pdf": {
    title: "Drop a Word file (.docx)",
    subtitle: "Converts to PDF with a clean text flow. Complex layouts may simplify.",
    processLabel: "Convert to PDF",
    successLine: "PDF is ready.",
  },
};

export function PdfToolsSimpleClient({ variant, ui }: Props) {
  if (!isSimpleVariant(variant)) {
    return (
      <p className="text-sm text-secondary-text" role="alert">
        Unknown PDF tool variant.
      </p>
    );
  }

  const copy = VARIANT_COPY[variant];
  void ui;

  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<"each" | "range">("each");
  const [fromPage, setFromPage] = useState("1");
  const [toPage, setToPage] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const dragDepth = useRef(0);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [lastName, setLastName] = useState("");

  const maxLabel = formatBytes(MAX_PDF_FILE_BYTES);

  const mergeTotalBytes = files.reduce((s, f) => s + f.size, 0);

  const validatePdf = useCallback(
    (f: File) => {
      if (f.size > MAX_PDF_FILE_BYTES) {
        return `Each PDF must be under ${maxLabel}.`;
      }
      if (!isLikelyPdf(f)) {
        return "Please choose a file with a .pdf extension or PDF type.";
      }
      return "";
    },
    [maxLabel],
  );

  const validateDocx = useCallback(
    (f: File) => {
      if (f.size > MAX_PDF_FILE_BYTES) {
        return `File must be under ${maxLabel}.`;
      }
      if (!isLikelyDocx(f)) {
        return "Please choose a .docx file.";
      }
      return "";
    },
    [maxLabel],
  );

  const onPick = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const next = Array.from(list);
      setError("");
      setLastBlob(null);
      setLastName("");

      if (variant === "merge-pdf") {
        const merged: File[] = [...files];
        for (const f of next) {
          const err = validatePdf(f);
          if (err) {
            setError(err);
            return;
          }
          if (merged.length >= MAX_MERGE_FILE_COUNT) {
            setError(`You can add at most ${MAX_MERGE_FILE_COUNT} PDFs. Remove one to add another.`);
            return;
          }
          const sum = merged.reduce((s, x) => s + x.size, 0) + f.size;
          if (sum > MAX_MERGE_TOTAL_BYTES) {
            setError(
              `Combined size would exceed ${formatBytes(MAX_MERGE_TOTAL_BYTES)}. Remove files or use smaller PDFs.`,
            );
            return;
          }
          merged.push(f);
        }
        setFiles(merged);
        return;
      }

      const f = next[0]!;
      const err = variant === "word-to-pdf" ? validateDocx(f) : validatePdf(f);
      if (err) {
        setError(err);
        return;
      }
      setFiles([f]);
    },
    [files, variant, validateDocx, validatePdf],
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      onPick(e.dataTransfer.files);
    },
    [onPick],
  );

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragActive(false);
    }
  }, []);

  const moveMergeFile = useCallback((index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const to = index + dir;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const a = next[index];
      const b = next[to];
      if (!a || !b) return prev;
      next[index] = b;
      next[to] = a;
      return next;
    });
  }, []);

  const removeMergeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setLastBlob(null);
    setLastName("");
  }, []);

  const canProcess =
    variant === "merge-pdf"
      ? files.length >= 2
      : files.length >= 1;

  const run = useCallback(async () => {
    setError("");
    setLastBlob(null);
    setLastName("");

    if (variant === "merge-pdf") {
      if (files.length < 2) {
        setError("Add at least two PDF files to merge.");
        return;
      }
      setBusy(true);
      try {
        const fd = new FormData();
        for (const f of files) fd.append("file", f);
        const res = await fetch("/api/pdf/merge", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await readApiError(res));
        const blob = await res.blob();
        setLastBlob(blob);
        setLastName("merged.pdf");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Merge failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!files[0]) {
      setError("Select a file first.");
      return;
    }
    const file = files[0];

    if (variant === "split-pdf") {
      if (splitMode === "range") {
        const from = Number.parseInt(fromPage.trim(), 10);
        const to = Number.parseInt(toPage.trim(), 10);
        if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to < 1) {
          setError("Enter valid page numbers (whole numbers, starting at 1).");
          return;
        }
        if (from > to) {
          setError('"From page" must be less than or equal to "To page".');
          return;
        }
      }
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode", splitMode);
        if (splitMode === "range") {
          fd.append("from", fromPage.trim());
          fd.append("to", toPage.trim());
        }
        const res = await fetch("/api/pdf/split", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await readApiError(res));
        const blob = await res.blob();
        const ext = splitMode === "each" ? "zip" : "pdf";
        const base = file.name.replace(/\.pdf$/i, "") || "document";
        setLastBlob(blob);
        setLastName(`${base}-split.${ext}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Split failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (variant === "compress-pdf") {
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/pdf/compress", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await readApiError(res));
        const blob = await res.blob();
        const base = file.name.replace(/\.pdf$/i, "") || "document";
        setLastBlob(blob);
        setLastName(`${base}-compressed.pdf`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Compression failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (variant === "pdf-to-word") {
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/pdf/convert/pdf-to-word", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error(await readApiError(res));
        const blob = await res.blob();
        const base = file.name.replace(/\.pdf$/i, "") || "document";
        setLastBlob(blob);
        setLastName(`${base}.docx`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Conversion failed.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (variant === "word-to-pdf") {
      setBusy(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/pdf/convert/word-to-pdf", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error(await readApiError(res));
        const blob = await res.blob();
        const base = file.name.replace(/\.docx$/i, "") || "document";
        setLastBlob(blob);
        setLastName(`${base}.pdf`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Conversion failed.");
      } finally {
        setBusy(false);
      }
    }
  }, [files, fromPage, splitMode, toPage, variant]);

  const accept =
    variant === "word-to-pdf"
      ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/pdf,.pdf";

  return (
    <div
      className="flex flex-col gap-6"
      aria-busy={busy}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          Server processing
        </span>
        <span className="rounded-full border border-input-border bg-background px-3 py-1 text-xs font-medium text-secondary-text/80">
          Up to {maxLabel} per file
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById(`pdf-input-${variant}`)?.click();
          }
        }}
        className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-input-border bg-surface/50 hover:border-primary/40"
        }`}
      >
        <LuFileUp className="h-10 w-10 text-primary/70" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-secondary-text">{copy.title}</p>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-secondary-text/80">
          {copy.subtitle}
        </p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover">
          <input
            id={`pdf-input-${variant}`}
            type="file"
            accept={accept}
            multiple={variant === "merge-pdf"}
            className="sr-only"
            onChange={(e) => onPick(e.target.files)}
          />
          {variant === "merge-pdf" ? "Add PDF files" : "Choose file"}
        </label>
      </div>

      {variant === "merge-pdf" && files.length > 0 ? (
        <div className="rounded-xl border border-input-border/80 bg-background p-3">
          <p className="mb-2 text-xs font-medium text-secondary-text/80">
            {files.length} file{files.length === 1 ? "" : "s"} ·{" "}
            {formatBytes(mergeTotalBytes)} / {formatBytes(MAX_MERGE_TOTAL_BYTES)} combined
          </p>
          <ul className="space-y-2 text-sm">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-surface/80 px-2 py-2"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-mono text-xs text-secondary-text/60">{i + 1}.</span>{" "}
                  {f.name}{" "}
                  <span className="text-xs text-secondary-text/65">({formatBytes(f.size)})</span>
                </span>
                <span className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    className="rounded p-1.5 text-secondary-text hover:bg-background hover:text-primary disabled:opacity-30"
                    disabled={i === 0 || busy}
                    aria-label={`Move ${f.name} up`}
                    onClick={() => moveMergeFile(i, -1)}
                  >
                    <LuChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-secondary-text hover:bg-background hover:text-primary disabled:opacity-30"
                    disabled={i === files.length - 1 || busy}
                    aria-label={`Move ${f.name} down`}
                    onClick={() => moveMergeFile(i, 1)}
                  >
                    <LuChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-red-600/90 hover:bg-red-50 dark:hover:bg-red-950/40"
                    aria-label={`Remove ${f.name}`}
                    disabled={busy}
                    onClick={() => removeMergeFile(i)}
                  >
                    <LuX className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              setFiles([]);
              setLastBlob(null);
              setLastName("");
            }}
          >
            <LuTrash2 className="h-3.5 w-3.5" aria-hidden />
            Clear all files
          </button>
        </div>
      ) : null}

      {variant !== "merge-pdf" && files[0] ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-input-border/80 bg-background px-4 py-3 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-secondary-text">Selected file</p>
            <p className="mt-0.5 truncate text-secondary-text/85" title={files[0].name}>
              {files[0].name}
            </p>
            <p className="text-xs text-secondary-text/65">{formatBytes(files[0].size)}</p>
          </div>
          <label className="shrink-0 cursor-pointer rounded-lg border border-input-border px-3 py-1.5 text-xs font-semibold hover:border-primary/40">
            Replace
            <input
              type="file"
              accept={accept}
              className="sr-only"
              onChange={(e) => onPick(e.target.files)}
            />
          </label>
        </div>
      ) : null}

      {variant === "split-pdf" ? (
        <fieldset className="space-y-3 rounded-xl border border-input-border/80 bg-background p-4">
          <legend className="px-1 text-sm font-semibold text-secondary-text">
            Split mode
          </legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="splitMode"
              checked={splitMode === "each"}
              onChange={() => setSplitMode("each")}
            />
            One PDF per page (downloads a ZIP)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="splitMode"
              checked={splitMode === "range"}
              onChange={() => setSplitMode("range")}
            />
            Page range → single PDF (first page is 1)
          </label>
          {splitMode === "range" ? (
            <div className="flex flex-wrap items-end gap-3 pt-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-secondary-text">
                From page
                <input
                  type="number"
                  min={1}
                  className="rounded-lg border border-input-border bg-background px-3 py-2 text-sm"
                  value={fromPage}
                  onChange={(e) => setFromPage(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-secondary-text">
                To page
                <input
                  type="number"
                  min={1}
                  className="rounded-lg border border-input-border bg-background px-3 py-2 text-sm"
                  value={toPage}
                  onChange={(e) => setToPage(e.target.value)}
                />
              </label>
            </div>
          ) : null}
        </fieldset>
      ) : null}

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {lastBlob ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/35"
          role="status"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-900 dark:text-emerald-100">
            <LuCheck className="h-5 w-5 shrink-0" aria-hidden />
            {copy.successLine}{" "}
            <span className="font-normal opacity-90">Use the button below to save.</span>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80">
            File: <span className="font-mono">{lastName}</span>
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !canProcess}
          title={!canProcess ? "Add the required files first" : undefined}
          onClick={() => void run()}
          className="btn inline-flex items-center gap-2 disabled:opacity-60"
        >
          {busy ? (
            <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {busy ? "Working…" : copy.processLabel}
        </button>
        {lastBlob ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            onClick={() => downloadBlob(lastBlob, lastName)}
          >
            <LuDownload className="h-4 w-4" aria-hidden />
            Download {lastName || "file"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
