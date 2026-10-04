import { getPresetById } from "@/lib/presets";

/** Public embed slugs → classroom preset ids (starter lists only). */
export const CLASSROOM_EMBED_SLUGS = [
  "class-roster",
  "classroom-jobs",
  "brain-breaks",
  "reading-groups",
] as const;

export type ClassroomEmbedSlug = (typeof CLASSROOM_EMBED_SLUGS)[number];

const SLUG_TO_PRESET: Record<ClassroomEmbedSlug, string> = {
  "class-roster": "classroom-students",
  "classroom-jobs": "classroom-jobs",
  "brain-breaks": "brain-breaks",
  "reading-groups": "reading-groups",
};

export function isClassroomEmbedSlug(value: string): value is ClassroomEmbedSlug {
  return (CLASSROOM_EMBED_SLUGS as readonly string[]).includes(value);
}

export function classroomEmbedChoices(slug: ClassroomEmbedSlug): string[] {
  const presetId = SLUG_TO_PRESET[slug];
  const preset = getPresetById(presetId);
  return [...(preset?.choices ?? [])];
}

export function classroomEmbedTitle(slug: ClassroomEmbedSlug): string {
  const presetId = SLUG_TO_PRESET[slug];
  return getPresetById(presetId)?.name ?? "Classroom spinner";
}

export const CLASSROOM_EMBED_CSP =
  "frame-ancestors 'self' https://sites.google.com https://*.googleusercontent.com";
