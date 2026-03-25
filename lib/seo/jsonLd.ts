import { absoluteUrl } from "./generateMeta";
import { defaultSEO } from "./seoConfig";

export type FaqItem = { question: string; answer: string };

/** schema.org WebApplication for individual tool pages */
export function buildWebApplicationJsonLd(input: {
  name: string;
  description: string;
  urlPath: string;
  applicationCategory?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(input.urlPath);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url,
    applicationCategory: input.applicationCategory ?? "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    provider: {
      "@type": "Organization",
      name: defaultSEO.siteName,
      url: defaultSEO.siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** schema.org FAQPage */
export function buildFaqPageJsonLd(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Organization + WebSite with SearchAction (optional sitelinks search box later) */
export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${defaultSEO.siteUrl}/#website`,
        url: defaultSEO.siteUrl,
        name: defaultSEO.siteName,
        description: defaultSEO.defaultDescription,
        publisher: { "@id": `${defaultSEO.siteUrl}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${defaultSEO.siteUrl}/#organization`,
        name: defaultSEO.siteName,
        url: defaultSEO.siteUrl,
      },
    ],
  };
}
