import { defaultSettings } from "./defaults";
import type { DayRow, TimeCardSettings, TimeCardState } from "./types";

function dayIsEmpty(day: DayRow): boolean {
  if (day.start.minutes != null || day.end.minutes != null) return false;
  if (day.date || day.note.trim()) return false;
  for (const b of day.breaks) {
    if (b.durationMinutes != null && b.durationMinutes > 0) return false;
    if (b.start.minutes != null || b.end.minutes != null) return false;
  }
  return true;
}

function settingsMatchDefaults(settings: TimeCardSettings): boolean {
  const d = defaultSettings();
  return (
    settings.period === d.period &&
    settings.weekStart === d.weekStart &&
    settings.clockFormat === d.clockFormat &&
    settings.rounding === d.rounding &&
    settings.weeklyOvertime === d.weeklyOvertime &&
    settings.dailyOvertime === d.dailyOvertime &&
    settings.hourlyRate == null
  );
}

/** True when the card matches a fresh default (skip writing localStorage). */
export function isDefaultEmptyState(state: TimeCardState): boolean {
  if (!settingsMatchDefaults(state.settings)) return false;
  return state.days.every(dayIsEmpty);
}
