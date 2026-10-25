"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/** Chrome for normal pages; hidden on classroom embed routes (static-friendly). */
export function AppShell({
  children,
  adsense,
}: {
  children: ReactNode;
  adsense?: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isEmbed =
    pathname.startsWith("/classroom-spinner/embed/") || pathname.startsWith("/embed/");
  const hasStickySpin =
    pathname === "/" ||
    pathname === "/random-name-picker" ||
    pathname === "/prize-wheel" ||
    pathname === "/classroom-spinner" ||
    pathname === "/yes-no-wheel";

  return (
    <>
      {isEmbed ? null : <Header />}
      <main className="flex-1">{children}</main>
      {isEmbed ? null : <Footer />}
      {/* Clear the mobile sticky SPIN so footer links stay reachable */}
      {isEmbed || !hasStickySpin ? null : (
        <div
          className="pointer-events-none h-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:hidden"
          aria-hidden
        />
      )}
      {isEmbed ? null : adsense}
    </>
  );
}
