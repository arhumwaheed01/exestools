/** Shared JSON-LD helpers (C-14 / MA-09). */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.exestools.com/#organization",
    name: "ExesTools",
    url: "https://www.exestools.com/",
    logo: "https://www.exestools.com/icon.svg",
    email: "hello@exestools.com",
    founder: { "@type": "Person", name: "Arhum Waheed" },
  };
}

export function webAppLd({
  path,
  name,
  description,
  category = "UtilitiesApplication",
  alternateName,
  featureList,
}: {
  path: string;
  name: string;
  description: string;
  category?: string;
  alternateName?: string[];
  featureList?: string[];
}) {
  // Prefer apex without trailing slash (P2-3); path "/" → https://www.exestools.com
  const url = path === "/" ? "https://www.exestools.com" : `https://www.exestools.com${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name,
    ...(alternateName?.length ? { alternateName } : {}),
    url,
    applicationCategory: category,
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and a modern web browser",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description,
    ...(featureList?.length ? { featureList } : {}),
    publisher: { "@id": "https://www.exestools.com/#organization" },
  };
}

export function siteGraphLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.exestools.com/#website",
        name: "ExesTools",
        alternateName: ["ExesTools Spinner Wheel", "Exes Tools", "exestools.com"],
        url: "https://www.exestools.com/",
        inLanguage: "en",
        publisher: { "@id": "https://www.exestools.com/#organization" },
      },
      organizationLd(),
    ],
  };
}

export function faqPageLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.replace(/\[|\]/g, ""),
      },
    })),
  };
}

export function aboutPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: "https://www.exestools.com/about",
    mainEntity: { "@id": "https://www.exestools.com/#organization" },
  };
}

/** Shared OG fields so child metadata keeps type / siteName / locale. */
export function toolOpenGraph(opts: {
  title: string;
  description: string;
  url: string;
  imagePath: string;
  imageAlt?: string;
}) {
  return {
    type: "website" as const,
    siteName: "ExesTools",
    locale: "en_US",
    title: opts.title,
    description: opts.description,
    url: opts.url,
    images: [
      {
        url: opts.imagePath,
        width: 1200,
        height: 630,
        alt: opts.imageAlt ?? "ExesTools",
      },
    ],
  };
}
