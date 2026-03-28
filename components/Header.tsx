"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuCode,
  LuFileText,
  LuHouse,
  LuImage,
  LuLayoutGrid,
  LuMenu,
  LuSearch,
  LuSparkles,
  LuType,
  LuX,
} from "react-icons/lu";
import { ToolSearchModal } from "@/components/search/ToolSearchModal";
import { navigationData } from "@/lib/content/homepageData";
import { site } from "@/lib/site";

const navIcons = {
  home: LuHouse,
  type: LuType,
  code: LuCode,
  image: LuImage,
  file: LuFileText,
} as const;

function NavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul
      className={`${className ?? ""} list-none gap-[calc(var(--spacing)*2)] p-0 [&>li+li]:mt-0`.trim()}
    >
      {navigationData.header.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = navIcons[item.icon];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-base font-medium transition-all duration-200 md:inline-flex md:py-1.5 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-secondary-text hover:bg-surface hover:text-primary"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                  active ? "scale-110" : "group-hover:scale-105"
                }`}
                aria-hidden
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cta } = navigationData;

  return (
    <header className="sticky top-0 z-50 border-b border-input-border/80 bg-background/85 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container flex items-center justify-between gap-4 py-3 md:py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight text-primary transition-all duration-300 hover:text-primary-hover"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <LuSparkles className="h-5 w-5" aria-hidden />
          </span>
          <span>{site.name}</span>
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Main">
          <NavLinks className="flex flex-row items-center" />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-input-border bg-background text-secondary-text transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-95"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            aria-label="Open tool search"
          >
            <LuSearch className="h-5 w-5" aria-hidden />
          </button>

          <Link
            href={cta.href}
            className="btn shrink-0 gap-2 text-sm md:text-base"
          >
            <LuLayoutGrid className="h-4 w-4 md:h-5 md:w-5" aria-hidden />
            {cta.label}
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-input-border bg-background text-secondary-text transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-95 lg:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? (
              <LuX className="h-5 w-5" aria-hidden />
            ) : (
              <LuMenu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <ToolSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileMenuOpen ? (
        <div
          id="mobile-nav"
          className="animate-fade-in-up border-t border-input-border bg-background/95 backdrop-blur-md lg:hidden"
        >
          <nav className="container pb-4 pt-2" aria-label="Mobile">
            <NavLinks
              className="flex flex-col"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
