import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Nunito } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { defaultSEO, TEMP_SITEWIDE_NOINDEX } from "@/lib/seo/seoConfig";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(defaultSEO.siteUrl),
  title: {
    default: defaultSEO.defaultTitle,
    template: `%s | ${defaultSEO.siteName}`,
  },
  description: defaultSEO.defaultDescription,
  openGraph: {
    type: "website",
    locale: defaultSEO.locale,
    siteName: defaultSEO.siteName,
    title: defaultSEO.defaultTitle,
    description: defaultSEO.defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSEO.defaultTitle,
    description: defaultSEO.defaultDescription,
    ...(defaultSEO.twitterSite
      ? { site: `@${defaultSEO.twitterSite.replace(/^@/, "")}` }
      : {}),
  },
  ...(TEMP_SITEWIDE_NOINDEX
    ? { robots: { index: false, follow: true } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-secondary-text font-sans">
        <GoogleAnalytics />
        {/* Ahrefs Webmaster Tools (site verification + SEO insights) */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          strategy="beforeInteractive"
          data-key="dXt6vs/vE40l2HO8o0ckmw"
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
