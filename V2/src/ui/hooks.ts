import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NOW } from '../data/seed';

export function useRotaClock(intervalMs = 1000): Date {
  const base = NOW.getTime();
  const start = useRef(Date.now()).current;
  const [t, setT] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setT(base + (Date.now() - start)), intervalMs);
    return () => clearInterval(id);
  }, [base, start, intervalMs]);
  return new Date(t);
}

export function fmtHM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function elapsedStr(fromHM: string, now: Date): string {
  const [h, m] = fromHM.split(':').map(Number);
  let mins = now.getHours() * 60 + now.getMinutes() - (h * 60 + m);
  if (mins < 0) mins += 1440;
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${hh}h ${String(mm).padStart(2, '0')}m`;
}

export function useFitScale(targetW: number, targetH: number, pad = 32): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const sx = (r.width - pad) / targetW;
    const sy = (r.height - pad) / targetH;
    const s = Math.min(1, Math.max(0.3, Math.min(sx, sy)));
    setScale(Number.isFinite(s) && s > 0 ? s : 1);
  }, [targetW, targetH, pad]);
  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);
  return [ref, scale];
}
