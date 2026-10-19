import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const CONTACT_TITLE = "Contact ExesTools | Bug Reports, Ideas, Privacy and Corrections";
const CONTACT_META =
  "How to reach the person who builds ExesTools: what to include in a bug report, privacy and data requests, corrections to guides, ad concerns and copyright notices.";

export const metadata: Metadata = {
  title: { absolute: CONTACT_TITLE },
  description: CONTACT_META,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: toolOpenGraph({
    title: CONTACT_TITLE,
    description: CONTACT_META,
    url: absoluteUrl("/contact"),
    imagePath: siteConfig.ogImagePath,
  }),
  twitter: {
    card: "summary_large_image",
    title: CONTACT_TITLE,
    description: CONTACT_META,
    images: [siteConfig.ogImagePath],
  },
};

const MAIL = "mailto:hello@exestools.com";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Contact ExesTools</h1>
      <p className="mt-2 text-sm text-muted">Last updated: October 19, 2026</p>
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        ExesTools is built and run by one person,{" "}
        <Link href="/about#arhum" className="font-semibold text-accent hover:underline">
          Arhum Waheed
        </Link>
        . Every message to{" "}
        <a
          href={`${MAIL}?subject=ExesTools%20question`}
          className="font-semibold text-accent hover:underline"
        >
          hello@exestools.com
        </a>{" "}
        is read by him, not by a ticket system. Replies usually arrive within two business days,
        and often sooner.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Before you write: three quick answers</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          A lot of emails ask the same things, so here are the answers up front.
        </p>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
          <div>
            <p className="font-semibold text-foreground">
              &quot;I lost my list. Can you get it back?&quot;
            </p>
            <p className="mt-1">
              Unfortunately not. Your lists are saved only in your own browser, on your own device.
              They&apos;re never uploaded to ExesTools, so there&apos;s no copy to restore. If you
              cleared your browser data or switched devices, the list is gone. Next time, press{" "}
              <span className="font-semibold text-foreground">Copy share link</span> and save the
              link: it carries the list inside it.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              &quot;Can you confirm who won a draw I ran?&quot;
            </p>
            <p className="mt-1">
              No. Draws happen in your browser and aren&apos;t stored on a server. If you need a
              record, record your screen or write the results down when you draw.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              &quot;Can you send the Secret Santa links for me?&quot;
            </p>
            <p className="mt-1">
              ExesTools doesn&apos;t collect email addresses or send messages. You copy each private
              link and send it yourself, by text, chat or email.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">What to write about</h2>
        <div className="mt-3 space-y-5 text-sm leading-relaxed text-muted sm:text-base">
          <div>
            <h3 className="font-semibold text-foreground">Something isn&apos;t working</h3>
            <p className="mt-1">
              Tell us which page you were on, what you did, what you expected, and what happened
              instead. Your browser and device help a lot. A screenshot is great. Please don&apos;t
              paste a real class roster or guest list; a short example like &quot;Ana, Ben, Cal&quot;
              is enough to reproduce most problems.{" "}
              <a
                href={`${MAIL}?subject=Bug%20report`}
                className="font-semibold text-accent hover:underline"
              >
                Email a bug report
              </a>
              .
            </p>
            <p className="mt-3">You can copy this into your email:</p>
            <blockquote className="mt-2 space-y-1 border-l-4 border-accent/40 pl-4">
              <p>
                <span className="font-semibold text-foreground">Page:</span> (for example,
                https://www.exestools.com/raffle-generator)
              </p>
              <p>
                <span className="font-semibold text-foreground">Device and browser:</span> (for
                example, iPhone 15, Safari)
              </p>
              <p>
                <span className="font-semibold text-foreground">What I did:</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">What I expected:</span>
              </p>
              <p>
                <span className="font-semibold text-foreground">What happened:</span>
              </p>
            </blockquote>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">An idea or a feature request</h3>
            <p className="mt-1">
              Describe the job you&apos;re trying to get done (a class, a giveaway, a party, an
              office event) rather than the button you want. &quot;I need to draw 3 winners from a
              sign-up sheet at a school fair&quot; helps more than &quot;add a button.&quot; Every
              request is read, though not every one can be built.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">A mistake in a guide</h3>
            <p className="mt-1">
              If a guide says something that&apos;s wrong or out of date, send the page address and
              the sentence. Corrections are made on the page itself, and the &quot;Updated&quot;
              date changes so readers can see it was revised.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Privacy and data</h3>
            <p className="mt-1">
              Read the{" "}
              <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
                Privacy Policy
              </Link>{" "}
              first; it explains what&apos;s stored in your browser and what isn&apos;t. For
              questions about analytics or advertising data, or for an access or deletion request,
              email with{" "}
              <span className="font-semibold text-foreground">&quot;Privacy&quot;</span> in the
              subject line.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">A problem with an ad</h3>
            <p className="mt-1">
              ExesTools shows ads from Google AdSense on some pages. If you see an ad that&apos;s
              offensive, misleading or inappropriate next to a tool used in classrooms, email the
              page address and a short description of the ad (a screenshot helps), and it will be
              looked into for blocking. You can also manage the ads Google shows you in{" "}
              <a
                href="https://myadcenter.google.com/"
                className="font-semibold text-accent hover:underline"
                rel="noopener noreferrer"
              >
                My Ad Center
              </a>
              .
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Copyright</h3>
            <p className="mt-1">
              Please follow the checklist on the{" "}
              <Link href="/dmca" className="font-semibold text-accent hover:underline">
                DMCA page
              </Link>{" "}
              so your notice can be reviewed quickly.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Press, schools and partnerships</h3>
            <p className="mt-1">
              Say who you are, how you use ExesTools, and what you need. ExesTools doesn&apos;t
              accept paid placements or sponsored guides.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">A note about student and employee data</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          ExesTools is designed so your lists stay on your device. Please keep it that way: don&apos;t
          email full student rosters, employee lists or guest lists. If an example is needed to fix
          a bug, made-up names work just as well.
        </p>
      </section>

      <p className="mt-6 text-sm text-muted">
        Want to know more about who builds the site and how? Read{" "}
        <Link href="/about" className="font-semibold text-accent hover:underline">
          About ExesTools
        </Link>
        , or go back to the{" "}
        <Link href="/" className="font-semibold text-accent hover:underline">
          spinner wheel
        </Link>
        .
      </p>
    </div>
  );
}
