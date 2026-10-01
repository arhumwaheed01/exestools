import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "About ExesTools | Free Spinner Wheel Tools",
  },
  description:
    "Who builds ExesTools, how its free spinner wheel and random picker tools choose results, and why your lists stay in your browser.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "About ExesTools",
    description:
      "Who builds ExesTools, how its free spinner wheel and random picker tools choose results, and why your lists stay in your browser.",
    url: absoluteUrl("/about"),
    images: [{ url: siteConfig.ogImagePath, width: 1200, height: 630, alt: "ExesTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About ExesTools",
    description:
      "Who builds ExesTools, how its free spinner wheel and random picker tools choose results, and why your lists stay in your browser.",
    images: [siteConfig.ogImagePath],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        About ExesTools
      </h1>
      <div className="mt-6 space-y-8 text-sm leading-relaxed text-muted sm:text-base">
        <p>
          ExesTools makes free online tools for everyday random picks: a{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            spinner wheel
          </Link>
          , a{" "}
          <Link href="/random-name-picker" className="font-semibold text-accent hover:underline">
            random name picker
          </Link>
          , a{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>
          , a{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel
          </Link>
          , a{" "}
          <Link href="/yes-no-wheel" className="font-semibold text-accent hover:underline">
            yes or no wheel
          </Link>
          , a{" "}
          <Link href="/random-number-wheel" className="font-semibold text-accent hover:underline">
            random number wheel
          </Link>{" "}
          and a{" "}
          <Link href="/random-team-generator" className="font-semibold text-accent hover:underline">
            random team generator
          </Link>
          . They run in your browser, with no account to create and nothing to install. ExesTools is
          not affiliated with the reverse-engineering forum that has a similar name.
        </p>

        <section>
          <h2 className="text-lg font-bold text-foreground">Who builds ExesTools</h2>
          <p className="mt-2">
            ExesTools is built and maintained by Arhum Waheed, a software engineer. He created the
            site so anyone can spin a fair wheel with their own text and settings, save it in the
            browser, share a link, or jump straight into ready-made tools for names, classrooms,
            prizes, yes-or-no decisions and teams.
          </p>
          <p className="mt-2">
            The site is actively developed: changes are checked before release, and automated tests
            cover important wheel and random-pick behaviour so what you see under the pointer stays
            honest.
          </p>
          <p className="mt-2">
            Found a problem or have an idea?{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Who uses ExesTools</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Teachers and students for classroom selection and activities</li>
            <li>Groups, teams and workplaces for low-stakes choices and games</li>
            <li>Streamers and creators for interactive on-screen wheels</li>
            <li>Friends and families for games, parties and everyday decisions</li>
          </ul>
        </section>

        <section>
          <h2 id="how-it-works" className="text-lg font-bold text-foreground">
            How ExesTools picks a result
          </h2>
          <p className="mt-2">
            Every pick uses your browser&apos;s secure random number generator (crypto.getRandomValues)
            with rejection sampling, so each option on the wheel has an equal chance. The wheel
            animation then stops on that result, so what you see under the pointer is always the pick.
            The team generator shuffles the whole list (Fisher–Yates) with the same generator, then
            deals names into teams. Nothing is decided by how hard or how long the wheel spins. Each
            spin is independent, so streaks can happen by chance; switch on Remove winner if you
            want every name picked once before any repeats.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Your lists stay in your browser</h2>
          <p className="mt-2">
            Your lists are saved only in your browser, on your device, not on our servers. Share links
            carry the list inside the link itself, so anyone with the link can see it. We use Google
            Analytics to count visits and tool use, but we never send the names or options you type.
            Read the{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">For teachers</h2>
          <p className="mt-2">
            Use the{" "}
            <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
              Classroom spinner
            </Link>{" "}
            for fair turn-taking with no account. Your class list stays in this browser, Remove winner
            makes sure everyone gets a turn before anyone repeats, and you can share a link to the
            same wheel when your school&apos;s policy allows. Questions or ideas from the classroom?{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact
            </Link>{" "}
            us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <p className="mt-2">
            Email{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-semibold text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="font-semibold text-accent hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
