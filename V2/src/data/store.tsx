import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Day, Mode, Period, RotaData, Shift } from './types';
import { S, initialData, MIN_NOW, NOW } from './seed';
import { toMin } from './helpers';
import { supabase, supabaseConfigured } from '../lib/supabase';
import {
  deleteShift,
  fetchAll,
  insertMessage,
  insertShift,
  markThreadRead,
  seedIfEmpty,
  subscribeAll,
  updateShift,
  upsertAvailability,
} from '../lib/db';

const STORE_KEY = 'rota_app_v2';
const boot = Date.now();
const vNow = () => new Date(NOW.getTime() + (Date.now() - boot));
const vNowHM = () => {
  const d = vNow();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface Persisted {
  data: RotaData;
  mode: Mode;
}

function loadStore(): Persisted | null {
  try {
    const r = localStorage.getItem(STORE_KEY);
    if (r) return JSON.parse(r) as Persisted;
  } catch {
    /* ignore */
  }
  return null;
}
function saveStore(p: Persisted) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export interface Actions {
  clockIn(id: string): void;
  clockOut(id: string): void;
  acceptOpen(id: string): void;
  requestSwap(id: string): void;
  dropShift(id: string): void;
  toggleAvailability(day: Day, period: Period): void;
  addShift(p: { workerId: string; date: string; role: string; start: string; end: string; rate: number }): void;
  removeShift(id: string): void;
  postOpenShift(p: { date: string; role: string; start: string; end: string; rate: number }): void;
  approveTimesheet(id: string): void;
  sendMessage(tid: string, text: string): void;
  readThread(tid: string): void;
  reset(): void;
}

interface StoreCtx {
  data: RotaData;
  mode: Mode;
  setMode(m: Mode): void;
  actions: Actions;
  online: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const persisted = useMemo(() => loadStore(), []);
  const [data, setData] = useState<RotaData>(() => persisted?.data || initialData());
  const [mode, setMode] = useState<Mode>(() => persisted?.mode || 'landing');
  const online = Boolean(userId && supabaseConfigured && supabase);
  const onlineRef = useRef(online);
  onlineRef.current = online;

  // localStorage demo persistence (only when NOT signed in)
  useEffect(() => {
    if (online) return;
    saveStore({ data, mode });
  }, [data, mode, online]);

  // initial fetch + realtime when signed in
  useEffect(() => {
    if (!online) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        await seedIfEmpty();
        const d = await fetchAll();
        if (!cancelled) setData(d);
      } catch (e) {
        console.error('rota: fetch failed', e);
      }
    };
    refresh();
    const unsub = subscribeAll(() => {
      fetchAll()
        .then((d) => !cancelled && setData(d))
        .catch((e) => console.error('rota: refetch failed', e));
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [online, userId]);

  const tx = useCallback((fn: (n: RotaData) => void) => {
    setData((d) => {
      const next: RotaData = {
        shifts: d.shifts.map((s) => ({ ...s })),
        messages: d.messages.map((m) => ({ ...m, msgs: [...m.msgs] })),
        availability: JSON.parse(JSON.stringify(d.availability)),
      };
      fn(next);
      return next;
    });
  }, []);

  const findShift = (n: RotaData, id: string): Shift | undefined => n.shifts.find((s) => s.id === id);
  const newId = () => 's_' + Math.random().toString(36).slice(2, 10);

  const actions = useMemo<Actions>(
    () => ({
      clockIn: (id) => {
        const now = vNowHM();
        let target: Shift | undefined;
        tx((n) => {
          const s = findShift(n, id);
          if (s) {
            target = s;
            s.status = 'active';
            s.clockIn = toMin(s.start) <= MIN_NOW ? s.start : now;
          }
        });
        if (onlineRef.current && target) {
          updateShift(id, { status: 'active', clock_in: target.clockIn || now }).catch(console.error);
        }
      },
      clockOut: (id) => {
        const now = vNowHM();
        tx((n) => {
          const s = findShift(n, id);
          if (s) {
            s.status = 'completed';
            s.clockOut = now;
            s.approved = false;
          }
        });
        if (onlineRef.current) {
          updateShift(id, { status: 'completed', clock_out: now, approved: false }).catch(console.error);
        }
      },
      acceptOpen: (id) => {
        tx((n) => {
          const s = findShift(n, id);
          if (s) {
            s.workerId = 'jamie';
            s.status = 'scheduled';
          }
        });
        if (onlineRef.current) {
          updateShift(id, { worker_id: 'jamie', status: 'scheduled' }).catch(console.error);
        }
      },
      requestSwap: (id) => {
        tx((n) => {
          const s = findShift(n, id);
          if (s) s.swap = true;
        });
        if (onlineRef.current) updateShift(id, { swap: true }).catch(console.error);
      },
      dropShift: (id) => {
        tx((n) => {
          const s = findShift(n, id);
          if (s) s.drop = true;
        });
        if (onlineRef.current) updateShift(id, { drop_req: true }).catch(console.error);
      },
      toggleAvailability: (day, period) => {
        let next = false;
        tx((n) => {
          n.availability[day][period] = !n.availability[day][period];
          next = n.availability[day][period];
        });
        if (onlineRef.current) {
          upsertAvailability('jamie', day, period, next).catch(console.error);
        }
      },
      addShift: ({ workerId, date, role, start, end, rate }) => {
        const id = newId();
        tx((n) => {
          n.shifts.push(S({ id, companyId: 'oak', workerId, date, role, start, end, rate, breakMins: 30 }));
        });
        if (onlineRef.current) {
          insertShift({
            id,
            company_id: 'oak',
            worker_id: workerId,
            role,
            shift_date: date,
            start_time: start,
            end_time: end,
            rate,
            status: 'scheduled',
            clock_in: null,
            clock_out: null,
            break_mins: 30,
            swap: false,
            drop_req: false,
            approved: false,
          }).catch(console.error);
        }
      },
      removeShift: (id) => {
        tx((n) => {
          n.shifts = n.shifts.filter((s) => s.id !== id);
        });
        if (onlineRef.current) deleteShift(id).catch(console.error);
      },
      postOpenShift: ({ date, role, start, end, rate }) => {
        const id = newId();
        tx((n) => {
          n.shifts.push(
            S({ id, companyId: 'oak', workerId: null, date, role, start, end, rate, status: 'open', breakMins: 30 }),
          );
        });
        if (onlineRef.current) {
          insertShift({
            id,
            company_id: 'oak',
            worker_id: null,
            role,
            shift_date: date,
            start_time: start,
            end_time: end,
            rate,
            status: 'open',
            clock_in: null,
            clock_out: null,
            break_mins: 30,
            swap: false,
            drop_req: false,
            approved: false,
          }).catch(console.error);
        }
      },
      approveTimesheet: (id) => {
        tx((n) => {
          const s = findShift(n, id);
          if (s) s.approved = true;
        });
        if (onlineRef.current) updateShift(id, { approved: true }).catch(console.error);
      },
      sendMessage: (tid, text) => {
        tx((n) => {
          const m = n.messages.find((x) => x.id === tid);
          if (m) {
            m.msgs.push({ from: 'manager', text, t: 'Now' });
            m.unread = false;
          }
        });
        if (onlineRef.current) insertMessage(tid, 'manager', text).catch(console.error);
      },
      readThread: (tid) => {
        tx((n) => {
          const m = n.messages.find((x) => x.id === tid);
          if (m) m.unread = false;
        });
        if (onlineRef.current) markThreadRead(tid).catch(console.error);
      },
      reset: () => setData(initialData()),
    }),
    [tx],
  );

  return <Ctx.Provider value={{ data, mode, setMode, actions, online }}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
}
