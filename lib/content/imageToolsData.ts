/**
 * Image tools category data and scalable spec map for /tools/[slug].
 */

import type { ImageToolVariant } from "./textToolPageTypes";

export const IMAGE_CATEGORY_SLUGS = [
  "image-compressor",
  "jpeg-compressor",
  "png-compressor",
  "webp-compressor",
  "jpg-to-png",
  "png-to-jpg",
  "jpg-to-webp",
  "webp-to-jpg",
  "png-to-webp",
  "webp-to-png",
  "image-resizer",
  "image-cropper",
  "image-rotator",
  "image-flipper",
  "image-to-base64",
  "base64-to-image",
  "image-metadata-viewer",
  "remove-metadata",
] as const;

export type ImageToolSpec = {
  name: string;
  slug: string;
  description: string;
  relatedTools: string[];
  variant: ImageToolVariant;
};

const imageSpecs: ImageToolSpec[] = [
  {
    name: "Image Compressor",
    slug: "image-compressor",
    description:
      "Compress images client-side with adjustable quality for faster uploads and smaller file sizes.",
    relatedTools: ["jpeg-compressor", "png-compressor", "image-resizer"],
    variant: "compress",
  },
  {
    name: "JPEG Compressor",
    slug: "jpeg-compressor",
    description: "Reduce JPG/JPEG file size in the browser with quality controls and live previews.",
    relatedTools: ["image-compressor", "jpg-to-webp", "image-resizer"],
    variant: "compress-jpeg",
  },
  {
    name: "PNG Compressor",
    slug: "png-compressor",
    description: "Optimize PNG images in-browser and download lighter output for web pages and apps.",
    relatedTools: ["image-compressor", "png-to-jpg", "png-to-webp"],
    variant: "compress-png",
  },
  {
    name: "WebP Compressor",
    slug: "webp-compressor",
    description: "Compress WebP images quickly with browser APIs and no server upload.",
    relatedTools: ["image-compressor", "webp-to-jpg", "webp-to-png"],
    variant: "compress-webp",
  },
  {
    name: "JPG to PNG",
    slug: "jpg-to-png",
    description: "Convert JPG/JPEG to PNG format using Canvas in your browser.",
    relatedTools: ["png-to-jpg", "jpg-to-webp", "image-resizer"],
    variant: "jpg-to-png",
  },
  {
    name: "PNG to JPG",
    slug: "png-to-jpg",
    description: "Convert PNG files to JPG/JPEG for smaller photos and broad compatibility.",
    relatedTools: ["jpg-to-png", "png-to-webp", "jpeg-compressor"],
    variant: "png-to-jpg",
  },
  {
    name: "JPG to WebP",
    slug: "jpg-to-webp",
    description: "Convert JPG images to modern WebP for better compression and performance.",
    relatedTools: ["webp-to-jpg", "jpg-to-png", "webp-compressor"],
    variant: "jpg-to-webp",
  },
  {
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    description: "Convert WebP images to JPG/JPEG for tools that require legacy formats.",
    relatedTools: ["jpg-to-webp", "webp-to-png", "jpeg-compressor"],
    variant: "webp-to-jpg",
  },
  {
    name: "PNG to WebP",
    slug: "png-to-webp",
    description: "Convert PNG to WebP with quality tuning for web optimization.",
    relatedTools: ["webp-to-png", "png-to-jpg", "webp-compressor"],
    variant: "png-to-webp",
  },
  {
    name: "WebP to PNG",
    slug: "webp-to-png",
    description: "Convert WebP files to PNG format for editing and transparency workflows.",
    relatedTools: ["png-to-webp", "webp-to-jpg", "png-compressor"],
    variant: "webp-to-png",
  },
  {
    name: "Image Resizer",
    slug: "image-resizer",
    description: "Resize image dimensions with optional aspect ratio lock and instant preview.",
    relatedTools: ["image-cropper", "image-compressor", "image-rotator"],
    variant: "resize",
  },
  {
    name: "Image Cropper",
    slug: "image-cropper",
    description: "Crop images to custom width and height with center crop behavior.",
    relatedTools: ["image-resizer", "image-rotator", "image-flipper"],
    variant: "crop",
  },
  {
    name: "Image Rotator",
    slug: "image-rotator",
    description: "Rotate images by 90, 180, or 270 degrees in your browser.",
    relatedTools: ["image-flipper", "image-cropper", "image-resizer"],
    variant: "rotate",
  },
  {
    name: "Image Flipper",
    slug: "image-flipper",
    description: "Flip images horizontally or vertically using client-side canvas transforms.",
    relatedTools: ["image-rotator", "image-cropper", "image-resizer"],
    variant: "flip",
  },
  {
    name: "Image to Base64",
    slug: "image-to-base64",
    description: "Convert image files to Base64 data URLs for embedding and quick transport.",
    relatedTools: ["base64-to-image", "image-metadata-viewer", "remove-metadata"],
    variant: "to-base64",
  },
  {
    name: "Base64 to Image",
    slug: "base64-to-image",
    description: "Decode Base64 data URLs into downloadable image files.",
    relatedTools: ["image-to-base64", "jpg-to-png", "png-to-jpg"],
    variant: "from-base64",
  },
  {
    name: "Image Metadata Viewer",
    slug: "image-metadata-viewer",
    description: "Inspect image filename, type, size, dimensions, and basic browser-readable metadata.",
    relatedTools: ["remove-metadata", "image-to-base64", "image-resizer"],
    variant: "metadata",
  },
  {
    name: "Remove Metadata",
    slug: "remove-metadata",
    description: "Re-encode images to remove most embedded metadata and download a cleaner file.",
    relatedTools: ["image-metadata-viewer", "image-compressor", "jpg-to-webp"],
    variant: "remove-metadata",
  },
];

export const imageToolSpecsBySlug: Record<string, ImageToolSpec> = Object.fromEntries(
  imageSpecs.map((s) => [s.slug, s]),
);

export function getImageToolsGridItems(): { slug: string; name: string; description: string }[] {
  return IMAGE_CATEGORY_SLUGS.map((slug) => {
    const spec = imageToolSpecsBySlug[slug];
    if (!spec) throw new Error(`Image grid missing spec for slug: ${slug}`);
    return { slug, name: spec.name, description: spec.description };
  });
}

export function buildImageTextTools() {
  return imageSpecs.map((s) => ({
    name: s.name,
    slug: s.slug,
    description: s.description,
    howToUse: [
      "Upload an image from your device or drag and drop it into the workspace.",
      "Adjust settings (quality, size, rotation, format, or crop area) and review previews.",
      "Download the processed image or copy generated output (for Base64 tools).",
    ],
    faq: [],
    relatedTools: s.relatedTools,
  }));
}

