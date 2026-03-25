import Link from "next/link";
import { LuArrowRight, LuHash, LuSparkles, LuType } from "react-icons/lu";
import { homepageData } from "@/lib/content/homepageData";

const quickIcons = {
  type: LuType,
  hash: LuHash,
} as const;

export function HeroSection() {
  const { hero } = homepageData;

  return (
    <section className="relative overflow-hidden border-b border-input-border/80 bg-background">
      <div
        className="pointer-events-none absolute inset-0 hero-grid-bg opacity-[0.45]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-pulse-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float-soft animation-delay-500"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/4 h-48 w-48 rounded-full bg-primary/[0.07] blur-2xl animate-float-soft-alt animation-delay-1000"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-primary/10 blur-2xl animate-float-soft animation-delay-2000"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/[0.08] to-transparent blur-2xl animate-hero-breathe"
        aria-hidden
      />

      <div className="container relative py-16 md:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-in-up inline-flex flex-col items-center gap-1">
            <span className="hero-live-badge">
              <span className="hero-live-badge-shimmer" aria-hidden />
              <span className="relative z-[1] inline-flex items-center gap-2">
                <LuSparkles
                  className="h-4 w-4 animate-hero-sparkle"
                  aria-hidden
                />
                {hero.badge}
              </span>
            </span>
          </div>

          <h1 className="animate-fade-in-up animation-delay-100 !mt-6 text-3xl font-bold leading-tight tracking-normal text-secondary-text md:text-4xl lg:text-7xl">
            {hero.title}
          </h1>

          <p className="animate-fade-in-up animation-delay-200 mt-6 text-lg leading-relaxed text-secondary-text md:text-xl">
            {hero.subtitle}
          </p>

          <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-col items-center gap-5">
            <Link
              href={hero.ctaHref}
              className="btn group relative gap-2 overflow-hidden px-8 py-3.5 text-base md:text-lg"
            >
              <span
                className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                aria-hidden
              />
              <span className="relative z-[1]">{hero.cta}</span>
              <LuArrowRight className="relative z-[1] h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <ul
              role="list"
              className="m-0 flex list-none flex-wrap items-center justify-center gap-x-[calc(var(--spacing)*2)] gap-y-[calc(var(--spacing)*2)] p-0 text-sm text-secondary-text/90 [&>li+li]:mt-0 md:flex-nowrap"
            >
              {hero.quickLinks.map((item) => {
                const Icon = quickIcons[item.icon];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold transition-all duration-200 hover:bg-primary/5"
                    >
                      <Icon
                        className="h-4 w-4 transition-transform duration-300 hover:scale-110"
                        aria-hidden
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
