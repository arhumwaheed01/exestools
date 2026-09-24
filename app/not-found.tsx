import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Page not found | ExesTools",
  },
  description: "This page does not exist on ExesTools. Return to the Spinner Wheel or browse our tools.",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        That URL isn’t on ExesTools. Try the free Spinner Wheel, or jump to a specialized tool below.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-accent-strong px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Spinner Wheel home
        </Link>
        <Link
          href="/classroom-spinner"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-2"
        >
          Classroom
        </Link>
        <Link
          href="/yes-no-wheel"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-2"
        >
          Yes / No
        </Link>
        <Link
          href="/random-name-picker"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-2"
        >
          Name picker
        </Link>
        <Link
          href="/prize-wheel"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-2"
        >
          Prize wheel
        </Link>
      </div>
    </div>
  );
}
