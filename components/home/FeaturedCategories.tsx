import Link from "next/link";
import { LuArrowUpRight, LuCode, LuFileText, LuImage, LuType } from "react-icons/lu";
import { homepageData } from "@/lib/content/homepageData";

const categoryIcons = {
  "/text-tools": LuType,
  "/developer-tools": LuCode,
  "/image-tools": LuImage,
  "/pdf-tools": LuFileText,
} as const;

export function FeaturedCategories() {
  const { categoriesSection } = homepageData;

  return (
    <section className="relative bg-surface py-14 md:py-20">
      <div className="container">
        <h2 className="!mt-0 text-center text-2xl font-semibold md:text-3xl">
          {categoriesSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-secondary-text">
          {categoriesSection.subtitle}
        </p>
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categoriesSection.categories.map((cat, index) => {
            const Icon =
              categoryIcons[cat.link as keyof typeof categoryIcons] ?? LuType;
            return (
              <li
                key={cat.link}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Link
                  href={cat.link}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-input-border bg-background p-6 no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10"
                >
                  <span
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    {cat.badge ? (
                      <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-secondary-text/75 ring-1 ring-input-border">
                        {cat.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="!mt-4 text-xl font-semibold text-secondary-text transition-colors duration-200 group-hover:text-primary">
                    {cat.title}
                  </h3>
                  <p className="mt-3 flex-1 text-base leading-relaxed text-secondary-text">
                    {cat.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 font-semibold text-primary transition-all duration-200 group-hover:gap-2 group-hover:text-primary-hover">
                    {categoriesSection.ctaLabel}
                    <LuArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
