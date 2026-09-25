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
  "Alex",
  "Jordan",
  "Sam",
  "Riley",
  "Casey",
  "Morgan",
  "Taylor",
  "Jamie",
];

export const WHEEL_PRESETS: WheelPreset[] = [
  {
    id: "names",
    name: "Sample names",
    description: "Starter name list for the homepage.",
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
    description: "Go / wait / rethink.",
    choices: ["Do it", "Wait", "Ask someone", "Skip"],
  },
  {
    id: "prizes",
    name: "Prize rewards",
    description: "Giveaway reward segments.",
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
    description: "Giveaway reward segments.",
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
];

export type ToolPresetConfig = {
  defaultPresetId: string;
  presetIds: string[];
};

export const TOOL_DEFAULTS: Record<ToolId, ToolPresetConfig> = {
  home: {
    defaultPresetId: "names",
    presetIds: ["names", "yes-no", "prizes", "food", "activity"],
  },
  "random-name-picker": {
    defaultPresetId: "sample-names",
    presetIds: ["sample-names", "meeting-order", "party-games"],
  },
  "classroom-spinner": {
    defaultPresetId: "classroom-students",
    presetIds: ["classroom-students", "classroom-jobs", "brain-breaks", "reading-groups"],
  },
  "prize-wheel": {
    defaultPresetId: "prize-rewards",
    presetIds: ["prize-rewards", "streamer-giveaway", "classroom-rewards", "entrant-names"],
  },
  "yes-no-wheel": {
    defaultPresetId: "yes-no",
    presetIds: ["yes-no", "yes-no-maybe", "quick-decide"],
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
