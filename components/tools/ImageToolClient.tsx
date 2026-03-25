"use client";

import type { DragEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuCopy, LuCopyCheck, LuDownload, LuImagePlus, LuTrash2, LuUpload } from "react-icons/lu";
import type { ImageToolVariant, TransformToolUi } from "@/lib/content/textToolPageTypes";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolResult } from "@/components/tools/ToolResult";

type Props = {
  variant: ImageToolVariant;
  ui: TransformToolUi;
};

type ProcessedResult = {
  outputDataUrl?: string;
  outputText?: string;
  outputFileName?: string;
  outputMime?: string;
  metadataText?: string;
};

function inferTargetMime(variant: ImageToolVariant, sourceType: string): string {
  if (variant === "jpg-to-png" || variant === "webp-to-png") return "image/png";
  if (variant === "png-to-jpg" || variant === "webp-to-jpg") return "image/jpeg";
  if (variant === "jpg-to-webp" || variant === "png-to-webp") return "image/webp";
  if (variant === "compress-jpeg") return "image/jpeg";
  if (variant === "compress-png") return "image/png";
  if (variant === "compress-webp") return "image/webp";
  if (variant === "remove-metadata") return sourceType || "image/jpeg";
  return sourceType || "image/png";
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}

function blobFromDataUrl(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

function extensionFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "img";
}

function stripExt(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromDataUrl(dataUrl: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image data."));
    img.src = dataUrl;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, mime: string, quality: number) {
  if (mime === "image/png") return canvas.toDataURL("image/png");
  return canvas.toDataURL(mime, quality);
}

export function ImageToolClient({ variant, ui }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState(82);
  const [resizeW, setResizeW] = useState(1200);
  const [resizeH, setResizeH] = useState(800);
  const [cropW, setCropW] = useState(800);
  const [cropH, setCropH] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(90);
  const [flipH, setFlipH] = useState(true);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState<ProcessedResult>({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<null | "in" | "out">(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isBase64InputMode = variant === "from-base64";
  const needsFile = !isBase64InputMode;
  const hasSource = isBase64InputMode ? Boolean(base64Input.trim()) : Boolean(sourceDataUrl);

  const onPickFile = useCallback(async (picked?: File | null) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setFile(picked);
    const dataUrl = await readFileAsDataUrl(picked);
    setSourceDataUrl(dataUrl);
  }, []);

  const onDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      await onPickFile(e.dataTransfer.files?.[0] ?? null);
    },
    [onPickFile],
  );

  const processImage = useCallback(async () => {
    setError("");
    setResult({});
    try {
      if (variant === "from-base64") {
        const raw = base64Input.trim();
        if (!raw) return;
        const dataUrl = raw.startsWith("data:image")
          ? raw
          : `data:image/png;base64,${raw.replace(/\s+/g, "")}`;
        const blob = await blobFromDataUrl(dataUrl);
        setResult({
          outputDataUrl: dataUrl,
          outputMime: blob.type || "image/png",
          outputFileName: `decoded-image.${extensionFromMime(blob.type || "image/png")}`,
          outputText: dataUrl,
        });
        return;
      }

      if (!sourceDataUrl || !file) return;
      const img = await loadImageFromDataUrl(sourceDataUrl);

      const targetMime = inferTargetMime(variant, file.type);
      const q = Math.min(1, Math.max(0.05, quality / 100));

      if (variant === "metadata") {
        const text = [
          `Name: ${file.name}`,
          `Type: ${file.type || "unknown"}`,
          `Size: ${file.size.toLocaleString()} bytes`,
          `Last modified: ${new Date(file.lastModified).toLocaleString()}`,
          `Dimensions: ${img.naturalWidth} x ${img.naturalHeight}`,
        ].join("\n");
        setResult({ metadataText: text, outputText: text });
        return;
      }

      if (variant === "to-base64") {
        setResult({
          outputText: sourceDataUrl,
          outputDataUrl: sourceDataUrl,
          outputMime: file.type || "image/png",
          outputFileName: file.name,
        });
        return;
      }

      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported in this browser.");

      if (variant === "resize") {
        const aspect = img.naturalWidth / img.naturalHeight;
        const width = Math.max(1, Math.round(resizeW));
        const height = lockAspect ? Math.max(1, Math.round(width / aspect)) : Math.max(1, Math.round(resizeH));
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      } else if (variant === "crop") {
        const width = Math.min(img.naturalWidth, Math.max(1, Math.round(cropW)));
        const height = Math.min(img.naturalHeight, Math.max(1, Math.round(cropH)));
        const sx = Math.max(0, Math.floor((img.naturalWidth - width) / 2));
        const sy = Math.max(0, Math.floor((img.naturalHeight - height) / 2));
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, sx, sy, width, height, 0, 0, width, height);
      } else if (variant === "rotate") {
        const angle = rotation;
        if (angle === 90 || angle === 270) {
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
        } else {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      } else if (variant === "flip") {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.translate(flipH ? canvas.width : 0, flipV ? canvas.height : 0);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, 0, 0);
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      }

      const outputDataUrl = canvasToDataUrl(canvas, targetMime, q);
      const outExt = extensionFromMime(targetMime);
      const outputFileName = `${stripExt(file.name)}-${variant}.${outExt}`;
      setResult({
        outputDataUrl,
        outputMime: targetMime,
        outputFileName,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process image.");
    }
  }, [
    base64Input,
    cropH,
    cropW,
    file,
    flipH,
    flipV,
    lockAspect,
    quality,
    resizeH,
    resizeW,
    rotation,
    sourceDataUrl,
    variant,
  ]);

  useEffect(() => {
    void processImage();
  }, [processImage]);

  const sourceMeta = useMemo(() => {
    if (!file) return "";
    return `${file.name} · ${(file.size / 1024).toFixed(1)} KB · ${file.type || "image"}`;
  }, [file]);

  const outputMeta = useMemo(() => {
    if (!result.outputDataUrl) return "";
    const mime = result.outputMime || "image";
    return `${result.outputFileName ?? "output"} · ${mime}`;
  }, [result.outputDataUrl, result.outputFileName, result.outputMime]);

  const flashCopied = useCallback((target: "in" | "out") => {
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1800);
  }, []);

  const copyInput = useCallback(async () => {
    const text = isBase64InputMode ? base64Input : sourceDataUrl;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    flashCopied("in");
  }, [base64Input, flashCopied, isBase64InputMode, sourceDataUrl]);

  const copyOutput = useCallback(async () => {
    const text = result.outputText || result.outputDataUrl;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    flashCopied("out");
  }, [flashCopied, result.outputDataUrl, result.outputText]);

  const clearAll = useCallback(() => {
    setFile(null);
    setSourceDataUrl("");
    setBase64Input("");
    setResult({});
    setError("");
  }, []);

  const inputPanel = (
    <div className="flex flex-col gap-4">
      {needsFile ? (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-2 border-dashed p-5 transition-colors ${
              isDragging ? "border-primary bg-primary/8" : "border-input-border bg-background"
            }`}
          >
            <p className="m-0 text-sm text-secondary-text">
              Drag & drop image here, or
              <button
                type="button"
                className="ml-1 font-semibold text-primary underline-offset-2 hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                browse file
              </button>
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
            {sourceMeta ? <p className="mt-2 text-xs text-secondary-text/70">{sourceMeta}</p> : null}
          </div>
          {sourceDataUrl ? (
            <div className="overflow-hidden rounded-xl border border-input-border bg-background p-3">
              <p className="mb-2 text-xs font-semibold text-secondary-text/80">Before</p>
              <img src={sourceDataUrl} alt="Source preview" className="max-h-70 w-full rounded-lg object-contain" />
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-input-border bg-background p-3">
          <label className="mb-2 block text-sm font-semibold text-secondary-text">Base64 input</label>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder={ui.textareaPlaceholder}
            className="input min-h-44 w-full resize-y"
          />
        </div>
      )}

      {(variant === "compress" ||
        variant === "compress-jpeg" ||
        variant === "compress-png" ||
        variant === "compress-webp" ||
        variant === "png-to-jpg" ||
        variant === "jpg-to-webp" ||
        variant === "webp-to-jpg" ||
        variant === "png-to-webp") && (
        <div className="rounded-xl border border-input-border bg-background p-3">
          <label className="mb-2 block text-sm font-semibold text-secondary-text">Quality: {quality}%</label>
          <input
            type="range"
            min={35}
            max={95}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {variant === "resize" && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-input-border bg-background p-3">
          <label className="text-sm">
            Width
            <input type="number" value={resizeW} onChange={(e) => setResizeW(Number(e.target.value) || 1)} className="input mt-1 w-full" />
          </label>
          <label className="text-sm">
            Height
            <input
              type="number"
              value={resizeH}
              disabled={lockAspect}
              onChange={(e) => setResizeH(Number(e.target.value) || 1)}
              className="input mt-1 w-full disabled:opacity-50"
            />
          </label>
          <label className="col-span-2 inline-flex items-center gap-2 text-sm text-secondary-text">
            <input type="checkbox" checked={lockAspect} onChange={(e) => setLockAspect(e.target.checked)} />
            Lock aspect ratio
          </label>
        </div>
      )}

      {variant === "crop" && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-input-border bg-background p-3">
          <label className="text-sm">
            Crop width
            <input type="number" value={cropW} onChange={(e) => setCropW(Number(e.target.value) || 1)} className="input mt-1 w-full" />
          </label>
          <label className="text-sm">
            Crop height
            <input type="number" value={cropH} onChange={(e) => setCropH(Number(e.target.value) || 1)} className="input mt-1 w-full" />
          </label>
        </div>
      )}

      {variant === "rotate" && (
        <div className="rounded-xl border border-input-border bg-background p-3">
          <label className="mb-2 block text-sm font-semibold text-secondary-text">Rotation</label>
          <select
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value) as 0 | 90 | 180 | 270)}
            className="input w-full"
          >
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      )}

      {variant === "flip" && (
        <div className="rounded-xl border border-input-border bg-background p-3">
          <p className="mb-2 text-sm font-semibold text-secondary-text">Flip direction</p>
          <label className="mr-4 inline-flex items-center gap-2 text-sm text-secondary-text">
            <input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} />
            Horizontal
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-secondary-text">
            <input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} />
            Vertical
          </label>
        </div>
      )}
    </div>
  );

  const resultText = error || result.metadataText || result.outputText || "";

  const resultPanel = result.outputDataUrl ? (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-input-border bg-background p-3">
        <p className="mb-2 text-xs font-semibold text-secondary-text/80">After</p>
        <img src={result.outputDataUrl} alt="Processed preview" className="max-h-70 w-full rounded-lg object-contain" />
      </div>
      {outputMeta ? <p className="text-xs text-secondary-text/70">{outputMeta}</p> : null}
      {resultText ? (
        <ToolResult label={ui.outputHeading} emptyHint={ui.outputEmptyHint}>
          {resultText}
        </ToolResult>
      ) : null}
    </div>
  ) : (
    <ToolResult label={ui.outputHeading} emptyHint={ui.outputEmptyHint}>
      {resultText}
    </ToolResult>
  );

  return (
    <ToolLayout
      input={inputPanel}
      result={resultPanel}
      actions={
        <>
          <button
            type="button"
            className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
            onClick={() => inputRef.current?.click()}
            disabled={isBase64InputMode}
          >
            <LuUpload className="h-5 w-5" aria-hidden />
            Upload
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface disabled:pointer-events-none disabled:opacity-45"
            onClick={copyOutput}
            disabled={!result.outputText && !result.outputDataUrl}
          >
            {copied === "out" ? <LuCopyCheck className="h-5 w-5" aria-hidden /> : <LuCopy className="h-5 w-5" aria-hidden />}
            {copied === "out" ? ui.copySuccess : ui.copyOutput}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface disabled:pointer-events-none disabled:opacity-45"
            onClick={copyInput}
            disabled={!hasSource}
          >
            {copied === "in" ? <LuCopyCheck className="h-5 w-5" aria-hidden /> : <LuImagePlus className="h-5 w-5" aria-hidden />}
            {copied === "in" ? ui.copySuccess : ui.copyInput}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface disabled:pointer-events-none disabled:opacity-45"
            onClick={() => {
              if (!result.outputDataUrl) return;
              downloadDataUrl(result.outputDataUrl, result.outputFileName ?? "processed-image");
            }}
            disabled={!result.outputDataUrl}
          >
            <LuDownload className="h-5 w-5" aria-hidden />
            Download
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium text-secondary-text transition-all hover:border-primary/40 hover:bg-surface"
            onClick={clearAll}
          >
            <LuTrash2 className="h-5 w-5" aria-hidden />
            {ui.clearButton}
          </button>
        </>
      }
    />
  );
}

