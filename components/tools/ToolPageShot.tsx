import Image from "next/image";
import { imageSizeFor } from "@/lib/imageSizes";

/** Real tool result screenshot under an article H2 (never above the tool / LCP). */
export function ToolPageShot({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const size = imageSizeFor(src);
  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      sizes="(max-width: 768px) 100vw, 768px"
      loading="lazy"
      className="my-6 h-auto w-full max-w-3xl rounded-xl border border-border"
    />
  );
}
