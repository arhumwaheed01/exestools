# ExesTools decisions

## 2026-10-06 — `/raffle-generator` gets its own URL

Supersedes the 2026-09-26 P3-04 line “raffle multi-entry is a feature on `/prize-wheel`” and the “`/raffle-picker` = DO NOT BUILD” note.

**Why:** The raffle generator/picker SERPs are list-draw tools (ticket counts, number ranges, many winners, records) that a ≤60-slice wheel can’t serve; P3-04 never shipped.

**Intent split:**
- `/prize-wheel` = prize wheel, giveaway spinner, raffle wheel (visual spin)
- `/raffle-generator` = raffle generator/picker/draw, multiple entries per person, raffle ticket numbers, multiple winners

**P3-04 is cancelled;** don’t add ticket counts to `/prize-wheel`.

Source: Raffle Generator Dev Task pack §1 / §11.10.
