import type { Availability, Day, Period, RotaData, Shift, ShiftStatus, Thread } from '../data/types';
import { requireSupabase } from './supabase';

interface ShiftRow {
  id: string;
  company_id: string;
  worker_id: string | null;
  role: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  rate: number;
  status: ShiftStatus;
  clock_in: string | null;
  clock_out: string | null;
  break_mins: number;
  swap: boolean;
  drop_req: boolean;
  approved: boolean;
}
interface ThreadRow {
  id: string;
  worker_id: string;
  unread: boolean;
}
interface MessageRow {
  id: number;
  thread_id: string;
  sender: 'manager' | 'worker';
  body: string;
  ts_label: string;
}
interface AvailRow {
  worker_id: string;
  day: Day;
  period: Period;
  available: boolean;
}

const shiftFromRow = (r: ShiftRow): Shift => ({
  id: r.id,
  companyId: r.company_id as Shift['companyId'],
  workerId: r.worker_id,
  role: r.role,
  date: r.shift_date,
  start: r.start_time,
  end: r.end_time,
  rate: Number(r.rate),
  status: r.status,
  clockIn: r.clock_in,
  clockOut: r.clock_out,
  breakMins: r.break_mins,
  swap: r.swap,
  drop: r.drop_req,
  approved: r.approved,
});

const blankAvail = (): Availability => ({
  Mon: { morning: false, afternoon: false, evening: false, night: false },
  Tue: { morning: false, afternoon: false, evening: false, night: false },
  Wed: { morning: false, afternoon: false, evening: false, night: false },
  Thu: { morning: false, afternoon: false, evening: false, night: false },
  Fri: { morning: false, afternoon: false, evening: false, night: false },
  Sat: { morning: false, afternoon: false, evening: false, night: false },
  Sun: { morning: false, afternoon: false, evening: false, night: false },
});

export async function seedIfEmpty(): Promise<void> {
  const sb = requireSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return;
  await sb.rpc('rota_seed_for_user', { p_uid: u.user.id });
}

export async function fetchAll(): Promise<RotaData> {
  const sb = requireSupabase();
  const [shifts, threads, messages, avail] = await Promise.all([
    sb.from('shifts').select('*').order('shift_date', { ascending: true }),
    sb.from('threads').select('*'),
    sb.from('messages').select('*').order('id', { ascending: true }),
    sb.from('availability').select('*'),
  ]);
  if (shifts.error) throw shifts.error;
  if (threads.error) throw threads.error;
  if (messages.error) throw messages.error;
  if (avail.error) throw avail.error;

  const tMap = new Map<string, Thread>();
  (threads.data as ThreadRow[]).forEach((t) =>
    tMap.set(t.id, { id: t.id, workerId: t.worker_id, unread: t.unread, msgs: [] }),
  );
  (messages.data as MessageRow[]).forEach((m) => {
    const t = tMap.get(m.thread_id);
    if (t) t.msgs.push({ from: m.sender, text: m.body, t: m.ts_label });
  });

  const availability = blankAvail();
  (avail.data as AvailRow[]).forEach((a) => {
    if (a.worker_id === 'jamie' && availability[a.day]) {
      availability[a.day][a.period] = a.available;
    }
  });

  return {
    shifts: (shifts.data as ShiftRow[]).map(shiftFromRow),
    messages: Array.from(tMap.values()),
    availability,
  };
}

export async function updateShift(id: string, patch: Partial<ShiftRow>): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('shifts').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteShift(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('shifts').delete().eq('id', id);
  if (error) throw error;
}

export async function insertShift(s: Omit<ShiftRow, 'id'> & { id: string }): Promise<void> {
  const sb = requireSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error('Not signed in');
  const { error } = await sb.from('shifts').insert({ ...s, owner_id: u.user.id });
  if (error) throw error;
}

export async function insertMessage(threadId: string, sender: 'manager' | 'worker', body: string): Promise<void> {
  const sb = requireSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error('Not signed in');
  const { error } = await sb.from('messages').insert({
    owner_id: u.user.id,
    thread_id: threadId,
    sender,
    body,
    ts_label: 'Now',
  });
  if (error) throw error;
  await sb.from('threads').update({ unread: false, updated_at: new Date().toISOString() }).eq('id', threadId);
}

export async function markThreadRead(threadId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from('threads').update({ unread: false }).eq('id', threadId);
  if (error) throw error;
}

export async function upsertAvailability(workerId: string, day: Day, period: Period, available: boolean): Promise<void> {
  const sb = requireSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error('Not signed in');
  const { error } = await sb.from('availability').upsert(
    { owner_id: u.user.id, worker_id: workerId, day, period, available },
    { onConflict: 'owner_id,worker_id,day,period' },
  );
  if (error) throw error;
}

export function subscribeAll(onChange: () => void): () => void {
  const sb = requireSupabase();
  const ch = sb
    .channel('rota-app')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, onChange)
    .subscribe();
  return () => {
    sb.removeChannel(ch);
  };
}
