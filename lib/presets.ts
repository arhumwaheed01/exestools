export type WheelPreset = {
  id: string;
  name: string;
  description: string;
  choices: string[];
};

export const DEFAULT_CHOICES = [
  "Alex",
  "Jordan",
  "Sam",
  "Riley",
  "Casey",
  "Morgan",
] as const;

export const WHEEL_PRESETS: WheelPreset[] = [
  {
    id: "names",
    name: "Random name picker",
    description: "Pick a person from a group.",
    choices: [...DEFAULT_CHOICES],
  },
  {
    id: "yes-no",
    name: "Yes / No",
    description: "Quick decision helper.",
    choices: ["Yes", "No"],
  },
  {
    id: "prizes",
    name: "Prize wheel",
    description: "Giveaways and classroom rewards.",
    choices: [
      "Gift card",
      "Free coffee",
      "Sticker pack",
      "Try again",
      "Mystery box",
      "Extra spin",
    ],
  },
  {
    id: "food",
    name: "What to eat",
    description: "Settle the dinner debate.",
    choices: ["Pizza", "Sushi", "Tacos", "Burgers", "Pasta", "Salad", "Thai", "Indian"],
  },
  {
    id: "activity",
    name: "Weekend activity",
    description: "Ideas for free time.",
    choices: [
      "Movie night",
      "Park walk",
      "Board games",
      "Museum",
      "Cook together",
      "Bike ride",
      "Coffee shop",
      "Stay in",
    ],
  },
];

export function getPresetById(id: string): WheelPreset | undefined {
  return WHEEL_PRESETS.find((p) => p.id === id);
}
