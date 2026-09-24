import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { siteConfig } from "@/lib/seo";

const FOOTER_LINKS = [
  { href: "/", label: "Spinner Wheel" },
  { href: "/random-name-picker", label: "Name Picker" },
  { href: "/classroom-spinner", label: "Classroom" },
  { href: "/prize-wheel", label: "Prize Wheel" },
  { href: "/yes-no-wheel", label: "Yes / No" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/dmca", label: "DMCA" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-8 w-8" title={`${siteConfig.name} logo`} />
            <p className="text-lg font-bold text-foreground">{siteConfig.name}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {siteConfig.tagline}. Free spinner wheel and decision tools — no account required.
          </p>
          <p className="mt-4 text-xs text-muted/80">
            © {year} {siteConfig.name}
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted"
        >
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-accent outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
