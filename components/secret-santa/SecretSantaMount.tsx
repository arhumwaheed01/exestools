"use client";

import { SecretSantaTool } from "@/components/secret-santa/SecretSantaTool";

/** Client tool with fixed min-height to avoid CLS. SSR-renders the real form. */
export function SecretSantaMount() {
  return (
    <div className="min-h-[560px] min-w-0 lg:min-h-[640px]">
      <SecretSantaTool />
    </div>
  );
}
