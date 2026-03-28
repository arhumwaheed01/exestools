import type { ImageToolVariant } from "@/lib/content/textToolPageTypes";

const JPEG_EXTS = new Set(["jpg", "jpeg", "jpe"]);

function extOf(name: string): string {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : "";
}

/** HTML `accept` string so the OS file picker filters to the right formats. */
export function imageToolFileAccept(variant: ImageToolVariant): string {
  switch (variant) {
    case "jpg-to-png":
    case "jpg-to-webp":
    case "compress-jpeg":
      return "image/jpeg,.jpg,.jpeg,.jpe";
    case "png-to-jpg":
    case "png-to-webp":
    case "compress-png":
      return "image/png,.png";
    case "webp-to-jpg":
    case "webp-to-png":
    case "compress-webp":
      return "image/webp,.webp";
    case "compress":
      return "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.jpe,.png,.webp,.gif";
    default:
      return "image/*";
  }
}

/** Short hint under the drop zone for format-specific tools. */
export function imageToolInputHint(variant: ImageToolVariant): string | null {
  switch (variant) {
    case "jpg-to-png":
    case "jpg-to-webp":
    case "compress-jpeg":
      return "JPEG files only (.jpg, .jpeg)";
    case "png-to-jpg":
    case "png-to-webp":
    case "compress-png":
      return "PNG files only (.png)";
    case "webp-to-jpg":
    case "webp-to-png":
    case "compress-webp":
      return "WebP files only (.webp)";
    case "compress":
      return "JPEG, PNG, WebP, or GIF";
    default:
      return null;
  }
}

const COMPRESS_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const GENERIC_IMAGE_EXT =
  /\.(jpe?g|png|gif|webp|bmp|svg|ico|avif|hei[cf]|tiff?)$/i;

/**
 * Validates picked/dropped files. Drag-and-drop bypasses `accept`, so this enforces the same rules.
 * @returns `null` if valid, otherwise a user-facing error message.
 */
export function validateImageToolFile(file: File, variant: ImageToolVariant): string | null {
  const type = file.type.toLowerCase();
  const ext = extOf(file.name);
  const isImageMime = type.startsWith("image/");

  switch (variant) {
    case "jpg-to-png":
    case "jpg-to-webp":
    case "compress-jpeg":
      if (type === "image/jpeg" || type === "image/jpg") return null;
      if (JPEG_EXTS.has(ext)) return null;
      return "Please use a JPEG image (.jpg or .jpeg).";

    case "png-to-jpg":
    case "png-to-webp":
    case "compress-png":
      if (type === "image/png") return null;
      if (ext === "png") return null;
      return "Please use a PNG image (.png).";

    case "webp-to-jpg":
    case "webp-to-png":
    case "compress-webp":
      if (type === "image/webp") return null;
      if (ext === "webp") return null;
      return "Please use a WebP image (.webp).";

    case "compress":
      if (COMPRESS_MIMES.has(type)) return null;
      if (["jpg", "jpeg", "jpe", "png", "webp", "gif"].includes(ext)) return null;
      return "Please use a JPEG, PNG, WebP, or GIF image.";

    default:
      if (isImageMime) return null;
      if (GENERIC_IMAGE_EXT.test(file.name)) return null;
      return "Please select an image file.";
  }
}
