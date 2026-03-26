import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/Container";
import { toolPageUi } from "@/lib/content/textToolsData";

type ToolPageShellProps = {
  /** Short label for breadcrumb (e.g. tool name). */
  title: string;
  /** Hero line under H1; often matches meta description for consistency. */
  description: string;
  /** Visible H1 (tool name + benefit). Defaults to `title` when omitted. */
  pageHeading?: string;
  children?: ReactNode;
  /** Renders below the tool card, above footer links (e.g. long-form SEO). */
  afterCard?: ReactNode;
  /** Featured layout (grid, blurred accents, elevated card). */
  variant?: "default" | "featured" | "word-counter";
};

export function ToolPageShell({
  title,
  description,
  pageHeading,
  children,
  afterCard,
  variant = "default",
}: ToolPageShellProps) {
  const { breadcrumb, footerLinks } = toolPageUi;

  const isFeaturedLayout =
    variant === "featured" || variant === "word-counter";
  const sectionClass = isFeaturedLayout
    ? "relative overflow-hidden bg-surface pt-4 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20"
    : "bg-surface pt-4 pb-12 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20";
  const cardClass = isFeaturedLayout
    ? "relative mt-10 rounded-2xl border border-input-border/80 bg-background/95 p-6 shadow-xl shadow-black/[0.06] ring-1 ring-black/[0.04] backdrop-blur-sm md:p-9"
    : "mt-10 rounded-lg border border-input-border bg-background p-6 md:p-8 shadow-sm";

  return (
    <section className={sectionClass}>
      {isFeaturedLayout ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(0.95_0.02_260/0.15)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.95_0.02_260/0.15)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
        </>
      ) : null}
      <Container className={isFeaturedLayout ? "relative" : undefined}>
        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-secondary-text/85"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="font-medium no-underline hover:text-primary">
            {breadcrumb.home}
          </Link>
          <span aria-hidden className="text-secondary-text/50">
            /
          </span>
          <Link href="/tools" className="font-medium no-underline hover:text-primary">
            {breadcrumb.allTools}
          </Link>
          <span aria-hidden className="text-secondary-text/50">
            /
          </span>
          <span className="text-secondary-text">{title}</span>
        </nav>

        <h1 className="mt-0!">{pageHeading ?? title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-secondary-text">
          {description}
        </p>

        <div className={cardClass}>{children}</div>

        {afterCard}

        <div
          className={
            isFeaturedLayout
              ? "mt-10 flex flex-col gap-3 rounded-xl border border-input-border/60 bg-background/60 p-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:p-5"
              : "mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6"
          }
        >
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isFeaturedLayout
                  ? "rounded-lg px-2 py-1 text-sm font-semibold text-secondary-text no-underline transition-colors hover:bg-primary/10 hover:text-primary"
                  : "font-semibold no-underline hover:text-primary"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
