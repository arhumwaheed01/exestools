import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClassroomEmbedWheel } from "@/components/classroom/ClassroomEmbedWheel";
import {
  classroomEmbedChoices,
  classroomEmbedTitle,
  isClassroomEmbedSlug,
} from "@/lib/classroom-embed";
import { absoluteUrl } from "@/lib/seo";

type PageProps = {
  params: Promise<{ preset: string }>;
  // Present so Next accepts the URL; values are intentionally ignored (no roster in query).
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return [
    { preset: "class-roster" },
    { preset: "classroom-jobs" },
    { preset: "brain-breaks" },
    { preset: "reading-groups" },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { preset } = await params;
  if (!isClassroomEmbedSlug(preset)) {
    return { title: "Not found" };
  }
  const name = classroomEmbedTitle(preset);
  return {
    title: {
      absolute: `${name} (embed) | ExesTools`,
    },
    description: `Spin-only classroom embed: ${name}. For Google Sites Insert → Embed → By URL.`,
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl("/classroom-spinner") },
  };
}

export default async function ClassroomEmbedPage({ params }: PageProps) {
  const { preset } = await params;
  if (!isClassroomEmbedSlug(preset)) notFound();

  // Touch starter list so SSR HTML shows the correct labels (not query-driven).
  const choices = classroomEmbedChoices(preset);

  return (
    <>
      <div className="sr-only">
        <p>{`${choices.length} choices on the wheel: ${choices.join(", ")}.`}</p>
      </div>
      <ClassroomEmbedWheel slug={preset} />
    </>
  );
}
