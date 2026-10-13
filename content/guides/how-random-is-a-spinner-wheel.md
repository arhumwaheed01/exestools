---
slug: /guides/how-random-is-a-spinner-wheel
meta_title: "How Random Is a Spinner Wheel? An Honest Look at Online Pickers | ExesTools"
meta_description: "How online spinner wheels pick a result, the difference between Math.random and crypto.getRandomValues, why streaks happen, and what a free picker can and can't prove."
author: Arhum Waheed
author_url: /about#arhum
published: "2026-10-13"
updated: "2026-10-13"
related_tools: [/, /random-number-wheel, /yes-no-wheel, /random-team-generator, /raffle-generator]
---

# How random is a spinner wheel? An honest explanation

By Arhum Waheed · Published 2026-10-13 · Updated 2026-10-13

"Is this wheel rigged?" is a fair question to ask of any online picker, including mine. A spinning wheel looks physical, but on a screen it is code, and code does exactly what it was written to do. This guide explains how the ExesTools wheels pick a result, what kind of randomness that is, why streaks that look suspicious are normal, and where the honest limits are. It doesn't claim any certification, because there isn't one.

## Two ways an online wheel can work

There are two basic designs.

**Physics first.** The wheel gets a random push, a simulated friction slows it down, and whatever slice ends up under the pointer is the result. This feels realistic, but fairness depends on the physics code. Small rounding effects, or a starting angle that isn't random, can make some slices land more often.

**Result first.** The code picks a winner directly, with equal chances for every option, and then animates the wheel so it stops on that slice. The animation is decoration. This is how ExesTools works: the pick is made first, the wheel then turns to land on it, and the slice under the pointer is always the result. How long or how hard the wheel spins changes nothing.

Result-first is easier to reason about, because fairness comes down to one question: is the number generator fair, and is it used correctly?

## Math.random vs crypto.getRandomValues

Browsers give JavaScript two common sources of random numbers.

**`Math.random()`** returns a number between 0 and 1. It's fast and fine for games and animations, but the JavaScript specification doesn't require any particular quality. Modern browsers use decent algorithms, but they are designed for speed, not unpredictability, and in principle their output can be predicted if you observe enough of it.

**`crypto.getRandomValues()`** is part of the Web Crypto API. It fills an array with random values from a cryptographically strong generator that the browser seeds from the operating system. It's the same source browsers use for security work. For picking a name off a list, it is more than strong enough.

I looked through the code that ships on ExesTools to describe this accurately. The function that makes every pick uses `crypto.getRandomValues`, and if that function isn't available, it stops with an error rather than quietly falling back to something weaker. `Math.random()` does appear in the site, but only for cosmetic things: how long the spin animation runs within the Short, Normal or Long setting you choose, the texture of the spin sound, and the little celebration effect after a result. None of those can change which option is picked, because the pick has already been made.

![The ExesTools spinner wheel with Spin length options Short, Normal and Long visible. Spin length changes the animation, not the odds.](/guides/how-random-is-a-spinner-wheel/1.png)

## Getting from a random number to a fair pick

A random number generator produces large integers. Turning one into "pick 1 of 7 names" sounds trivial, and it's where a lot of pickers quietly go wrong.

### The modulo trap

The obvious approach is "random number, remainder after dividing by 7." The problem is that the range of random numbers rarely divides evenly. Here's a tiny example with a random byte, 0 to 255, and 10 options:

- 256 values ÷ 10 options = 25 full sets, with 6 values left over.
- Those 6 leftover values (250 to 255) map to options 0 to 5.
- So options 0 to 5 each get 26 chances out of 256, and options 6 to 9 get 25.

That is a bias of about 4%. With 32-bit numbers the bias is tiny, but it isn't zero.

### Rejection sampling

The fix is to throw away the leftover values. ExesTools draws a 32-bit random number, works out the largest multiple of your option count that fits in 32 bits, and if the number lands above that line, it draws again. Then it takes the remainder. Every option gets exactly the same number of possible values, so every option has exactly the same chance. For a 60-name wheel, a redraw is needed about 4 times in a billion picks; even for a 10,000-ticket raffle it's roughly once in 590,000. It costs nothing in practice.

### Shuffling: Fisher–Yates

The [random team generator](/random-team-generator) needs a whole random order, not a single pick. It uses the Fisher–Yates shuffle: walk backwards through the list, and at each position swap in a random item from the ones not yet placed, using the same fair pick. Done this way, every possible order of the list is equally likely. The common shortcut of "sort by a random number" doesn't guarantee that.

## Why streaks happen, and why they're normal

Most "it's rigged" complaints are about streaks. Real randomness produces more of them than people expect.

**Same name twice in a row.** On a 10-name wheel, the chance the next spin repeats the last result is 1 in 10. If you spin 20 times, you should expect a back-to-back repeat about twice.

**Any repeat at all.** Spin a 10-name wheel 5 times. The chance all five results are different is (10 × 9 × 8 × 7 × 6) / 10⁵ = 30.24%. So about 70% of the time, someone comes up twice in five spins.

**Someone never comes up.** On a 30-name wheel spun 30 times, each person has (29/30)^30 ≈ 36% chance of never being picked. That means around 11 people left out, with others picked two or three times. Nothing is wrong with the wheel.

**Yes three times running.** On the [yes or no wheel](/yes-no-wheel), three Yes answers in a row has a 1 in 8 chance from any starting point. After three Yes results, the next spin is still 50/50.

If repeats are a problem for what you're doing, the fix isn't a "more random" wheel. It's switching on **Remove winner after spin (no repeats)**, so each result leaves the wheel. On the [random number wheel](/random-number-wheel), the same idea is the **No repeats** switch.

## Check it yourself

You don't have to take my word for any of this. The yes or no wheel has a counter under it. Spin it 100 times and look at the split.

With a fair 50/50 wheel, the expected result is 50 Yes. The standard deviation for 100 spins is √(100 × 0.5 × 0.5) = 5. So about 95% of the time you'll see between 40 and 60 Yes. A result of 55–45 is completely ordinary. A result of 75–25 would be a real warning sign (the odds of that from a fair wheel are well under 1 in 100,000).

For a bigger check, use the random number wheel on 1–6, press **Copy results** after every 20 spins (it keeps your last 20), and tally a few hundred rolls in a spreadsheet. Each number should land near one sixth of the time, with the same kind of wobble.

## What this doesn't prove

Here are the limits, stated plainly.

- **It isn't certified.** ExesTools hasn't been tested by a certification body or audited independently. If a law, a platform or a sponsor requires a certified draw, use one.
- **The generator belongs to your browser.** The quality of `crypto.getRandomValues` depends on the browser and operating system you use. Modern browsers are held to a high standard here, but that standard is theirs, not mine.
- **Nothing is stored on a server.** Picks happen on your device, and ExesTools doesn't keep a copy, so it can't confirm a result afterwards. To prove a draw happened, record your screen or spin live.
- **A fair picker can't fix an unfair list.** If someone is missing from the list, or appears in a way that gives them an edge, the pick will be perfectly random and still unfair. The [raffle generator](/raffle-generator) shows a list fingerprint that proves the list didn't change after you published it; it doesn't prove how the winner was picked.

## Frequently asked questions

### Does spinning harder or longer change the result?

No. On ExesTools the result is picked first, and the wheel animation then stops on it. The spin length setting only changes how long the animation runs.

### Is Math.random good enough for a spinner wheel?

For casual use, usually yes. ExesTools uses crypto.getRandomValues for every pick anyway, because it's a stronger source and costs nothing extra. Math.random is only used for visual and sound effects.

### Why did the same name come up three times?

Because with names left on the wheel, each spin is independent and repeats are normal. Switch on Remove winner after spin if each name should come up only once.

### Can a spinner wheel be used for a legal raffle or lottery?

ExesTools isn't a certified drawing service. Raffle and lottery rules vary by place, and some require a licence or a certified draw. Check the rules that apply to you.

### How can I check the wheel is fair?

Spin the yes or no wheel 100 times and look at the counter. A fair wheel lands between about 40 and 60 Yes in roughly 95% of runs.
