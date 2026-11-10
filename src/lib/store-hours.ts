/**
 * Store hours helpers.
 *
 * Parses the free-text hours strings saved in Admin > Settings, for example:
 *   "Mon-Sun: 08:00 AM - 02:00 AM"
 *   "Mon-Thu, Sun: 10:00 AM - 11:00 PM | Fri-Sat: 10:00 AM - 12:00 AM"
 * and works out whether the store is open right now in the store's own time
 * zone (America/Chicago), not the visitor's browser time zone.
 *
 * Closing times at or before the opening time are treated as overnight
 * (e.g. 8 AM - 2 AM closes at 2 AM the next day; 12:00 AM means midnight).
 * If a string can't be parsed, parseStoreHours returns null and callers
 * should just show the raw text without an open/closed badge.
 */

export const STORE_TIME_ZONE = 'America/Chicago';

const MINUTES_PER_DAY = 24 * 60;
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_ALIASES: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

export interface HoursInterval {
  /** Minutes after midnight the store opens. */
  open: number;
  /** Minutes after midnight the store closes; may exceed 1440 for overnight hours. */
  close: number;
}

/** Index 0 = Sunday ... 6 = Saturday. An empty array means closed that day. */
export type WeeklySchedule = HoursInterval[][];

function parseDayToken(token: string): number | null {
  const key = token.trim().toLowerCase().replace(/\.$/, '');
  return key in DAY_ALIASES ? DAY_ALIASES[key] : null;
}

function parseDays(spec: string): number[] | null {
  const s = spec.trim().toLowerCase();
  if (/^(daily|every\s*day|everyday|all\s*week|7\s*days(\s*a\s*week)?)$/.test(s)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const days = new Set<number>();
  for (const part of s.split(/\s*(?:,|&|\band\b)\s*/)) {
    if (!part) continue;
    const range = part.split(/\s*(?:-|–|—|\bto\b|\bthrough\b|\bthru\b)\s*/);
    if (range.length === 1) {
      const d = parseDayToken(range[0]);
      if (d === null) return null;
      days.add(d);
    } else if (range.length === 2) {
      const start = parseDayToken(range[0]);
      const end = parseDayToken(range[1]);
      if (start === null || end === null) return null;
      // Ranges may wrap around the week (e.g. Fri-Mon).
      for (let d = start; ; d = (d + 1) % 7) {
        days.add(d);
        if (d === end) break;
      }
    } else {
      return null;
    }
  }
  return days.size ? Array.from(days) : null;
}

function parseTime(text: string): number | null {
  const t = text.trim().toLowerCase().replace(/\./g, '');
  if (t === 'noon') return 12 * 60;
  if (t === 'midnight') return 0;
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3];
  if (minute > 59) return null;
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    const pm = meridiem.startsWith('p');
    if (hour === 12) hour = pm ? 12 : 0;
    else if (pm) hour += 12;
  } else if (hour > 24) {
    return null;
  }
  return (hour % 24) * 60 + minute;
}

function parseTimeRange(text: string): HoursInterval | 'closed' | null {
  const t = text.trim().toLowerCase();
  if (/^closed$/.test(t)) return 'closed';
  if (/^(open\s*)?24\s*(hours|hrs|h)$/.test(t)) return { open: 0, close: MINUTES_PER_DAY };
  const parts = t.split(/\s*(?:-|–|—|\bto\b)\s*/);
  if (parts.length !== 2) return null;
  const open = parseTime(parts[0]);
  let close = parseTime(parts[1]);
  if (open === null || close === null) return null;
  // Closing at or before opening means it closes after midnight (overnight).
  if (close <= open) close += MINUTES_PER_DAY;
  return { open, close };
}

/** Parse a settings hours string into a weekly schedule, or null if it can't be understood. */
export function parseStoreHours(hours: string | null | undefined): WeeklySchedule | null {
  if (!hours || !hours.trim()) return null;
  const schedule: WeeklySchedule = [[], [], [], [], [], [], []];
  const segments = hours.split(/\s*(?:\||\n|;)\s*/).filter(Boolean);
  if (!segments.length) return null;

  for (const segment of segments) {
    // Day part has no digits, so the first colon after it separates days from times.
    const m = segment.match(/^([A-Za-z.,&\-–—\s]+?)\s*:\s*(.+)$/);
    if (!m) return null;
    const days = parseDays(m[1]);
    const range = parseTimeRange(m[2]);
    if (!days || !range) return null;
    for (const d of days) {
      if (range === 'closed') schedule[d] = [];
      else schedule[d].push(range);
    }
  }
  return schedule;
}

/** Current day of week (0 = Sun) and minutes after midnight in the store's time zone. */
export function getStoreLocalTime(now: Date = new Date(), timeZone: string = STORE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = DAY_SHORT.indexOf(get('weekday'));
  const hour = parseInt(get('hour'), 10) % 24;
  const minute = parseInt(get('minute'), 10);
  return { day: day < 0 ? now.getDay() : day, minutes: hour * 60 + minute };
}

export function isOpenAt(schedule: WeeklySchedule, day: number, minutes: number): boolean {
  if (schedule[day].some((i) => minutes >= i.open && minutes < i.close)) return true;
  // Still inside yesterday's overnight hours?
  const yesterday = (day + 6) % 7;
  return schedule[yesterday].some(
    (i) => i.close > MINUTES_PER_DAY && minutes + MINUTES_PER_DAY >= i.open && minutes + MINUTES_PER_DAY < i.close
  );
}

export function formatMinutes(total: number): string {
  const m = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const minute = m % 60;
  const suffix = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export interface StoreStatus {
  /** null when the hours text couldn't be parsed (show text only, no badge). */
  isOpen: boolean | null;
  /** e.g. "Tue: 8:00 AM - 2:00 AM", "Tue: Closed", or the raw hours text if unparseable. */
  todayHours: string;
  statusText: string | null;
}

/** Open/closed status and today's hours for a settings hours string. */
export function getStoreStatus(hours: string | null | undefined, now: Date = new Date()): StoreStatus {
  const schedule = parseStoreHours(hours);
  if (!schedule) {
    return { isOpen: null, todayHours: (hours || '').trim(), statusText: null };
  }
  const { day, minutes } = getStoreLocalTime(now);
  const open = isOpenAt(schedule, day, minutes);
  const today = schedule[day];
  const todayText = today.length
    ? today.map((i) => `${formatMinutes(i.open)} - ${formatMinutes(i.close)}`).join(', ')
    : 'Closed';
  return {
    isOpen: open,
    todayHours: `${DAY_SHORT[day]}: ${todayText}`,
    statusText: open ? 'Open Now' : 'Closed',
  };
}

/** Split an hours string into display lines ("A | B" -> ["A", "B"]). */
export function hoursToLines(hours: string | null | undefined): string[] {
  if (!hours) return [];
  return hours.split(/\s*(?:\||\n)\s*/).map((s) => s.trim()).filter(Boolean);
}

/** Multi-line display text for elements using `whitespace-pre-line`. */
export function formatHoursForDisplay(hours: string | null | undefined): string {
  return hoursToLines(hours).join('\n');
}
