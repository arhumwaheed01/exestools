import Link from "next/link";
import { LuCode, LuImage, LuSparkles, LuType } from "react-icons/lu";
import { site } from "@/lib/site";

const textToolLinks = [
  { label: "Word Counter", href: "/tools/word-counter" },
  { label: "Character Counter", href: "/tools/character-counter" },
  { label: "Uppercase Converter", href: "/tools/uppercase-converter" },
  { label: "Text Reverser", href: "/tools/text-reverser" },
];

const developerToolLinks = [
  { label: "JSON Formatter", href: "/tools/json-formatter" },
  { label: "Base64 Encoder", href: "/tools/base64-encoder" },
  { label: "SHA256 Generator", href: "/tools/sha256-generator" },
  { label: "UUID Generator", href: "/tools/uuid-generator" },
];

const imageToolLinks = [
  { label: "Image Compressor", href: "/tools/image-compressor" },
  { label: "JPG to PNG", href: "/tools/jpg-to-png" },
  { label: "Image Resizer", href: "/tools/image-resizer" },
  { label: "Image Metadata Viewer", href: "/tools/image-metadata-viewer" },
];

function FooterLinkList({
  title,
  icon: Icon,
  links,
}: {
  title: string;
  icon: typeof LuType;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="">
      <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-white/95">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group inline-flex items-center text-sm font-medium text-white/82 no-underline transition-all duration-200 hover:translate-x-0.5 hover:text-white"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary/70 transition-colors group-hover:bg-primary" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-secondary-text text-white">
      <div className="container relative py-14 md:py-16">
        <div className="grid grid-cols-1 gap-6 sm:text-center text-left md:grid-cols-2 md:gap-6 md:text-left lg:grid-cols-4">
          <div className="">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 text-xl font-bold text-white transition-colors hover:text-primary md:justify-start"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/12 text-white transition-transform duration-300 group-hover:scale-105 group-hover:bg-white/20">
              <LuSparkles className="h-5 w-5" aria-hidden />
            </span>
            {site.name}
          </Link>
          <div className="mt-4 space-y-2.5">
            <p className="max-w-sm text-sm leading-relaxed text-white/80">Performance optimized online tools for everyday tasks.</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">Use clean, fast, browser-based utilities.</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">Built for text, developer, and image workflows.</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/80">No clutter, just practical tools with shareable links.</p>
          </div>
        </div>

        <FooterLinkList title="Text Tools" icon={LuType} links={textToolLinks} />

        <FooterLinkList title="Developer Tools" icon={LuCode} links={developerToolLinks} />

        <FooterLinkList title="Image Tools" icon={LuImage} links={imageToolLinks} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/10 py-5">
        <div className="container grid grid-cols-1 gap-4 text-sm tracking-wide text-white/72 sm:grid-cols-2 sm:items-center sm:gap-6">
          <nav
            aria-label="Legal and information"
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-start"
          >
            <Link
              href="/privacy-policy"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <Link
              href="/terms-of-service"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <Link
              href="/contact"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              Contact
            </Link>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <Link
              href="/about"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              About
            </Link>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <Link
              href="/disclaimer"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              Disclaimer
            </Link>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <Link
              href="/dmca"
              className="px-2 font-medium text-white/88 no-underline transition-colors hover:text-white"
            >
              DMCA
            </Link>
          </nav>
          <p className="mb-0 text-center text-white/72 sm:text-right">
            © 2026 ExesTools. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
