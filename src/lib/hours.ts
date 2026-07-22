import type { DayKey, WeekHours } from "./types";

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_TO_DAYKEY: Record<string, DayKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

const berlinFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function parseTime(hhmm: string): number {
  const [hourStr, minuteStr] = hhmm.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (hour === 24) return 1440;
  return hour * 60 + minute;
}

export function isOpenAt(hours: WeekHours | null, at: Date): boolean {
  if (hours === null) return false;

  const parts = berlinFormatter.formatToParts(at);
  let weekday = "";
  let hourStr = "";
  let minuteStr = "";
  for (const part of parts) {
    if (part.type === "weekday") weekday = part.value;
    else if (part.type === "hour") hourStr = part.value;
    else if (part.type === "minute") minuteStr = part.value;
  }

  const todayKey = WEEKDAY_TO_DAYKEY[weekday];
  if (!todayKey) return false;

  let hour = Number(hourStr);
  if (hour === 24) hour = 0;
  const minute = Number(minuteStr);
  const m = hour * 60 + minute;

  const todayIndex = DAY_KEYS.indexOf(todayKey);
  const yesterdayKey = DAY_KEYS[(todayIndex + 6) % 7];

  const todayWindows = hours[todayKey];
  if (todayWindows) {
    for (const window of todayWindows) {
      const openMin = parseTime(window.open);
      const closeMin = parseTime(window.close);
      if (closeMin > openMin) {
        if (openMin <= m && m < closeMin) return true;
      } else {
        if (m >= openMin) return true;
      }
    }
  }

  const yesterdayWindows = hours[yesterdayKey];
  if (yesterdayWindows) {
    for (const window of yesterdayWindows) {
      const openMin = parseTime(window.open);
      const closeMin = parseTime(window.close);
      if (closeMin <= openMin) {
        if (m < closeMin) return true;
      }
    }
  }

  return false;
}

export function sundayOpen(hours: WeekHours | null): boolean {
  if (hours === null) return false;
  const sun = hours.sun;
  return !!sun && sun.length > 0;
}

export function formatHours(
  hours: WeekHours | null,
): { day: DayKey; label: string }[] {
  const result: { day: DayKey; label: string }[] = [];
  for (const day of DAY_KEYS) {
    const windows = hours ? hours[day] : undefined;
    let label: string;
    if (!windows || windows.length === 0) {
      label = "Closed";
    } else {
      label = windows.map((w) => `${w.open}\u2013${w.close}`).join(", ");
    }
    result.push({ day, label });
  }
  return result;
}
