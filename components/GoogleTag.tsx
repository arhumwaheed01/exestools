import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { CONSENT_DENIED_REGIONS, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Consent Mode v2 defaults (before gtag config) + Google Analytics tag.
 * EEA/UK/CH: analytics + ads denied (cookieless pings only until a CMP grants).
 * Elsewhere: analytics granted; ads stay denied (no AdSense yet).
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
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </>
  );
}
