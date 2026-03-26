import Script from "next/script";
import { ga4MeasurementId } from "@/lib/seo/seoConfig";

/**
 * GA4 (gtag.js) — loaded once in root layout; tracks all App Router pages.
 */
export function GoogleAnalytics() {
  if (!ga4MeasurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4MeasurementId}');
        `}
      </Script>
    </>
  );
}
