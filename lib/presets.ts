import type { ToolId } from "@/lib/tools";

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

const CLASSROOM_STUDENTS = [
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
  "Amelia",
  "Elijah",
];

export const WHEEL_PRESETS: WheelPreset[] = [
  {
    id: "names",
    name: "Sample names",
    description: "A few names to try.",
    choices: [...DEFAULT_CHOICES],
  },
  {
    id: "sample-names",
    name: "Sample names",
    description: "Pick a person from a group.",
    choices: [...DEFAULT_CHOICES],
  },
  {
    id: "meeting-order",
    name: "Meeting order",
    description: "Who speaks next in standup.",
    choices: ["Alex", "Priya", "Sam", "Chris", "Jordan", "Lee"],
  },
  {
    id: "party-games",
    name: "Party / icebreakers",
    description: "Light party name picks.",
    choices: ["Host", "Guest 1", "Guest 2", "Guest 3", "Guest 4", "Wildcard"],
  },
  {
    id: "classroom-students",
    name: "Sample class roster",
    description: "Fair student selection.",
    choices: [...CLASSROOM_STUDENTS],
  },
  {
    id: "classroom-jobs",
    name: "Classroom jobs",
    description: "Assign helpers fairly.",
    choices: [
      "Line leader",
      "Board eraser",
      "Paper passer",
      "Door holder",
      "Tech helper",
      "Librarian",
    ],
  },
  {
    id: "brain-breaks",
    name: "Brain break activities",
    description: "Quick class energizers.",
    choices: ["Stretch", "Silent ball", "Dance 30s", "Deep breaths", "Joke time", "Stand & stretch"],
  },
  {
    id: "reading-groups",
    name: "Reading groups",
    description: "Pick a group to share.",
    choices: ["Group A", "Group B", "Group C", "Group D"],
  },
  {
    id: "yes-no",
    name: "Yes / No",
    description: "Quick decision helper.",
    choices: ["Yes", "No"],
  },
  {
    id: "yes-no-maybe",
    name: "Yes / No / Maybe",
    description: "Three-way decision.",
    choices: ["Yes", "No", "Maybe"],
  },
  {
    id: "quick-decide",
    name: "Quick decide",
    description: "Do it, wait, ask someone, or skip.",
    choices: ["Do it", "Wait", "Ask someone", "Skip"],
  },
  {
    id: "heads-tails",
    name: "Heads / Tails",
    description: "Flip a coin on the wheel.",
    choices: ["Heads", "Tails"],
  },
  {
    id: "prizes",
    name: "Prize rewards",
    description: "Prize ideas for a giveaway.",
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
    id: "prize-rewards",
    name: "Prize rewards",
    description: "Prize ideas for a giveaway.",
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
    id: "streamer-giveaway",
    name: "Stream giveaway",
    description: "Fun streamer prizes.",
    choices: ["Shout-out", "Game key", "Merch", "Try again", "VIP role", "Mystery prize"],
  },
  {
    id: "classroom-rewards",
    name: "Classroom rewards",
    description: "Low-stakes class prizes.",
    choices: ["Homework pass", "Choose seat", "Extra recess", "Sticker", "Teacher helper", "Try again"],
  },
  {
    id: "entrant-names",
    name: "Entrant names",
    description: "Pick a winner by name.",
    choices: [...DEFAULT_CHOICES],
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
  {
    id: "letters-a-z",
    name: "Letters A–Z",
    description: "Spin a random letter.",
    choices: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ],
  },
  {
    id: "letters-word-game",
    name: "Word game letters",
    description: "20 letters, no Q, U, V, X, Y, Z.",
    choices: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "R",
      "S",
      "T",
      "W",
    ],
  },
  {
    id: "numbers-1-10",
    name: "Numbers 1–10",
    description: "Spin a number from 1 to 10.",
    choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
];

export type ToolPresetConfig = {
  defaultPresetId: string;
  presetIds: string[];
};

export const TOOL_DEFAULTS: Record<ToolId, ToolPresetConfig> = {
  home: {
    defaultPresetId: "names",
    presetIds: [
      "names",
      "yes-no",
      "prizes",
      "food",
      "activity",
      "letters-a-z",
      "letters-word-game",
      "numbers-1-10",
    ],
  },
  "random-name-picker": {
    defaultPresetId: "sample-names",
    presetIds: ["sample-names", "meeting-order", "party-games"],
  },
  "classroom-spinner": {
    defaultPresetId: "classroom-students",
    presetIds: [
      "classroom-students",
      "classroom-jobs",
      "brain-breaks",
      "reading-groups",
      "letters-a-z",
    ],
  },
  "prize-wheel": {
    defaultPresetId: "prize-rewards",
    presetIds: ["prize-rewards", "streamer-giveaway", "classroom-rewards", "entrant-names"],
  },
  "yes-no-wheel": {
    defaultPresetId: "yes-no",
    presetIds: ["yes-no", "yes-no-maybe", "quick-decide", "heads-tails"],
  },
  "random-team-generator": {
    defaultPresetId: "classroom-students",
    presetIds: [],
  },
  "secret-santa-generator": {
    defaultPresetId: "sample-names",
    presetIds: [],
  },
  "random-number-wheel": {
    defaultPresetId: "numbers-1-10",
    presetIds: [],
  },
  "raffle-generator": {
    defaultPresetId: "sample-names",
    presetIds: [],
  },
  "bingo-card-generator": {
    defaultPresetId: "sample-names",
    presetIds: [],
  },
};

export function getPresetById(id: string): WheelPreset | undefined {
  return WHEEL_PRESETS.find((p) => p.id === id);
}

export function presetsForTool(toolId: ToolId): WheelPreset[] {
  const cfg = TOOL_DEFAULTS[toolId];
  return cfg.presetIds
    .map((id) => getPresetById(id))
    .filter((p): p is WheelPreset => Boolean(p));
}

export function defaultChoicesForTool(toolId: ToolId): string[] {
  const cfg = TOOL_DEFAULTS[toolId];
  return [...(getPresetById(cfg.defaultPresetId)?.choices ?? DEFAULT_CHOICES)];
}

export const ALLOWED_PRESET_QUERY = new Set(WHEEL_PRESETS.map((p) => p.id));
