import type { Metadata } from "next";
import Link from "next/link";
import { NamePickerTool } from "@/components/name-picker/NamePickerTool";
import { ToolPageShot } from "@/components/tools/ToolPageShot";
import { GuideSection, UseCaseToolPage } from "@/components/UseCaseToolPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { toolOpenGraph } from "@/lib/seo/jsonld";

const TITLE = "Random Name Picker Wheel – Free, Remove Winner | ExesTools";
const META =
  "Draw several names from a list at once, put a whole list in random order, or spin the wheel for one. Up to 60 names, copy or print the result. Free.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: META,
  alternates: { canonical: absoluteUrl("/random-name-picker") },
  openGraph: toolOpenGraph({
    title: TITLE,
    description: META,
    url: absoluteUrl("/random-name-picker"),
    imagePath: siteConfig.ogImagePath,
    imageAlt: "ExesTools Spinner Wheel",
  }),
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META,
    images: [siteConfig.ogImagePath],
  },
};

const FAQS = [
  {
    q: "How do I pick several random names at once?",
    a: "Choose Draw a list, type how many names you want, and press the draw button. You get a numbered list of that many names with no repeats.",
  },
  {
    q: "How do I get a full speaking order?",
    a: "Press Put the whole list in random order. Every name appears once, numbered from 1, ready to copy or print.",
  },
  {
    q: "Can the same name come up twice in one draw?",
    a: "No. Each draw takes names without replacement, so a name that is drawn is not drawn again in that list. Draw again to get a fresh list from all names.",
  },
  {
    q: "How do I pick just one name?",
    a: "Open the Spin one tab, then tap Spin (Space works too). The pointer stops on a single name. Keep Remove winner after spin on if you do not want repeats.",
  },
  {
    q: "How many names can I add?",
    a: "Up to 60. The same list feeds both Draw a list and Spin one.",
  },
  {
    q: "Can I share my list?",
    a: "Yes. In Spin one, press Share to copy a link that opens the same list on another device. In Draw a list, use Copy list to paste the result into chat or email.",
  },
  {
    q: "Is it free? Is my list saved?",
    a: "Free, no account, and the list stays in your browser.",
  },
];

export default function RandomNamePickerPage() {
  return (
    <UseCaseToolPage
      toolId="random-name-picker"
      breadcrumbLabel="Random name picker"
      title="Random Name Picker Wheel"
      intro="Pick several names at once, or put the whole list in a random speaking order in one click. Paste up to 60 names, say how many you need, and get a numbered list you can copy or print. Prefer drama? Switch to Spin one and let the wheel choose a single name. Free, with no account."
      faqs={FAQS}
      schemaName="Random Name Picker Wheel"
      schemaDescription={META}
      pageUpdated="2026-11-24"
      toolSlot={<NamePickerTool />}
    >
      <GuideSection title="How to draw a list of names">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Choose <span className="font-semibold text-foreground">Draw a list</span> and replace
            the sample names with your own. Paste a column from a spreadsheet if that is easier.
          </li>
          <li>
            Set <span className="font-semibold text-foreground">How many names?</span> to the number
            you need, from 1 up to the length of your list, then press the draw button. The default
            is 3.
          </li>
          <li>
            Need everyone in order instead? Press{" "}
            <span className="font-semibold text-foreground">
              Put the whole list in random order
            </span>
            . Each name appears once, numbered 1., 2., 3. and so on.
          </li>
          <li>
            Use <span className="font-semibold text-foreground">Copy list</span> to paste the
            numbered result into chat, or <span className="font-semibold text-foreground">Print</span>{" "}
            to put it on paper. Press the draw button again for a fresh draw from the full list.
          </li>
        </ol>
      </GuideSection>

      <GuideSection title="Draw a list or spin one">
        <p>
          <span className="font-semibold text-foreground">Draw a list</span> is for getting several
          answers in one go: three presenters, a full running order, or the first five people to
          answer. <span className="font-semibold text-foreground">Spin one</span> is for a single
          name with a bit of suspense, and it keeps the wheel, share link and remove-winner options.
          Both modes use the same list, so edit it once and switch freely.
        </p>
        <p>
          If you only ever need one choice from a mixed set of options, the{" "}
          <Link href="/" className="font-semibold text-accent hover:underline">
            main spinner wheel
          </Link>{" "}
          is built for that.
        </p>
      </GuideSection>

      <GuideSection title="Name picker vs classroom spinner">
        <p>
          Both tools work from a list of names. This random name picker opens as a general list
          tool: sample names, meeting and party examples, and no classroom framing. The{" "}
          <Link href="/classroom-spinner" className="font-semibold text-accent hover:underline">
            classroom spinner
          </Link>{" "}
          opens with a sample roster, teacher example wheels (jobs, brain breaks, reading groups),
          and copy written for cold calling and projectors.
        </p>
        <p className="mt-3">
          Use this page when you want a drawn list: standups, workshops, raffles by name,
          icebreakers, and &quot;who goes first&quot; at a party. Use the classroom page when the
          list is a class and you want the teacher-oriented examples and wording.
        </p>
      </GuideSection>

      <GuideSection title="Where drawing a list earns its keep">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-semibold text-foreground">Full speaking order.</span> Paste the
            team, press Put the whole list in random order, and paste the numbered result into the
            chat before anyone speaks. Same trick for stand-ups, round-robin reviews and demo days.
          </li>
          <li>
            <span className="font-semibold text-foreground">Three presenters from fourteen.</span>{" "}
            Set How many names? to 3 and press draw. One click, no repeats.
          </li>
          <li>
            <span className="font-semibold text-foreground">Cold-calling in class.</span> Draw the
            next five students to be asked, and do another draw tomorrow. See{" "}
            <Link
              href="/guides/cold-calling-students-fairly"
              className="font-semibold text-accent hover:underline"
            >
              calling on students fairly
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">White elephant turn order.</span>{" "}
            Put the whole list in random order and play in that order. Steal limits and freeze rules
            are in{" "}
            <Link
              href="/guides/white-elephant-rules-and-variations"
              className="font-semibold text-accent hover:underline"
            >
              White Elephant rules
            </Link>
            .
          </li>
          <li>
            <span className="font-semibold text-foreground">Small giveaway.</span> For 1–3 winners
            from a short comment list, draw that many names. For ticket books or alternates, use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="How a list draw works">
        <p>
          Each line in your list is one name. When you press a draw button, the whole list is put in
          a random order and the first names are taken from the top. A name that is drawn cannot be
          drawn again in the same list. Asking for all names gives you the full list in random
          order, with the last name going last.
        </p>
        <p>
          The order comes from your browser&apos;s secure random number generator using a
          Fisher–Yates shuffle, so every possible order is equally likely and a name&apos;s position
          in your list does not matter. The list holds up to 60 names. If two lines are the same
          (capital letters do not count as different), the repeat is skipped, so add an initial when
          two people share a name.
        </p>
      </GuideSection>

      <GuideSection title="Three presenters from fourteen">
        <p>
          A workshop has 14 attendees and time for three short presentations. Paste the 14 names,
          set How many names? to 3, and press the draw button.
        </p>
        <ToolPageShot
          src="/tools/random-name-picker/1.webp"
          alt="Random name picker in Draw a list mode, showing three presenters drawn in order from a list of fourteen names."
        />
        <ul className="list-disc space-y-2 pl-5">
          <li>The first name drawn had a 1 in 14 chance.</li>
          <li>The second is drawn from the 13 left, so 1 in 13 for each of them.</li>
          <li>The third is drawn from the 12 left, so 1 in 12.</li>
        </ul>
        <p>
          Across the draw, every attendee has the same overall chance of being picked: 3 in 14, or
          about 21%. Not happy with the result? Draw again for a new list.
        </p>
        <p>
          Press <span className="font-semibold text-foreground">Copy list</span> and the three names
          are on your clipboard as 1., 2., 3., ready for the chat.
        </p>
      </GuideSection>

      <GuideSection title="Spin one: when a single name is enough">
        <p>
          Open the Spin one tab for the wheel view. Tap Spin (or hit Space) and the name under the
          pointer is your pick. With Remove winner after spin on, that name leaves the rim until you
          restore the list. Sound and spin length live in the ⋮ menu, and Share copies a link that
          opens the same roster on another device.
        </p>
      </GuideSection>

      <GuideSection title="Tips">
        <ul className="list-disc space-y-2 pl-5">
          <li>Copy the list before you draw so you can paste it back for the next session.</li>
          <li>
            More than 60 names? Split them across two lists, or use the{" "}
            <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
              raffle generator
            </Link>
            .
          </li>
          <li>
            Need the whole room in groups rather than one ordered list?{" "}
            <Link
              href="/random-team-generator"
              className="font-semibold text-accent hover:underline"
            >
              Random team generator
            </Link>
            .
          </li>
        </ul>
      </GuideSection>
      <GuideSection title="Compared with the big wheel sites">
        <p>
          Bigger wheel sites offer themes, images and huge lists, and mostly give you one name per
          spin. ExesTools keeps it small: one list, a draw-several mode, a wheel for single picks,
          and sister tools for{" "}
          <Link href="/random-team-generator" className="font-semibold text-accent hover:underline">
            teams
          </Link>
          ,{" "}
          <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
            raffles
          </Link>{" "}
          and{" "}
          <Link href="/secret-santa-generator" className="font-semibold text-accent hover:underline">
            Secret Santa
          </Link>{" "}
          on the same site. Spinning for prizes rather than names? Try the{" "}
          <Link href="/prize-wheel" className="font-semibold text-accent hover:underline">
            prize wheel spinner
          </Link>
          .
        </p>
      </GuideSection>
      <GuideSection title="Privacy">
        <p>
          Your list is saved in this browser on this device, not on our servers. A share link
          contains the names themselves, so don&apos;t share lists that include sensitive
          information. Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </GuideSection>
    </UseCaseToolPage>
  );
}
