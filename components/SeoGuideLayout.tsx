import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  intro: string;
  children: ReactNode;
  ctaLabel?: string;
};

export function SeoGuideLayout({
  title,
  intro,
  children,
  ctaLabel = "Open the free Spinner Wheel",
}: Props) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
        <Link href="/" className="hover:underline">
          Spinner Wheel
        </Link>
        <span className="mx-1.5 text-muted">/</span>
        Guide
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{intro}</p>
      <p className="mt-6">
        <Link
          href="/"
          className="inline-flex rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {ctaLabel}
        </Link>
      </p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted sm:text-base">{children}</div>
      <p className="mt-10 rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
        Ready to spin?{" "}
        <Link href="/" className="font-semibold text-accent hover:underline">
          Use the ExesTools Spinner Wheel
        </Link>{" "}
        — no signup required.
      </p>
    </article>
  );
}

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
