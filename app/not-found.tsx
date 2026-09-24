import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Page not found | ExesTools",
  },
  description: "This page does not exist on ExesTools. Return to the Spinner Wheel or browse our tools.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        That URL is not on ExesTools. The Spinner Wheel is still ready on the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Open Spinner Wheel
        </Link>
        <Link
          href="/about"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          About
        </Link>
      </div>
    </div>
  );
}
