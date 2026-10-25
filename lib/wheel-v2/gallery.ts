/** Ready-made wheels for /wheel-gallery — original ExesTools copy, no competitor branding. */

export type GalleryWheel = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  choices: string[];
};

export const GALLERY_WHEELS: GalleryWheel[] = [
  {
    id: "what-to-eat",
    title: "What to eat",
    blurb: "Settle dinner without a debate.",
    tags: ["food", "dinner", "everyday"],
    choices: ["Pizza", "Tacos", "Curry", "Pasta", "Burgers", "Salad", "Sushi", "Soup"],
  },
  {
    id: "weekend-activity",
    title: "Weekend activity",
    blurb: "Pick a plan for Saturday.",
    tags: ["weekend", "fun", "outdoors"],
    choices: [
      "Farmers market",
      "Hike",
      "Museum",
      "Beach",
      "Bike ride",
      "Movie",
      "New café",
      "Board games",
    ],
  },
  {
    id: "secret-santa-order",
    title: "Secret Santa pick order",
    blurb: "Who draws a name first.",
    tags: ["holiday", "gift", "party"],
    choices: ["Alex", "Jordan", "Sam", "Riley", "Casey", "Morgan", "Taylor", "Quinn"],
  },
  {
    id: "classroom-picks",
    title: "Classroom picks",
    blurb: "Call on students fairly.",
    tags: ["classroom", "school", "names"],
    choices: [
      "Ava",
      "Noah",
      "Mia",
      "Liam",
      "Sophia",
      "Ethan",
      "Isabella",
      "Lucas",
      "Harper",
      "Mason",
    ],
  },
  {
    id: "truth-or-dare",
    title: "Truth or dare",
    blurb: "Party prompt picker.",
    tags: ["party", "game"],
    choices: ["Truth", "Dare", "Truth", "Dare", "Skip", "Group dare"],
  },
  {
    id: "yes-no",
    title: "Yes or no",
    blurb: "A quick two-way decision.",
    tags: ["decision", "yes", "no"],
    choices: ["Yes", "No"],
  },
  {
    id: "yes-no-maybe",
    title: "Yes, no, or maybe",
    blurb: "Leave room for a soft maybe.",
    tags: ["decision"],
    choices: ["Yes", "No", "Maybe"],
  },
  {
    id: "chore-roulette",
    title: "Chore roulette",
    blurb: "Who does which household job.",
    tags: ["home", "chores"],
    choices: ["Dishes", "Trash", "Vacuum", "Laundry", "Cook", "Wipe counters"],
  },
  {
    id: "meeting-speaker",
    title: "Meeting speaker order",
    blurb: "Fair turn order for standup.",
    tags: ["work", "meeting"],
    choices: ["Alex", "Priya", "Sam", "Chris", "Jordan", "Lee"],
  },
  {
    id: "brain-break",
    title: "Brain break",
    blurb: "Short classroom energy reset.",
    tags: ["classroom", "school"],
    choices: ["Stretch", "Dance break", "Deep breaths", "Joke time", "Quiet draw", "Walk laps"],
  },
  {
    id: "prize-tiers",
    title: "Prize tiers",
    blurb: "Giveaway spin categories.",
    tags: ["prize", "giveaway"],
    choices: ["Grand prize", "Runner-up", "Merch", "Shout-out", "Try again", "Bonus spin"],
  },
  {
    id: "movie-night",
    title: "Movie night genre",
    blurb: "Pick the vibe, then pick the film.",
    tags: ["fun", "weekend"],
    choices: ["Comedy", "Action", "Horror", "Romance", "Documentary", "Animation", "Sci-fi"],
  },
  {
    id: "workout",
    title: "Today's workout",
    blurb: "Stop negotiating with yourself.",
    tags: ["fitness", "everyday"],
    choices: ["Run", "Bike", "Yoga", "Weights", "Row", "Rest day"],
  },
  {
    id: "icebreaker",
    title: "Icebreaker prompts",
    blurb: "Warm up a new group.",
    tags: ["party", "classroom", "meeting"],
    choices: [
      "Two truths and a lie",
      "Favorite food",
      "Dream trip",
      "Hidden talent",
      "Best concert",
      "Weird hobby",
    ],
  },
  {
    id: "letters-az",
    title: "Letters A–Z",
    blurb: "Random letter for word games.",
    tags: ["games", "letters"],
    choices: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  },
  {
    id: "numbers-1-10",
    title: "Numbers 1–10",
    blurb: "Quick number pick.",
    tags: ["numbers", "games"],
    choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
];

export function filterGallery(query: string): GalleryWheel[] {
  const q = query.trim().toLowerCase();
  if (!q) return GALLERY_WHEELS;
  return GALLERY_WHEELS.filter((w) => {
    const hay = `${w.title} ${w.blurb} ${w.tags.join(" ")} ${w.choices.join(" ")}`.toLowerCase();
    return hay.includes(q);
  });
}
