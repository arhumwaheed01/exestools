/** Shared JSON-LD helpers (C-14 / MA-09). */

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
  const url = `https://www.exestools.com${path === "/" ? "/" : path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url === "https://www.exestools.com/" ? "https://www.exestools.com/" : url}#app`,
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
      {
        "@type": "Organization",
        "@id": "https://www.exestools.com/#organization",
        name: "ExesTools",
        url: "https://www.exestools.com/",
        logo: "https://www.exestools.com/icon.svg",
        email: "hello@exestools.com",
      },
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
