import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const META =
  "How ExesTools handles your lists, share links, analytics, advertising cookies and consent choices.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: META,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  openGraph: toolOpenGraph({
    title: `Privacy Policy | ${siteConfig.name}`,
    description: META,
    url: absoluteUrl("/privacy-policy"),
    imagePath: siteConfig.ogImagePath,
  }),
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
      <p className="mt-2 text-sm text-muted">Last updated: October 22, 2026</p>
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
          <p className="mt-2">
            The bingo card generator saves your list, card settings, set code and called list in
            local storage on your device, and a player&apos;s marks on their own card in local storage
            on their device. When you open a bingo link, its contents are kept in that tab&apos;s
            session storage so a refresh still works.
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
          <p className="mt-2">
            Bingo set links start with #b= and player card links with #p=. They contain your list and
            settings so the cards can be rebuilt; they aren&apos;t encrypted, so anyone with a link
            can see them.
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
            Secret Santa draws, link copies and reveals, raffle draws and exports, and bingo card
            generation, prints, link copies, calls and card checks — counts and settings only, never
            names, event names, prizes, notes or your list). We do not send your wheel choice text or
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
          <p className="mt-2">
            <strong className="text-foreground">
              Third-party vendors, including Google, use cookies to serve ads based on your prior
              visits to this website or other websites.
            </strong>{" "}
            Google&apos;s use of advertising cookies enables it and its partners to serve ads to you
            based on your visit to ExesTools and/or other sites on the internet.
          </p>
          <p className="mt-2">
            When an ad is shown, Google and its partners may place or read cookies in your browser,
            or use web beacons, IP addresses and similar identifiers, to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>choose which ad to show you;</li>
            <li>limit how many times you see the same ad;</li>
            <li>measure whether ads were seen or clicked, and report on that in aggregate;</li>
            <li>detect and prevent fraud and abuse.</li>
          </ul>
          <p className="mt-2">
            Other ad technology providers may also serve ads on ExesTools through Google. For
            visitors in the EEA, the UK and Switzerland, these providers are listed, with links to
            their privacy policies, in our consent message.
          </p>
          <p className="mt-2">
            To learn more about how Google uses information from sites like this one, see{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              How Google uses information from sites or apps that use our services
            </a>
            . Google&apos;s own{" "}
            <a
              href="https://policies.google.com/privacy"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Advertising page
            </a>{" "}
            explain its practices in more detail.
          </p>
          <h3 className="mt-4 text-base font-bold text-foreground">What we never share with advertisers</h3>
          <p className="mt-2">
            The names, options, prizes, notes and lists you type into ExesTools tools are never sent
            to Google or any ad provider, and they&apos;re never used to choose ads. They stay in
            your browser unless you send someone a share link yourself. We don&apos;t sell lists, and
            we don&apos;t have accounts, email addresses or profiles to share.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Personalized and non-personalized ads</h2>
          <p className="mt-2">
            <strong className="text-foreground">Personalized ads</strong> are chosen using
            information such as your previous browsing on this and other sites, collected through
            cookies and similar technologies.
          </p>
          <p className="mt-2">
            <strong className="text-foreground">Non-personalized ads</strong> aren&apos;t based on
            your past behavior. They&apos;re chosen using things like the page you&apos;re viewing
            and your general location (for example, your city or region). Non-personalized ads still
            use cookies or similar identifiers for frequency capping, aggregated ad reporting, and to
            fight fraud and abuse.
          </p>
          <p className="mt-2">
            If you don&apos;t consent to personalized ads where consent is required, or if no choice
            has been recorded, Google may show non-personalized or limited ads instead.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">How to opt out of personalized advertising</h2>
          <p className="mt-2">You can turn off or adjust personalized advertising at any time:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Google:</strong> visit{" "}
              <a
              href="https://myadcenter.google.com/"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              My Ad Center
            </a>{" "}
              (formerly Ads Settings,{" "}
              <a
              href="https://adssettings.google.com/"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              adssettings.google.com
            </a>
              ) to turn off personalized ads from Google.
            </li>
            <li>
              <strong className="text-foreground">Many US-based ad companies:</strong> use the
              Digital Advertising Alliance&apos;s tool at{" "}
              <a
              href="https://www.aboutads.info/choices/"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              www.aboutads.info/choices
            </a>
              , or the Network Advertising Initiative&apos;s tool at{" "}
              <a
              href="https://optout.networkadvertising.org/"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              optout.networkadvertising.org
            </a>
              .
            </li>
            <li>
              <strong className="text-foreground">In Europe:</strong> use{" "}
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
              <strong className="text-foreground">In your browser:</strong> you can block or delete
              cookies in your browser settings. Blocking all cookies may also clear the lists
              you&apos;ve saved in ExesTools tools, because those are stored in your browser too.
            </li>
          </ul>
          <p className="mt-2">
            Opting out doesn&apos;t stop ads from appearing. It means the ads you see are less likely
            to be based on your interests.
          </p>
        </section>

        <section>
          <h2 id="consent-choices" className="text-lg font-bold text-foreground scroll-mt-24">
            Your consent choices (EEA, UK and Switzerland)
          </h2>
          <p className="mt-2">
            If you visit from the European Economic Area, the United Kingdom or Switzerland,
            ExesTools uses{" "}
            <strong className="text-foreground">Google&apos;s consent management platform</strong>{" "}
            (Google&apos;s European regulations message, which is registered with the IAB
            Transparency and Consent Framework) to ask for your consent before cookies or similar
            storage are used for personalized ads, ad measurement and analytics.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Until you make a choice,</strong> Google Consent
              Mode defaults deny advertising and analytics storage in these regions.
            </li>
            <li>
              <strong className="text-foreground">If you consent,</strong> Google and the listed
              vendors may use cookies for the purposes you agreed to.
            </li>
            <li>
              <strong className="text-foreground">If you don&apos;t consent,</strong> or only consent
              to some purposes, Google may show non-personalized or limited ads.
            </li>
            <li>
              <strong className="text-foreground">To change your choice later,</strong> use the{" "}
              <strong className="text-foreground">Privacy and cookie settings</strong> link at the
              bottom of every page. It reopens the consent message so you can update or withdraw
              consent at any time. Clearing this site&apos;s cookies in your browser also resets your
              choice.
            </li>
          </ul>
          <p className="mt-2">
            We do not use the names or options you type into the tools for advertising, and we do
            not send them to Google.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Children</h2>
          <p className="mt-2">
            ExesTools is designed for adults — teachers, parents, event hosts and organizers — and is
            not directed to children under 13. We do not offer accounts and we do not knowingly
            collect personal information from children. Names typed into a tool stay in your browser
            unless you choose to share a link. If you are a teacher, follow your school&apos;s policy
            on student data and consider using first names or initials.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Your privacy rights</h2>
          <p className="mt-2">
            ExesTools holds very little information about you. Lists and draws stay in your browser,
            and there are no accounts. The data that does exist is analytics data (Google Analytics
            4) and advertising data handled by Google and its partners.
          </p>
          <p className="mt-2">
            Depending on where you live, you may have the right to ask for access to personal
            information about you, to ask for it to be corrected or deleted, to object to certain
            uses, and to withdraw consent you gave earlier. To make a request about data ExesTools
            controls, email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}?subject=Privacy`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            with &quot;Privacy&quot; in the subject line. We&apos;ll reply within 30 days. For data
            Google holds, you can also use Google&apos;s own tools, such as{" "}
            <a
              href="https://myadcenter.google.com/"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              My Ad Center
            </a>{" "}
            and{" "}
            <a
              href="https://myaccount.google.com/data-and-privacy"
              className="font-semibold text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Google Account data controls
            </a>
            .
          </p>
          <p className="mt-2">
            Event data in Google Analytics 4 is retained for 14 months. It is then deleted
            automatically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Changes to this policy</h2>
          <p className="mt-2">
            When this policy changes, the &quot;Last updated&quot; date at the top of the page
            changes too. Significant changes, such as a new advertising partner or a new kind of
            data, will also be noted in the{" "}
            <Link href="/about#changelog" className="font-semibold text-accent hover:underline">
              About page changelog
            </Link>
            .
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
