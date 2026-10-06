import type { DrawResult } from "./draw";

const list = (names: string[]) =>
  new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(names);

/** Turns a failed DrawResult into the exact UI message (role="alert"). */
export function describeFailure(
  res: Extract<DrawResult, { ok: false }>,
  names: string[],
): string {
  const pick = (idx: number[] = []) => idx.map((i) => names[i]!);
  switch (res.reason) {
    case "too_few":
      return "Add at least 3 people to draw names.";
    case "too_many":
      return "The list is full. Secret Santa draws are limited to 50 people.";
    case "no_loop":
      return "No single loop fits these exclusions. Turn off Single loop, or remove an exclusion, and draw again.";
    case "not_found":
      return "Couldn't find a single loop that fits these exclusions. Turn off Single loop, or remove an exclusion, and draw again.";
    case "impossible": {
      const fix = "Remove an exclusion involving them, or add another person.";
      const givers = pick(res.blockedGivers);
      if (givers.length) {
        return `No valid draw: ${list(givers)} can't draw anyone, because everyone else is excluded for them. ${fix}`;
      }
      const receivers = pick(res.blockedReceivers);
      if (receivers.length) {
        return `No valid draw: nobody is allowed to draw ${list(receivers)}. ${fix}`;
      }
      const hg = pick(res.hallGivers);
      const hr = pick(res.hallReceivers);
      if (hg.length && hr.length) {
        return `No valid draw: ${list(hg)} can only draw ${list(hr)} between them, and each person can only be drawn once. ${fix}`;
      }
      return "No valid draw: these exclusions leave someone without a match. Remove an exclusion or add another person.";
    }
  }
}
