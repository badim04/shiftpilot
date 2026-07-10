import type { Shift } from './types';
import { DAYS, TODAY_KEY } from './seed';

export function parseKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export const fmtDay = (k: string) => DAYS[(parseKey(k).getDay() + 6) % 7];
export const fmtDayNum = (k: string) => parseKey(k).getDate();
export const fmtUK = (k: string) => {
  const d = parseKey(k);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
export const fmtLong = (k: string) =>
  parseKey(k).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
export function dur(s: string, e: string): number {
  let d = toMin(e) - toMin(s);
  if (d < 0) d += 24 * 60;
  return d / 60;
}
export const fmtTime = (t: string) => t;

export function relDayLabel(k: string): string {
  if (k === TODAY_KEY) return 'Today';
  const diff = Math.round((parseKey(k).getTime() - parseKey(TODAY_KEY).getTime()) / 86400000);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return fmtLong(k);
}

export const isOvernight = (s: Shift): boolean => toMin(s.end) <= toMin(s.start);

export function payOf(s: Shift): number {
  const h = dur(s.start, s.end) - (s.breakMins || 0) / 60;
  return Math.max(0, h) * s.rate;
}

export function workedHours(s: Shift): number {
  if (s.clockIn && s.clockOut) {
    let d = toMin(s.clockOut) - toMin(s.clockIn);
    if (d < 0) d += 1440;
    return d / 60 - (s.breakMins || 0) / 60;
  }
  return dur(s.start, s.end) - (s.breakMins || 0) / 60;
}
