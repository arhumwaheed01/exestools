/** Intrinsic width/height for local images used by next/image (CLS / aspect ratio). */
export type ImageSize = { width: number; height: number };

const DEFAULT_SIZE: ImageSize = { width: 1280, height: 900 };

/**
 * Known local image dimensions under `public/`.
 * Paths match markdown `src` (leading slash, no `public` prefix).
 */
export const IMAGE_SIZES: Record<string, ImageSize> = {
  // Tool screenshots (verified)
  "/tools/classroom-spinner/1.png": { width: 960, height: 820 },
  "/tools/random-number-wheel/1.png": { width: 920, height: 720 },

  // Planned tool home/OG webps (placeholders until files land)
  "/tools/home/1.webp": { width: 1280, height: 720 },
  "/tools/random-name-picker/1.webp": { width: 1280, height: 720 },
  "/tools/classroom-spinner/1.webp": { width: 1280, height: 720 },
  "/tools/prize-wheel/1.webp": { width: 1280, height: 720 },
  "/tools/yes-no-wheel/1.webp": { width: 1280, height: 720 },
  "/tools/random-team-generator/1.webp": { width: 1280, height: 720 },
  "/tools/secret-santa-generator/1.webp": { width: 1280, height: 720 },
  "/tools/random-number-wheel/1.webp": { width: 1280, height: 720 },
  "/tools/raffle-generator/1.webp": { width: 1280, height: 720 },
  "/tools/bingo-card-generator/1.webp": { width: 1280, height: 720 },
  "/tools/time-card-calculator/1.webp": { width: 1280, height: 720 },
  "/tools/overtime-calculator/1.webp": { width: 1280, height: 720 },

  // Guide images — 1200×900
  "/guides/chore-wheel-for-kids/2.jpg": { width: 1200, height: 900 },
  "/guides/icebreaker-games-with-a-random-picker/2.jpg": { width: 1200, height: 900 },
  "/guides/white-elephant-gift-exchange-rules/1.jpg": { width: 1200, height: 900 },
  "/guides/white-elephant-gift-exchange-rules/2.jpg": { width: 1200, height: 900 },

  // Guide images — 1200×801
  "/guides/office-secret-santa-planning-timeline/1.jpg": { width: 1200, height: 801 },

  // Guide images — 1200×800
  "/guides/bingo-games-for-classrooms-and-parties/1.jpg": { width: 1200, height: 800 },
  "/guides/cold-calling-students-fairly/1.jpg": { width: 1200, height: 800 },
  "/guides/fair-ways-to-break-a-tie/2.jpg": { width: 1200, height: 800 },
  "/guides/friendsgiving-thanksgiving-team-games/1.jpg": { width: 1200, height: 800 },
  "/guides/how-to-make-balanced-random-teams/1.jpg": { width: 1200, height: 800 },
  "/guides/random-speaking-order-for-meetings/2.jpg": { width: 1200, height: 800 },
  "/guides/secret-santa-rules-and-budget-ideas/1.jpg": { width: 1200, height: 800 },

  // Guide images — 1200×799
  "/guides/chore-wheel-for-kids/1.jpg": { width: 1200, height: 799 },
  "/guides/classroom-games-with-a-spinner-wheel/1.jpg": { width: 1200, height: 799 },
  "/guides/classroom-games-with-a-spinner-wheel/2.jpg": { width: 1200, height: 799 },
  "/guides/fair-ways-to-break-a-tie/1.jpg": { width: 1200, height: 799 },
  "/guides/how-to-run-a-raffle-fundraiser/1.jpg": { width: 1200, height: 799 },
  "/guides/how-to-run-a-raffle-fundraiser/2.jpg": { width: 1200, height: 799 },
  "/guides/icebreaker-games-with-a-random-picker/1.jpg": { width: 1200, height: 799 },
  "/guides/office-secret-santa-planning-timeline/2.jpg": { width: 1200, height: 799 },
  "/guides/prize-wheel-ideas-for-events-and-booths/1.jpg": { width: 1200, height: 799 },
  "/guides/prize-wheel-ideas-for-events-and-booths/2.jpg": { width: 1200, height: 799 },
  "/guides/random-speaking-order-for-meetings/1.jpg": { width: 1200, height: 799 },

  // Guide screenshots — 1280×900 (verified)
  "/guides/how-random-is-a-spinner-wheel/1.png": { width: 1280, height: 900 },
  "/guides/how-to-run-a-fair-online-giveaway/1.png": { width: 1280, height: 900 },
  "/guides/how-to-run-a-fair-online-giveaway/2.png": { width: 1280, height: 900 },
};

/** Look up intrinsic size for a local image src; falls back to 1280×900. */
export function imageSizeFor(src: string): ImageSize {
  return IMAGE_SIZES[src] ?? DEFAULT_SIZE;
}
