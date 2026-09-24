export const SITE_FAQS = [
  {
    q: "Is the ExesTools spinner wheel free?",
    a: "Yes. You can create custom wheels, spin, and save choices in your browser without creating an account or paying for a subscription.",
  },
  {
    q: "How is the winner selected?",
    a: "The wheel uses a smooth spin animation and decelerates to a stop. The result is calculated from the final rotation angle under the fixed pointer — the label you see is the segment under the pointer, not a separate random pick.",
  },
  {
    q: "Are my choices uploaded to a server?",
    a: "Choices are stored in your browser’s local storage by default. Sharing via URL encodes your list in the link you copy. We do not require accounts for the core tool.",
  },
  {
    q: "Can I use this for classroom or giveaways?",
    a: "Yes — people use spinner wheels for name picks, classroom turns, icebreakers, and prize draws. Always follow your organization’s fairness and privacy policies, and disclose how winners are chosen for contests.",
  },
  {
    q: "What if I only have one choice left?",
    a: "You need at least two choices to spin. Use Remove & continue after a win to draw without replacement until two or more remain.",
  },
  {
    q: "Can I share my wheel with someone else?",
    a: "Yes. Use Copy share link to put an encoded list in the URL. Recipients open the link on ExesTools and see the same choices. Very long lists may exceed URL length limits.",
  },
  {
    q: "Is every spin truly random?",
    a: "Each spin picks a fair target segment and animates the wheel to land on it accurately. Independent spins can repeat the same result — that is normal for random selection. Remove winners if you need draw-without-replacement.",
  },
] as const;

export function faqsToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
