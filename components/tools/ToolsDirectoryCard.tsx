import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { ToolListIcon } from "@/components/tool-icons";
import type { TextTool } from "@/lib/content/textToolsData";
import { toolPath } from "@/lib/content/textToolsData";

type Props = {
  tool: Pick<TextTool, "name" | "slug" | "description">;
};

export function ToolsDirectoryCard({ tool }: Props) {
  const href = toolPath(tool.slug);

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-input-border/90 bg-gradient-to-b from-background to-surface p-5 text-left shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/10 md:p-6"
    >
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
          <ToolListIcon slug={tool.slug} className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="!mt-0 text-lg font-semibold leading-snug text-secondary-text transition-colors group-hover:text-primary">
              {tool.name}
            </h3>
            <LuArrowUpRight
              className="mt-0.5 h-5 w-5 shrink-0 text-primary/45 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              aria-hidden
            />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-secondary-text/90 md:text-[0.9375rem]">
            {tool.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
