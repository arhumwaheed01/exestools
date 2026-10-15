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

  return (
    <>
      {isEmbed ? null : <Header />}
      <main className="flex-1">{children}</main>
      {isEmbed ? null : <Footer />}
      {isEmbed ? null : adsense}
    </>
  );
}
