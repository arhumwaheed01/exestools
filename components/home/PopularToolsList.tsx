import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";
import { ToolListIcon } from "@/components/tool-icons";
import { homepageData } from "@/lib/content/homepageData";
import { toolPath } from "@/lib/content/textToolsData";

export function PopularToolsList() {
  const { popularSection, popularTools } = homepageData;

  return (
    <section className="bg-background py-14 md:py-20">
      <div className="container max-w-3xl">
        <h2 className="!mt-0 text-center text-2xl font-semibold md:text-3xl">
          {popularSection.title}
        </h2>
        <p className="mt-4 text-center text-base leading-relaxed text-secondary-text">
          {popularSection.subtitle}
        </p>
        <ul className="mt-10 overflow-hidden rounded-2xl border border-input-border bg-surface shadow-sm">
          {popularTools.map((tool, index) => {
            const href = toolPath(tool.slug);
            return (
              <li
                key={href}
                className="animate-fade-in-up border-b border-input-border/80 last:border-b-0"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Link
                  href={href}
                  className="group flex items-center justify-between gap-4 px-5 py-4 text-base font-medium text-secondary-text no-underline transition-all duration-200 hover:bg-background hover:pl-6"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                      <ToolListIcon slug={tool.slug} className="h-5 w-5" />
                    </span>
                    <span className="truncate transition-colors duration-200 group-hover:text-primary">
                      {tool.name}
                    </span>
                  </span>
                  <LuChevronRight
                    className="h-5 w-5 shrink-0 text-primary/60 transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
