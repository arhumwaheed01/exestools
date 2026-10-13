---
route: /about
type: full replacement of the main content (keep the existing <h2 id="how-it-works"> anchor; add id="arhum" to the author section)
meta_title: "About ExesTools: Who Builds It, How Picks Work, Editorial Policy"
meta_description: "ExesTools is a set of free random-pick tools built by Arhum Waheed. How results are picked, why your lists stay in your browser, how ads keep it free, and how our guides are written."
updated: 2026-10-13
---

# About ExesTools

ExesTools makes free online tools for everyday random picks: a [spinner wheel](/), a [random name picker](/random-name-picker), a [classroom spinner](/classroom-spinner), a [prize wheel](/prize-wheel), a [yes or no wheel](/yes-no-wheel), a [random number wheel](/random-number-wheel), a [random team generator](/random-team-generator), a [Secret Santa generator](/secret-santa-generator), a [raffle generator](/raffle-generator) and a [bingo card generator](/bingo-card-generator). They run in your browser, with no account to create and nothing to install. Alongside the tools, the [Guides](/guides) section has longer articles on running giveaways, calling on students, making teams and more.

ExesTools is not affiliated with the reverse-engineering forum that has a similar name.

## Who builds ExesTools {#arhum}

[ARHUM: fill — headshot, 400×400, alt text "Arhum Waheed"]

ExesTools is built and maintained by **Arhum Waheed**, a software engineer based in Karachi, Pakistan. [ARHUM: fill — one or two sentences on your background, e.g. years of experience and the kind of software you work on.]

He started ExesTools so that anyone could spin a fair wheel with their own text and settings, save it in the browser, share a link, or go straight to a ready-made tool for names, classrooms, prizes, yes-or-no decisions and teams. Each tool is set up for one job, with its own presets and limits, rather than one general wheel stretched to cover everything. [ARHUM: fill — optional one sentence on the moment or problem that made you build it.]

He writes the code and the guides on this site himself. The site is actively developed: changes are checked before release, and automated tests cover important wheel and random-pick behaviour, so what you see under the pointer stays honest.

- LinkedIn: [ARHUM: fill]
- GitHub: [ARHUM: fill]
- Email: [hello@exestools.com](mailto:hello@exestools.com)

## Who uses ExesTools

- **Teachers and students**, for calling on students, classroom jobs, groups and review games.
- **Groups, teams and workplaces**, for meeting order, door prizes and gift exchanges.
- **Streamers and creators**, for on-screen giveaways and viewer picks.
- **Friends and families**, for games, parties and everyday decisions.

## How ExesTools picks a result {#how-it-works}

Every pick uses your browser's secure random number generator (`crypto.getRandomValues`) with rejection sampling, so each option still on the wheel has exactly the same chance. The result is chosen first, and the wheel animation then stops on it, so the slice under the pointer is always the pick. Nothing is decided by how long or how hard the wheel spins. Cosmetic details such as the exact spin duration and the spin sound use the browser's ordinary random function; they can't change the result.

Each spin is independent, so streaks happen by chance. Switch on Remove winner if you want every name picked once before any repeats.

- **Team generator:** shuffles the whole list with a Fisher–Yates shuffle using the same generator, then deals names into teams.
- **Secret Santa generator:** first checks that a valid draw exists for your exclusions, then shuffles with the same generator until everyone has someone they're allowed to draw. For heavily restricted lists it falls back to a backtracking search. Nobody can draw themselves.
- **Raffle generator:** draws one ticket at a time from the tickets still in the draw, so someone with three tickets is exactly three times as likely as someone with one to win that pick. By default, a winner's other tickets leave the draw.
- **Bingo card generator:** builds cards from a short set code, so the same code always makes the same cards, and every card in a set is checked to be different. Its caller uses the secure generator separately and never repeats a call within a game.

ExesTools is a free random picker, not a certified drawing service. For the longer version, with worked examples, read [How random is a spinner wheel?](/guides/how-random-is-a-spinner-wheel)

## Your lists stay in your browser

Your lists are saved only in your browser, on your device, not on our servers. Share links carry the list inside the link itself, so anyone with the link can see it. We use Google Analytics to count visits and tool use, but we never send the names or options you type. See the [Privacy Policy](/privacy-policy) for details.

## How ExesTools is paid for

ExesTools is free, and it is paid for by ads from Google AdSense on some pages. Visitors in the EEA, the UK and Switzerland are asked for consent before ads use cookies for personalisation.

Ads don't decide what we build or write. Advertisers have no say in the tools, the guides or how results are picked, and the text you type into a tool is never used for advertising. [ARHUM: confirm — "ExesTools does not accept paid placements or sponsored guides."]

## Editorial policy

The guides on ExesTools are written to help you do something specific: run a draw people trust, call on students fairly, set up a gift exchange. This is how they're made.

- **Written by a named author.** Every guide carries a byline and a published date. Today, all guides are written by Arhum Waheed.
- **Checked against the live tools.** Any feature a guide mentions is checked against the live tool page on the publish date. If a tool changes, the guide is updated and its "Updated" date changes.
- **Maths shown, not asserted.** Where a guide gives odds or percentages, it shows the working so you can check it.
- **Sources linked.** Research and outside claims are named and cited. We don't invent statistics or testimonials.
- **Honest limits.** Guides say what the tools don't do, and they don't present ExesTools as a certified or legally compliant drawing service.
- **Not professional advice.** Guides about raffles, giveaways or classrooms are practical tips, not legal advice. Check the rules that apply where you are.
- **Corrections.** Spotted a mistake? Email [hello@exestools.com](mailto:hello@exestools.com) with the page address. Corrections are made on the page and the Updated date changes.

## Changelog

Major changes to the site, newest first.

- **2026-10-13:** Guides section launched, starting with *How to run a fair online giveaway*. [ARHUM: adjust to the date each guide actually goes live]
- **2026-10-13:** Number wheel and classroom spinner pages expanded with new examples and FAQs; author bylines and updated dates added to tool pages. [ARHUM: adjust to deploy date]
- **2026-10-12:** Terms of Service and Contact page updated.
- **[ARHUM: fill date]:** Older developer tools (JWT decoder, blog title generator) removed so the site could focus on random-pick tools.
- **[ARHUM: fill date]:** Bingo card generator launched, with printable cards, player links, a caller and a card checker.
- **[ARHUM: fill date]:** Raffle generator launched, with multiple tickets per person, alternates and a draw record.
- **[ARHUM: fill date]:** Secret Santa generator launched, with exclusions and private reveal links.
- **[ARHUM: fill date]:** Random team generator launched.
- **[ARHUM: fill date]:** ExesTools launched with the spinner wheel. [ARHUM: list the other wheels if they launched separately]

## For teachers

Use the [classroom spinner](/classroom-spinner) for fair turn-taking with no account. Your class list stays in this browser, Remove winner makes sure everyone gets a turn before anyone repeats, and you can share a link to the same wheel when your school's policy allows. For a full routine, see [Fair ways to call on students](/guides/cold-calling-students-fairly).

## Contact

Found a problem or have an idea? Email [hello@exestools.com](mailto:hello@exestools.com) or use the [Contact page](/contact).
