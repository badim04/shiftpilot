import type { RotaData, Shift } from '../data/types';
import { TODAY_KEY } from '../data/seed';
import { parseKey, toMin } from '../data/helpers';

export const jamieShifts = (data: RotaData) => data.shifts.filter((s) => s.workerId === 'jamie');

export const sortKey = (s: Shift) => parseKey(s.date).getTime() + toMin(s.start);

export function upNext(data: RotaData): Shift | null {
  const mine = jamieShifts(data);
  const active = mine.find((s) => s.status === 'active');
  if (active) return active;
  const future = mine
    .filter((s) => s.status === 'scheduled' && sortKey(s) >= parseKey(TODAY_KEY).getTime())
    .sort((a, b) => sortKey(a) - sortKey(b));
  return future[0] || null;
}
