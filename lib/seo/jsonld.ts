/** Shared JSON-LD helpers (C-14 / MA-09). */

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.exestools.com/#organization",
    name: "ExesTools",
    url: "https://www.exestools.com/",
    logo: "https://www.exestools.com/favicon.svg",
    email: "hello@exestools.com",
    founder: { "@type": "Person", name: "Arhum Waheed" },
    sameAs: ["https://www.youtube.com/@exestools"],
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

/** Strip @context so a node can sit inside an @graph. */
function graphNode<T extends Record<string, unknown>>(node: T): Omit<T, "@context"> {
  const { ["@context"]: _ctx, ...rest } = node;
  return rest;
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
      graphNode(organizationLd()),
    ],
  };
}

/** Homepage: one JSON-LD script with WebSite, Organization, WebApplication, FAQPage. */
export function homePageGraphLd(opts: {
  name: string;
  description: string;
  faqs: { q: string; a: string }[];
}) {
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
      graphNode(organizationLd()),
      graphNode(
        webAppLd({
          path: "/",
          name: opts.name,
          description: opts.description,
        }),
      ),
      graphNode(faqPageLd(opts.faqs)),
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

/** About page: Organization + AboutPage in one @graph. */
export function aboutPageGraphLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [graphNode(organizationLd()), graphNode(aboutPageLd())],
  };
}

/** Shared OG fields so child metadata keeps type / siteName / locale. */
export function articleLd(opts: {
  headline: string;
  path: string;
  datePublished: string;
  dateModified: string;
  description: string;
}) {
  const url = `https://www.exestools.com/guides/${opts.path.replace(/^\/guides\//, "")}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Person",
      name: "Arhum Waheed",
      url: "https://www.exestools.com/about#arhum",
    },
    publisher: {
      "@type": "Organization",
      name: "ExesTools",
      url: "https://www.exestools.com",
    },
  };
}

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
