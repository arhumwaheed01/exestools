---
route: /random-number-wheel
type: tool-page rewrite (new sections to add below the existing tool UI)
author: Arhum Waheed
author_url: /about#arhum
updated: 2026-10-13
placement: Insert these sections after the existing "Pick a number from 1 to 100" section and before the existing FAQ. Append the 4 new FAQs to the existing FAQ list. Keep every existing section; remove nothing.
---

By Arhum Waheed · Updated 2026-10-13

## Number wheel ideas

A number wheel is the most flexible picker on ExesTools, because almost anything can be numbered. Here are five setups that go beyond "pick a number," with the exact settings to use.

### 1. Raffle ticket numbers at a small event

You sold tickets 101 to 180 at a school stall. Set **Min** to 101 and **Max** to 180, switch on **No repeats**, and spin once per prize. Read each number out and wait for the holder to come forward before the next spin. If nobody claims a number, spin again: because No repeats is on, the unclaimed ticket is already out of the draw.

When the draw is over, press **Copy results**. It copies your last 20 numbers, so you can paste them straight into a message to the organising committee.

If some tickets in the book were never sold, this page can't leave them out. Use the [raffle generator](/raffle-generator), which has a Leave out list for unsold tickets, or reduce the range so it only covers the books you sold.

### 2. Homework or practice problem picker

A worksheet has 40 problems and you want students to do 6 of them, different for each class. Set Min 1 and Max 40, switch on No repeats, and spin six times. Write the numbers on the board as they come up.

Want only odd-numbered problems, because the answers are in the back of the book? Spin 1 to 20 instead and convert each result with *2n − 1*: a spin of 7 means problem 13, a spin of 20 means problem 39. Every odd problem from 1 to 39 is equally likely, because each one matches exactly one number on the wheel. For even problems, use *2n*.

### 3. A dice replacement, with honest odds

Tap **1–6** when a die goes missing. One spin gives the same odds as one fair die: each number has a 1 in 6 chance, about 16.7%.

Two dice are different, and this trips people up. A game that rolls two dice and adds them doesn't give every total the same chance. Spinning **1–12** once is *not* a replacement for two dice. Spin 1–6 twice and add the results instead. Here is why it matters:

| Total | Ways with two dice | Chance with two 1–6 spins | Chance with one 1–12 spin |
|---|---|---|---|
| 2 | 1 | 2.8% | 8.3% |
| 3 | 2 | 5.6% | 8.3% |
| 4 | 3 | 8.3% | 8.3% |
| 5 | 4 | 11.1% | 8.3% |
| 6 | 5 | 13.9% | 8.3% |
| 7 | 6 | 16.7% | 8.3% |
| 8 | 5 | 13.9% | 8.3% |
| 9 | 4 | 11.1% | 8.3% |
| 10 | 3 | 8.3% | 8.3% |
| 11 | 2 | 5.6% | 8.3% |
| 12 | 1 | 2.8% | 8.3% |
| 1 | 0 | 0% | 8.3% |

Board games are balanced around 7 being the most common total. Swap in a single 1–12 spin and a 2 or a 12 becomes three times as likely, and 1 becomes possible. Keep **No repeats** off for dice, since a die can roll the same number twice.

For a twenty-sided die in a tabletop role-playing game, tap **1–20**.

### 4. Lottery-style picks for games and classroom maths

For a "pick six numbers" game at a party or a probability lesson, set Min 1 and Max 49, switch on No repeats, and spin six times. Press Copy results to keep the set.

This is a good way to show a class how unlikely a jackpot is. The number of different six-number sets from 1 to 49 is 13,983,816, so any one set has a 1 in about 14 million chance. A wheel, a computer and a lucky birthday all pick sets with exactly the same odds. No method of choosing numbers improves them. The number wheel is for games and lessons; it doesn't predict anything.

### 5. Random page numbers

For a reading game, a "random page" writing prompt or picking where to start revising, set the range to the pages that actually have content. A novel with 312 pages whose first chapter starts on page 9 should be set to Min 9 and Max 312, so the front matter never comes up. Leave No repeats on if you're running a whole lesson of random-page prompts and don't want to repeat one.

[SCREENSHOT: The random number wheel with Min 9 and Max 312, No repeats on, and five results listed under Recent results.]

## A higher-or-lower game that teaches strategy

Spin a number from 1 to 100 without showing it, or have one player look away while another spins. Everyone else guesses, and the holder only answers "higher" or "lower."

It's a quick game, but it hides a neat piece of maths. If you always guess the middle of the numbers that are still possible (50, then 25 or 75, and so on), you halve the options with every guess. Since 2 multiplied by itself 7 times is 128, which is more than 100, the halving strategy always finds the number in **7 guesses or fewer**. For 1 to 1,000, it takes at most 10, because 2¹⁰ is 1,024.

Try it with a class: let students play a few rounds freely, count their guesses, then teach the halving strategy and play again. The drop in guesses is the lesson. It's an easy introduction to binary search for older students, and to number sense and place value for younger ones. Keep No repeats off between rounds, so a number can come up again just as it would in a fresh game.

## A worked example: three winners from 250 tickets

Say you sold 250 numbered tickets and you're drawing three prizes with No repeats on.

- **First spin:** every ticket has a 1 in 250 chance (0.4%).
- **Second spin:** one ticket is gone, so each remaining ticket has a 1 in 249 chance.
- **Third spin:** 1 in 248.

Over the whole draw, each ticket's chance of winning one of the three prizes is exactly 3 in 250, or 1.2%. That is the same for every ticket, whether it was sold first or last, and whether it's a "lucky-looking" number like 77 or a dull one like 143.

Someone who bought 5 of the 250 tickets has a chance of winning at least one prize of 1 − (245/250 × 244/249 × 243/248), which is about 5.9%. That's slightly under 5 × 1.2% = 6%, because the five tickets can't all win.

## Choosing a range that matches the job

A few small details save confusion:

- **Both ends are included.** Min 1 and Max 10 puts ten numbers on the wheel, 1 and 10 included. The count is always Max − Min + 1.
- **Up to 1,000 numbers fit in one range.** 1 to 1,000 works; so does 5,001 to 6,000. For bigger ticket ranges, use the raffle generator.
- **Negative numbers work.** −10 to 10 holds 21 numbers, including 0. That's useful for temperature or number-line games in a maths lesson.
- **Whole numbers only.** For a random decimal, spin a whole number and divide: 1 to 100 divided by 10 gives 0.1 to 10.0 in steps of 0.1.

## Numbers instead of names, for privacy

A number wheel is a simple way to pick people without typing anyone's name into a website. Give each person a number on paper, in a register or on a seating plan, and spin the range. Nothing on the page identifies anyone, and if you press **Copy share link**, the link only carries your range and settings, not a list of people.

This works well for:

- **Classes with a numbered register**, where every student already has a number.
- **Workshops and events**, using badge or seat numbers.
- **Online meetings**, where you can number participants in the order they appear and read out the result.

The trade-off is that the wheel shows "14" rather than "Priya," so someone has to look up who 14 is. If you'd rather see names and your school or workplace is comfortable with that, the [classroom spinner](/classroom-spinner) and the name picker do the same job with names on the slices.

## When to turn No repeats on

Ask one question: *should the same number be able to come up twice?*

- **Yes, it should** for dice, guessing games and anything where each spin stands alone. Leave No repeats off.
- **No, it shouldn't** for tickets, seats, questions, problems and bingo calls. Switch it on. The wheel works through the range and tells you when it's empty, with Reset draws to start again.

If you change your mind halfway through a draw, finish the round first. Switching modes partway makes it hard to explain to anyone watching which numbers were still in play.

## Frequently asked questions

### Can I pick a number between 1 and 1000?

Yes. Tap the **1–1000** quick range, or type Min 1 and Max 1000, then press SPIN. Each number has a 1 in 1,000 chance. That is the largest range the wheel holds; for bigger ranges, use the raffle generator.

### How do I pick several numbers without repeats?

Switch on **No repeats** and spin once for each number you need. Each result leaves the wheel until you press **Reset draws**. Your last 20 results are listed under Recent results, and **Copy results** copies them so you can paste the list anywhere.

### Is every number equally likely?

Yes. Each spin picks one whole number from the numbers still on the wheel with your browser's secure random number generator, and every one of them has the same chance. With No repeats on, the remaining numbers become more likely as drawn numbers leave, but they stay equal to each other.

### Can I skip certain numbers?

Not directly. This page doesn't have an option to exclude individual numbers from a range. You can narrow the range, convert results (spin 1–20 and use 2n − 1 for odd numbers only), put the exact numbers you want on the [spinner wheel](/) one per line (up to 60), or use the raffle generator's Leave out list for ticket numbers.
