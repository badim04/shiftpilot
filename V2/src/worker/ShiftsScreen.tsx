import { useState } from 'react';
import { Card, Eyebrow } from '../ui/primitives';
import { TODAY_KEY } from '../data/seed';
import { relDayLabel, toMin } from '../data/helpers';
import { jamieShifts, upNext } from './selectors';
import { UpNextHero } from './UpNextHero';
import { WeekStrip } from './WeekStrip';
import { ShiftRow } from './ShiftRow';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

export function ShiftsScreen({
  data,
  actions,
  onOpenShift,
  clock,
}: {
  data: RotaData;
  actions: Actions;
  onOpenShift: (id: string) => void;
  clock: Date;
}) {
  const [sel, setSel] = useState(TODAY_KEY);
  const next = upNext(data);
  const dayShifts = jamieShifts(data)
    .filter((s) => s.date === sel)
    .sort((a, b) => toMin(a.start) - toMin(b.start));

  return (
    <div style={{ padding: '10px 18px 24px' }}>
      <UpNextHero
        s={next}
        clock={clock}
        onOpen={() => next && onOpenShift(next.id)}
        onClockIn={() => next && actions.clockIn(next.id)}
        onClockOut={() => next && actions.clockOut(next.id)}
      />

      <div style={{ height: 20 }} />
      <Eyebrow style={{ marginBottom: 10 }}>This week</Eyebrow>
      <WeekStrip data={data} selected={sel} onSelect={setSel} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '20px 0 10px' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{relDayLabel(sel)}</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>
          {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dayShifts.map((s) => (
          <ShiftRow key={s.id} s={s} onClick={() => onOpenShift(s.id)} />
        ))}
        {dayShifts.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '30px 18px' }}>
            <div style={{ color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 600 }}>Nothing booked.</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 3 }}>Enjoy the day off — or pick up a shift.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
