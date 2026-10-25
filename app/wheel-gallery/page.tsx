import type { Metadata } from "next";
import { WheelGalleryClient } from "@/components/wheel-v2/WheelGalleryClient";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Wheel gallery — ready-made spinner wheels",
  description:
    "Browse free ready-made spinner wheels for food, weekends, classrooms, yes/no, truth or dare, and more. Open any wheel on ExesTools with one click.",
  alternates: { canonical: `${siteConfig.url}/wheel-gallery` },
  openGraph: {
    title: "Wheel gallery — ready-made spinner wheels",
    description:
      "Browse free ready-made spinner wheels and open them instantly on ExesTools.",
    url: `${siteConfig.url}/wheel-gallery`,
  },
};

export default function WheelGalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Wheel gallery
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Ready-made wheels you can open in one click. Search by topic, then spin on the free
          spinner — no account needed.
        </p>
      </header>
      <WheelGalleryClient />
    </div>
  );
}
