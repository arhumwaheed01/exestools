import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const META =
  "How ExesTools handles your lists, share links, analytics, advertising cookies and consent choices.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: META,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  openGraph: {
    title: `Privacy Policy | ${siteConfig.name}`,
    description: META,
    url: absoluteUrl("/privacy-policy"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Privacy Policy | ${siteConfig.name}`,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 6, 2026</p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          This Privacy Policy explains how ExesTools (https://www.exestools.com) handles information
          when you use the Spinner Wheel and related pages.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Who we are</h2>
          <p className="mt-2">
            ExesTools operates free browser-based decision tools at https://www.exestools.com,
            including a spinner wheel, a random team generator, a Secret Santa generator and a raffle
            generator. For privacy questions, email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Information stored in your browser</h2>
          <p className="mt-2">
            Wheel choices, team lists and preferences (such as sound on/off) are saved in your
            browser&apos;s local storage so your session can resume. We do not require an account.
            Clearing your browser data removes these items.
          </p>
          <p className="mt-2">
            Secret Santa names, exclusions, event details and your latest draw are also saved in
            local storage on your device. When you open a Secret Santa link, its contents are kept in
            that browser tab&apos;s session storage so a refresh still works; closing the tab clears
            it.
          </p>
          <p className="mt-2">
            Raffle entries, settings and your latest draw are also saved in local storage on your
            device. When you open a raffle result link, its contents are kept in that browser
            tab&apos;s session storage so a refresh still works; closing the tab clears it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Share links</h2>
          <p className="mt-2">
            If you copy a share link, your choices are packed into the part of the link after the #
            sign (it starts with #w=). Browsers don&apos;t send that part of a link to our servers.
            Anyone with the link can see the list, so do not put sensitive personal data in
            shareable links. Older links that used ?c= still open for compatibility.
          </p>
          <p className="mt-2">
            Secret Santa links work the same way: setup links start with #s= and personal reveal
            links start with #r=. The page removes this part from the address bar as soon as it
            loads. Their contents are scrambled so they aren&apos;t readable at a glance, but this is
            not encryption: anyone with a link can open it, including the organizer.
          </p>
          <p className="mt-2">
            Raffle result links start with #d= and carry the draw record: the winners&apos; and
            alternates&apos; names or ticket labels, prizes, counts and draw code, but not the full
            entry list. The page removes this part from the address bar as soon as it loads. Anyone
            with a result link can see the names in it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Hosting and logs</h2>
          <p className="mt-2">
            Our hosting provider, Vercel, may collect standard server logs such as IP address, user
            agent, and request path for security and reliability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Analytics (Google Analytics 4)</h2>
          <p className="mt-2">
            We use Google Analytics 4 (measurement ID G-DJKH68VDEJ) to understand aggregate traffic
            and product usage (for example page views and events like spin, share, preset load,
            Secret Santa draws, link copies and reveals, and raffle draws and exports — counts only,
            never names, event names, prizes or notes). We do not send your wheel choice text or
            names to Analytics, and the page address we measure does not include the shared list.
          </p>
          <p className="mt-2">
            Google Consent Mode v2 is enabled. For visitors in the European Economic Area, the United
            Kingdom and Switzerland, analytics and advertising storage are denied by default until
            you make a choice in our consent message. Outside those regions, analytics storage is
            granted by default so we can measure site usage. Google may process measurement data
            under its own terms; see{" "}
            <a
              href="https://policies.google.com/privacy"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Advertising and cookies</h2>
          <p className="mt-2">
            ExesTools is free to use. To pay for it, we show ads from Google AdSense on some pages.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on your prior
              visits to this website or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to
              you based on your visit to ExesTools and/or other sites on the Internet.
            </li>
            <li>
              Ad serving may involve cookies, web beacons, IP addresses and other identifiers. Google
              and its partners may place or read cookies on your browser, or use web beacons, to
              collect information when ads are shown on this site.
            </li>
            <li>
              You can opt out of personalized advertising in Google&apos;s{" "}
              <a
                href="https://adssettings.google.com"
                className="font-semibold text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Ads Settings
              </a>
              . You can also opt out of some third-party vendors&apos; use of cookies for
              personalized advertising at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                className="font-semibold text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.aboutads.info
              </a>{" "}
              or, if you are in Europe, at{" "}
              <a
                href="https://www.youronlinechoices.eu/"
                className="font-semibold text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                www.youronlinechoices.eu
              </a>
              .
            </li>
            <li>
              Other ad technology providers may also serve ads through Google on this site. For
              visitors in the EEA, the UK and Switzerland they are listed, with links to their own
              privacy policies, in our consent message. Where a provider offers it, you can opt out
              of its cookies for personalized advertising on its website or at www.aboutads.info.
            </li>
            <li>
              To learn how Google uses information from sites that use its services, see{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                className="font-semibold text-accent hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                How Google uses information from sites or apps that use our services
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">
            Your consent choices (EEA, UK and Switzerland)
          </h2>
          <p className="mt-2">
            If you visit from the European Economic Area, the United Kingdom or Switzerland, we use
            Google&apos;s Funding Choices consent messaging (certified under the IAB Transparency and
            Consent Framework) to ask for your consent before cookies or similar storage are used for
            personalized ads, where the law requires it. If you don&apos;t consent, Google may show
            non-personalized or limited ads instead. When Google serves that message on this site,
            you can make or change your choice in the dialog it shows. You can also control or clear
            cookies in your browser settings, or email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            with privacy questions.
          </p>
          <p className="mt-2">
            We do not use the names or options you type into the tools for advertising, and we do
            not send them to Google.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Children</h2>
          <p className="mt-2">
            The Spinner Wheel is a general-purpose tool. Teachers and parents should follow their
            own policies when using class lists. We do not knowingly collect personal information
            from children through accounts, because we do not offer accounts.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <p className="mt-2">
            Privacy questions:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            or our{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact
            </Link>{" "}
            page. See also{" "}
            <Link href="/dmca" className="font-semibold text-accent hover:underline">
              DMCA
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
