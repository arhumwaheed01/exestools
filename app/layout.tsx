import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { AppShell } from "@/components/AppShell";
import { GoogleTag } from "@/components/GoogleTag";
import { organizationLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** ca-pub-… from Vercel env. No ad units until approval (MD-05). */
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/** Prefer static HTML + ISR-friendly caching (P2-1). */
export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [
      {
        url: siteConfig.ogImagePath,
        width: 1200,
        height: 630,
        alt: "ExesTools Spinner Wheel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    images: [siteConfig.ogImagePath],
  },
  // AdSense site verification (meta-tag method)
  other: ADSENSE_CLIENT ? { "google-adsense-account": ADSENSE_CLIENT } : {},
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adsense = ADSENSE_CLIENT ? (
    <Script
      id="adsense-loader"
      async
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  ) : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }}
        />
        <AppShell adsense={adsense}>{children}</AppShell>
        {/* Embeds: no AdSense units; keep GA for aggregate embed_view / spin only */}
        <GoogleTag />
      </body>
    </html>
  );
}
