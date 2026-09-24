import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name} — free browser tools focused on simple, fair decision helpers like the Spinner Wheel.`,
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">About Us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          <strong className="text-foreground">{siteConfig.name}</strong> builds lightweight online
          tools that help people make everyday decisions faster — without accounts, installs, or
          clutter.
        </p>
        <p>
          Our Spinner Wheel is designed for fair random selection: you provide the choices, the
          wheel spins with realistic deceleration, and the winner is determined by where the
          pointer lands.
        </p>
        <p>
          We prioritize clarity, accessibility, and privacy-friendly defaults. Choices you enter
          stay in your browser unless you choose to share a link.
        </p>
        <p>
          Try the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            Spinner Wheel
          </Link>
          , or browse guides for{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            random name picking
          </Link>
          ,{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classrooms
          </Link>
          , and{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize draws
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
