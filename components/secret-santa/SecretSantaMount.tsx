"use client";

import dynamic from "next/dynamic";

const SecretSantaTool = dynamic(
  () => import("@/components/secret-santa/SecretSantaTool").then((m) => m.SecretSantaTool),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[560px] animate-pulse rounded-3xl border border-border bg-surface p-5"
        aria-hidden
      />
    ),
  },
);

/** Client tool with fixed min-height to avoid CLS. */
export function SecretSantaMount() {
  return (
    <div className="min-h-[560px] lg:min-h-[640px]">
      <SecretSantaTool />
    </div>
  );
}
