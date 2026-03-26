import { defaultSEO } from "@/lib/seo/seoConfig";

export const site = {
  name: defaultSEO.siteName,
  tagline: "Free online tools to simplify your daily tasks.",
  copyright: `© ${new Date().getFullYear()} ${defaultSEO.siteName}. All rights reserved.`,
  /** Replace with your real inbox before production. */
  contactEmail: "contact@exestools.com",
} as const;
