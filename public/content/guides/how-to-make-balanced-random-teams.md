---
slug: /guides/how-to-make-balanced-random-teams
meta_title: "How to Make Balanced Random Teams (Odd Numbers, Pairs, Skill Tiers) | ExesTools"
meta_description: "How to split a group into fair teams: even sizes with odd numbers, pairs with a leftover person, captains vs random picks, and a simple tiered method for mixing skill levels."
author: Arhum Waheed
author_url: /about#arhum
published: 2026-10-13
updated: 2026-10-13
related_tools: [/random-team-generator, /classroom-spinner, /random-name-picker]
---

# How to make balanced teams

By Arhum Waheed · Published 2026-10-13 · Updated 2026-10-13

"Balanced" means different things to different people. A PE teacher wants teams that can actually compete. A workshop host wants each table to mix departments. A parent at a birthday party just wants nobody to be picked last. A random split handles some of this well and some of it not at all, and it helps to know which is which before you start.

This guide explains the maths of even sizes, the honest limits of random teams, and a simple tiered method that gets you most of the way to skill-balanced teams using the [random team generator](/random-team-generator).

## Two kinds of balance

**Size balance** means teams are the same size, or as close as possible. That is pure arithmetic, and a generator can guarantee it.

**Skill balance** means teams are roughly equal in ability, height, experience, or whatever matters for the activity. No random tool knows who is good at football or who writes clearly. The ExesTools team generator doesn't rank people by skill or keep anyone apart with rules. It shuffles the full list and deals names into teams like dealing cards. So skill balance is something you set up in how you use the tool, not something the tool does for you.

## Size balance: what happens with odd numbers

The generator keeps team sizes as even as possible, never more than one person apart. You can choose either:

- **Number of teams** (2 to 50): the tool works out the size.
- **People per team** (1 to 100): the tool works out how many teams.

Some real cases:

| Group | Setting | Result |
|---|---|---|
| 25 people | 4 teams | 7, 6, 6, 6 |
| 11 people | 3 teams | 4, 4, 3 |
| 26 students | 4 per team | five groups of 4 and two groups of 3 |
| 30 people | 3 per team | ten groups of 3 |
| 17 students | Pairs | seven pairs and one group of 3 |

That last row is a choice. With Pairs and an odd roster, one pair becomes a trio so nobody is left out. Switch on **Leave one person out** if you need strict pairs, for example a doubles match, and the extra person sits out the round. Rotate who sits out by hand, or use the [random name picker](/random-name-picker) to pick them so it's not the same person every time.

[SCREENSHOT: The random team generator showing 25 names split into 4 team cards with counts 7, 6, 6, 6.]

## Random teams vs captains

Captain picks are quick and familiar, and they have a well-known cost: the same people get picked last, in public, every time. For most classrooms and casual games, that cost is not worth it.

Random teams avoid the public ranking, but they can produce a lopsided split by chance. That is not a bug; it is what random means. With 24 players in 4 teams of 6, two specific friends land on the same team with probability 5/23, about 22%. Two strong players land together just as often.

If a split looks lopsided, press **Reshuffle**. Each reshuffle is a completely new random deal using the same list and settings. Be honest with yourself about why you're reshuffling, though. Reshuffling until you get the teams you secretly wanted is just captain picking with extra steps. A good rule for groups: agree before the first deal that you'll accept it, or that you'll allow one reshuffle at most.

### A middle path: the snake draft

If you do use captains, a snake draft is fairer than straight alternating picks. Captain A picks first, then B, then B picks again, then A, and so on (A, B, B, A, A, B…). The captain who picks second in each round picks first in the next, which offsets the advantage of the first pick. Pick the captains at random, not by volunteering.

## Tiered random teams: the method that actually works

This is the method I'd recommend when skill balance matters, such as a sports lesson or a quiz night with a few obvious experts. It uses the generator several times, once per tier.

1. **Sort people into tiers privately.** For 24 players and 4 teams, make four tiers of 6: strongest, next, next, newest. Do this on paper, not out loud.
2. **Run each tier separately.** Paste tier 1 into the generator, set **Number of teams** to 4, and press **Generate teams**. Each team gets one or two tier-1 players.
3. **Repeat for each tier** with the same number of teams.
4. **Combine.** Team 1 is Team 1 from each run, Team 2 is Team 2 from each run, and so on.

Every team ends up with a similar spread of experience, and within each tier the placement is still random, so nobody can accuse you of building teams. If a tier doesn't divide evenly (say 5 strong players across 4 teams), one team gets an extra strong player. Balance that by starting the next tier's leftover on a different team: when combining, reverse the order (Team 4 becomes Team 1) for alternate tiers.

Use **Optional team names**, such as Red, Blue, Green and Yellow, on every run so combining is easy. **Copy teams** gives you plain text for each run that you can paste into one document.

[SCREENSHOT: Two generator runs side by side, one for each tier, both with team names Red, Blue, Green, Yellow, ready to combine.]

## Keeping certain people apart

The generator can't keep two people apart by rule. There are three practical options:

- **Put them in the same tier.** In the tiered method, two people in the same tier of 4 with 4 teams are guaranteed to go to different teams.
- **Reshuffle once.** If the first deal puts them together, reshuffle. Say in advance that you'll do this for specific pairs if the group would see it as fair.
- **Split by hand afterwards.** Move one person to another team of the same size and swap someone back. Do it openly.

For gift exchanges, where keeping people apart is the whole point, the [Secret Santa generator](/secret-santa-generator) has proper exclusions.

## Classroom groups

For project groups, paste your class list once. It stays in this browser, so it's there next lesson. Set **People per team** to 3 or 4. Groups of 3 work better for short tasks where everyone needs to talk. Groups of 4 suit projects with distinct roles.

A few things I'd suggest:

- **Show the result, then print it.** **Print** gives you a paper handout; **Copy share link** sends the same names and teams to a co-teacher.
- **Fix typos before generating.** "Maria" and "Mariah" can split one student into two, or merge two into one. If the same name appears more than once, the tool shows a notice so you can add an initial.
- **Don't rely on reshuffle for new partners.** There's no memory of earlier rounds, so two students can easily be paired again. If variety matters over a term, keep a simple note of past groups.
- **For one name at a time**, like choosing who presents next, use the [classroom spinner](/classroom-spinner) instead of making teams of one.

## Events, workshops and parties

For breakout rooms, set People per team to the room size you want and paste the cards into the meeting chat. For a quiz night, use team names that match the theme and send the share link so phones in the room can open the same groups. The generator holds up to 200 names, enough for most events.

## What I checked for this guide

The table figures come from the generator's own rule that sizes never differ by more than one, and each case matches the examples and limits published on the live tool page on 2026-10-13. The 22% figure is 5 remaining seats on your friend's team out of 23 other places. The tiered method is a standard way of mixing ability; the generator doesn't do it for you, but it makes each step quick.

## Frequently asked questions

### How do I make random teams with an odd number of people?

Choose the number of teams, and the generator keeps sizes within one person of each other. For example, 11 people in 3 teams gives 4, 4 and 3.

### Can the team generator balance teams by skill?

No. It shuffles and deals names at random. To mix skill levels, split people into tiers yourself and run the generator once per tier, then combine the matching teams.

### What happens to the extra person in pairs?

They join one pair to make a group of three. Switch on Leave one person out if you need strict pairs and someone can sit out a round.

### Will reshuffling give everyone new partners?

Each reshuffle is a fresh random deal, but the tool doesn't remember earlier rounds, so the same people can land together again.

### How many people can I split at once?

Up to 200 names, into up to 50 teams, or up to 100 people per team.
