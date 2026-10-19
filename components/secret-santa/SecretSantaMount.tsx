"use client";

import dynamic from "next/dynamic";
import { ToolSkeleton } from "@/components/tools/ToolSkeleton";

const SecretSantaTool = dynamic(
  () => import("@/components/secret-santa/SecretSantaTool").then((m) => m.SecretSantaTool),
  {
    ssr: false,
    loading: () => <ToolSkeleton variant="santa" />,
  },
);

/** Client tool with fixed min-height to avoid CLS. */
export function SecretSantaMount() {
  return (
    <div className="min-h-[560px] min-w-0 lg:min-h-[640px]">
      <SecretSantaTool />
    </div>
  );
}
