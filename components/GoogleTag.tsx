import Script from "next/script";
import { CONSENT_DENIED_REGIONS, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Consent Mode v2 defaults (before gtag config) + Google Analytics tag.
 * Consent defaults stay early; the GA library loads lazyOnload so tool JS paints first.
 * EEA/UK/CH: analytics + ads denied until Google's CMP updates consent.
 * Elsewhere: analytics granted; ads denied by default (CMP / AdSense may update).
 */
export function GoogleTag() {
  if (!GA_MEASUREMENT_ID) return null;

  const regions = JSON.stringify([...CONSENT_DENIED_REGIONS]);

  return (
    <>
      <Script
        id="ga-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500,
  region: ${regions}
});
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
  functionality_storage: 'granted',
  security_storage: 'granted'
});
          `.trim(),
        }}
      />
      <Script
        id="ga-gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
          `.trim(),
        }}
      />
    </>
  );
}
