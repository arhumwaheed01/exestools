"use client";

import type { TransformToolUi } from "@/lib/content/textToolPageTypes";
import { transformComputeBySlug } from "@/lib/toolComputeRegistry";
import { TransformToolClient } from "@/components/tools/TransformToolClient";

type Props = {
  slug: string;
  ui: TransformToolUi;
};

export function TransformSlugClient({ slug, ui }: Props) {
  const compute = transformComputeBySlug[slug];
  if (!compute) {
    throw new Error(`No transform registered for slug: ${slug}`);
  }
  return <TransformToolClient ui={ui} compute={compute} />;
}
