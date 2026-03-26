import type { ReactNode } from "react";
import { getLegalSidebarPopularTools } from "@/lib/content/legalSidebarData";
import { LegalSidebar } from "./LegalSidebar";

/**
 * Two-column shell (max 1440px): main + right sidebar. Used only for legal routes via `app/(legal)/layout.tsx`.
 */
export function LegalLayout({ children }: { children: ReactNode }) {
  const popularTools = getLegalSidebarPopularTools();

  return (
    <section className="bg-surface pb-14 pt-6 md:pb-20 md:pt-10 px-4 sm:px-5 md:px-6">
      <div className="mx-auto w-full max-w-container ">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-7 xl:gap-9">
          <div className="min-w-0 flex-1 basis-0">{children}</div>
          <div className="hidden min-w-0 shrink-0 lg:block lg:w-80">
            <LegalSidebar popularTools={popularTools} />
          </div>
        </div>
      </div>
    </section>
  );
}
