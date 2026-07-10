import type { Availability, Company, RotaData, Shift, Thread, Worker } from './types';

export const NOW = (() => {
  const d = new Date();
  d.setHours(14, 30, 0, 0);
  return d;
})();
export const MIN_NOW = NOW.getHours() * 60 + NOW.getMinutes();

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const MON = startOfWeek(NOW);
export const dk = (offset: number) => dateKey(addDays(MON, offset));
export const TODAY_KEY = dateKey(NOW);
export const TODAY_DOW = (NOW.getDay() + 6) % 7;

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const COMPANIES: Company[] = [
  { id: 'oak', name: 'Oakwood Hospitality', short: 'Oakwood', color: '#E0A458', kind: 'Hospitality' },
  { id: 'bright', name: 'BrightCare', short: 'BrightCare', color: '#56B6A6', kind: 'Care' },
  { id: 'metro', name: 'Metro Logistics', short: 'Metro', color: '#7E8BF0', kind: 'Logistics' },
];

export const companyById = (id: string): Company => COMPANIES.find((c) => c.id === id)!;

export const WORKERS: Worker[] = [
  { id: 'jamie', name: 'Jamie Ellis', first: 'Jamie', initials: 'JE', color: '#E0A458', rate: 12.6, holiday: 34.5, rtw: true },
  { id: 'priya', name: 'Priya Shah', first: 'Priya', initials: 'PS', color: '#6BA3E5', rate: 12.6, holiday: 51.0, rtw: true },
  { id: 'tom', name: 'Tom Okafor', first: 'Tom', initials: 'TO', color: '#56B6A6', rate: 13.4, holiday: 22.0, rtw: true },
  { id: 'mia', name: 'Mia Fenton', first: 'Mia', initials: 'MF', color: '#D98BB0', rate: 11.6, holiday: 18.5, rtw: true },
  { id: 'liam', name: 'Liam Doyle', first: 'Liam', initials: 'LD', color: '#C9885B', rate: 11.6, holiday: 9.0, rtw: true },
  { id: 'sara', name: 'Sara Nowak', first: 'Sara', initials: 'SN', color: '#8E83E0', rate: 14.2, holiday: 63.5, rtw: true },
  { id: 'dan', name: 'Dan Reeves', first: 'Dan', initials: 'DR', color: '#5FB0A0', rate: 12.0, holiday: 41.0, rtw: false },
  { id: 'aisha', name: 'Aisha Khan', first: 'Aisha', initials: 'AK', color: '#E3A06B', rate: 13.4, holiday: 27.5, rtw: true },
];

export const workerById = (id: string | null): Worker | undefined =>
  id ? WORKERS.find((w) => w.id === id) : undefined;

let _sid = 0;
export function S(o: Partial<Shift>): Shift {
  return {
    id: 's' + ++_sid,
    companyId: 'oak',
    workerId: null,
    role: 'Floor',
    date: TODAY_KEY,
    start: '09:00',
    end: '17:00',
    rate: 12.6,
    status: 'scheduled',
    clockIn: null,
    clockOut: null,
    breakMins: 30,
    swap: false,
    drop: false,
    approved: false,
    ...o,
  };
}

function seedShifts(): Shift[] {
  const list: Shift[] = [];
  const T = TODAY_KEY;

  const rota = [
    { w: 'priya', r: 'Bar', off: 0, s: '17:00', e: '23:00' },
    { w: 'liam', r: 'Floor', off: 0, s: '11:00', e: '19:00' },
    { w: 'tom', r: 'Kitchen', off: 1, s: '10:00', e: '18:00' },
    { w: 'mia', r: 'Floor', off: 1, s: '17:00', e: '23:00' },
    { w: 'sara', r: 'Bar', off: 2, s: '16:00', e: '23:30' },
    { w: 'aisha', r: 'Kitchen', off: 2, s: '10:00', e: '18:00' },
    { w: 'dan', r: 'Floor', off: 3, s: '18:00', e: '23:00' },
    { w: 'priya', r: 'Bar', off: 3, s: '17:00', e: '23:30' },
    { w: 'tom', r: 'Kitchen', off: 4, s: '12:00', e: '20:00' },
    { w: 'sara', r: 'Bar', off: 5, s: '16:00', e: '23:30' },
    { w: 'mia', r: 'Floor', off: 5, s: '12:00', e: '18:00' },
    { w: 'liam', r: 'Floor', off: 6, s: '11:00', e: '19:00' },
    { w: 'aisha', r: 'Host', off: 6, s: '12:00', e: '18:00' },
  ];
  rota.forEach((x, i) => {
    if (x.off === TODAY_DOW) return;
    const past = x.off < TODAY_DOW;
    list.push(
      S({
        companyId: 'oak',
        workerId: x.w,
        role: x.r,
        date: dk(x.off),
        start: x.s,
        end: x.e,
        status: past ? 'completed' : 'scheduled',
        clockIn: past ? x.s : null,
        clockOut: past ? x.e : null,
        approved: past ? i % 3 !== 0 : false,
      }),
    );
  });

  list.push(S({ companyId: 'oak', workerId: 'priya', role: 'Bar', date: T, start: '10:00', end: '18:00', status: 'active', clockIn: '09:58' }));
  list.push(S({ companyId: 'oak', workerId: 'tom', role: 'Kitchen', date: T, start: '12:00', end: '20:00', status: 'active', clockIn: '12:03' }));
  list.push(S({ companyId: 'oak', workerId: 'mia', role: 'Floor', date: T, start: '09:00', end: '15:00', status: 'active', clockIn: '08:55' }));
  list.push(S({ companyId: 'oak', workerId: 'sara', role: 'Bar', date: T, start: '17:00', end: '23:30' }));
  list.push(S({ id: 'jamie-today', companyId: 'oak', workerId: 'jamie', role: 'Floor', date: T, start: '14:00', end: '22:00' }));

  list.push(S({ companyId: 'bright', workerId: 'jamie', role: 'Care Assistant', date: dk(Math.min(TODAY_DOW + 1, 6)), start: '07:00', end: '15:00', rate: 13.1 }));
  list.push(S({ companyId: 'metro', workerId: 'jamie', role: 'Picker / Packer', date: dk(Math.min(TODAY_DOW + 3, 6)), start: '22:00', end: '06:00', rate: 12.85 }));
  list.push(S({ companyId: 'bright', workerId: 'jamie', role: 'Care Assistant', date: dk(6), start: '08:00', end: '14:00', rate: 13.1 }));

  list.push(S({ id: 'open-oak-1', companyId: 'oak', role: 'Floor', date: dk(5), start: '18:00', end: '23:30', status: 'open', rate: 12.6 }));
  list.push(S({ id: 'open-oak-2', companyId: 'oak', role: 'Kitchen', date: dk(6), start: '11:00', end: '17:00', status: 'open', rate: 13.4 }));
  list.push(S({ id: 'open-bright', companyId: 'bright', role: 'Care Assistant', date: dk(6), start: '07:00', end: '15:00', status: 'open', rate: 13.1 }));
  list.push(S({ id: 'open-metro', companyId: 'metro', role: 'Picker / Packer', date: dk(4), start: '22:00', end: '06:00', status: 'open', rate: 12.85 }));

  list.push(S({ companyId: 'oak', workerId: 'jamie', role: 'Floor', date: dk(-2), start: '17:00', end: '23:15', status: 'completed', clockIn: '16:58', clockOut: '23:18', approved: true }));
  list.push(S({ companyId: 'bright', workerId: 'jamie', role: 'Care Assistant', date: dk(-3), start: '07:00', end: '15:00', status: 'completed', clockIn: '06:54', clockOut: '15:06', rate: 13.1, approved: true }));
  list.push(S({ companyId: 'metro', workerId: 'jamie', role: 'Picker / Packer', date: dk(-4), start: '22:00', end: '06:00', status: 'completed', clockIn: '21:56', clockOut: '06:02', rate: 12.85, approved: false }));
  list.push(S({ companyId: 'oak', workerId: 'liam', role: 'Floor', date: dk(-1), start: '11:00', end: '19:00', status: 'completed', clockIn: '11:02', clockOut: '19:24', approved: false }));
  list.push(S({ companyId: 'oak', workerId: 'priya', role: 'Bar', date: dk(-1), start: '17:00', end: '23:00', status: 'completed', clockIn: '16:55', clockOut: '23:12', approved: false }));
  list.push(S({ companyId: 'oak', workerId: 'tom', role: 'Kitchen', date: dk(-2), start: '10:00', end: '18:00', status: 'completed', clockIn: '09:48', clockOut: '18:05', approved: false }));
  list.push(S({ companyId: 'oak', workerId: 'aisha', role: 'Kitchen', date: dk(-3), start: '10:00', end: '18:00', status: 'completed', clockIn: '10:01', clockOut: '18:00', approved: true }));

  return list;
}

function seedMessages(): Thread[] {
  return [
    {
      id: 'm-jamie',
      workerId: 'jamie',
      unread: false,
      msgs: [
        { from: 'manager', text: 'Hi Jamie — can you cover the bar Saturday evening? Shift\u2019s on the open list.', t: 'Mon 09:12' },
        { from: 'worker', text: 'Morning! I\u2019ll take a look and grab it if I can.', t: 'Mon 09:40' },
      ],
    },
    {
      id: 'm-priya',
      workerId: 'priya',
      unread: true,
      msgs: [{ from: 'worker', text: 'Running 5 mins late, bus delay — nearly there!', t: 'Today 09:53' }],
    },
    {
      id: 'm-tom',
      workerId: 'tom',
      unread: false,
      msgs: [
        { from: 'manager', text: 'Great work on the lunch rush yesterday \u{1F44F}', t: 'Yesterday 20:10' },
        { from: 'worker', text: 'Cheers! Busy one.', t: 'Yesterday 20:22' },
      ],
    },
    {
      id: 'm-mia',
      workerId: 'mia',
      unread: true,
      msgs: [{ from: 'worker', text: 'Can I swap my Friday floor shift? Something\u2019s come up.', t: 'Today 11:30' }],
    },
  ];
}

function seedAvailability(): Availability {
  return {
    Mon: { morning: true, afternoon: true, evening: false, night: false },
    Tue: { morning: false, afternoon: true, evening: true, night: false },
    Wed: { morning: true, afternoon: true, evening: true, night: false },
    Thu: { morning: false, afternoon: false, evening: true, night: true },
    Fri: { morning: false, afternoon: true, evening: true, night: true },
    Sat: { morning: true, afternoon: true, evening: true, night: false },
    Sun: { morning: false, afternoon: false, evening: false, night: false },
  };
}

export function initialData(): RotaData {
  return { shifts: seedShifts(), messages: seedMessages(), availability: seedAvailability() };
}
