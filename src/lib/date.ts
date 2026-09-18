/**
 * The fixed "now" for the demo. There is no backend clock yet, so every
 * screen reasons about the same reference date as the seed data
 * (docs/05-seed-data.md: "17 בספטמבר").
 */
export const DEMO_TODAY = new Date(2026, 8, 17);

const dayMonthFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' });
const shortDayMonthFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' });
const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'long' });
const monthFormatter = new Intl.DateTimeFormat('he-IL', { month: 'long' });
const dateOnlyFormatter = new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' });

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayMonth(date: Date | string): string {
  const d = typeof date === 'string' ? parseIsoDate(date) : date;
  return dayMonthFormatter.format(d);
}

export function formatShortDayMonth(date: Date | string): string {
  const d = typeof date === 'string' ? parseIsoDate(date) : date;
  return shortDayMonthFormatter.format(d);
}

export function formatWeekdayDayMonth(date: Date | string = DEMO_TODAY): string {
  const d = typeof date === 'string' ? parseIsoDate(date) : date;
  return `${weekdayFormatter.format(d)}, ${dayMonthFormatter.format(d)}`;
}

export function formatMonthLabel(date: Date | string = DEMO_TODAY): string {
  const d = typeof date === 'string' ? parseIsoDate(date) : date;
  return monthFormatter.format(d);
}

export function daysLeftInMonth(date: Date = DEMO_TODAY): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return lastDay - date.getDate();
}

export function currentPeriod(date: Date = DEMO_TODAY): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Short locale date, e.g. for a visibility log entry's timestamp. */
export function formatDateShort(isoTimestamp: string): string {
  return dateOnlyFormatter.format(new Date(isoTimestamp));
}

/** Short locale date + time, e.g. for "last synced at" banners. */
export function formatDateTimeShort(isoTimestamp: string): string {
  return dateTimeFormatter.format(new Date(isoTimestamp));
}

export function formatIsoAsDots(iso: string): string {
  return parseIsoDate(iso)
    .toLocaleDateString('he-IL')
    .split('/')
    .join('.');
}
