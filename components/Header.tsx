"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { siteConfig } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";

const NAV = [
  ...TOOLS.map((t) => ({ href: t.path, label: t.navLabel })),
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
          onClick={() => setOpen(false)}
        >
          <BrandLogo className="h-8 w-8 shrink-0" title={`${siteConfig.name} logo`} />
          <span className="text-lg">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-2 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active
                    ? "bg-surface-2 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 rounded-xl bg-accent-strong px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-accent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground lg:hidden outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-surface px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-accent hover:bg-surface-2"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
