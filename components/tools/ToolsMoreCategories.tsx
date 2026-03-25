import Link from "next/link";
import { LuCode, LuImage, LuSparkles } from "react-icons/lu";

const categoryIcons = {
  code: LuCode,
  image: LuImage,
} as const;

type LinkItem = {
  label: string;
  href: string;
  icon: keyof typeof categoryIcons;
};

type Props = {
  title: string;
  description: string;
  links: readonly LinkItem[];
};

export function ToolsMoreCategories({ title, description, links }: Props) {
  return (
    <div className="mt-14 overflow-hidden rounded-2xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/[0.04] via-background to-surface p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LuSparkles className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-lg font-semibold text-secondary-text">{title}</p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-secondary-text/90">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          {links.map((l) => {
            const Icon = categoryIcons[l.icon];
            return (
              <Link
                key={l.href}
                href={l.href}
                className="group inline-flex items-center justify-center gap-2 rounded-xl border border-input-border bg-background px-5 py-3 text-sm font-semibold text-secondary-text shadow-sm no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-background hover:text-primary hover:shadow-md md:text-base"
              >
                <Icon
                  className="h-5 w-5 text-primary/80 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden
                />
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
