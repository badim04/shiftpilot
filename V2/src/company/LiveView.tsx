import { Avatar, Badge, Card, Eyebrow, LiveDot } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { elapsedStr, fmtHM, useRotaClock } from '../ui/hooks';
import { NOW, TODAY_KEY, workerById } from '../data/seed';
import { dur, toMin } from '../data/helpers';
import { PageHeader } from './PageHeader';
import type { RotaData } from '../data/types';

function BigStat({ value, label, tone }: { value: string | number; label: string; tone?: 'positive' }) {
  const c = tone === 'positive' ? 'var(--positive)' : 'var(--ink)';
  return (
    <Card pad={16}>
      <div style={{ fontSize: 32, fontWeight: 800, color: c, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </Card>
  );
}

export function LiveView({ data }: { data: RotaData }) {
  const clock = useRotaClock();
  const oak = data.shifts.filter((s) => s.companyId === 'oak' && s.date === TODAY_KEY);
  const active = oak.filter((s) => s.status === 'active');
  const scheduled = oak.filter((s) => s.status === 'scheduled');
  const done = oak.filter((s) => s.status === 'completed');
  const hoursToday = oak.reduce((a, s) => a + dur(s.start, s.end), 0);
  const nowMin = clock.getHours() * 60 + clock.getMinutes();

  return (
    <>
      <PageHeader
        title="On shift now"
        sub={`${NOW.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · live`}
        right={
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 700,
              color: 'var(--ink-2)',
            }}
          >
            <LiveDot /> {fmtHM(clock)}
          </span>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 26px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          <BigStat value={active.length} label="On shift" tone="positive" />
          <BigStat value={scheduled.length} label="Yet to start" />
          <BigStat value={done.length} label="Finished" />
          <BigStat value={`${hoursToday.toFixed(0)}h`} label="Rostered today" />
        </div>

        <Eyebrow style={{ marginBottom: 12 }}>Currently clocked in</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
          {active.map((s) => {
            const w = workerById(s.workerId)!;
            return (
              <Card key={s.id} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar worker={w} size={46} />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: 'var(--positive)',
                      border: '2.5px solid var(--surface)',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{w.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>
                    {s.role} · {s.start}–{s.end}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--positive)', whiteSpace: 'nowrap' }}>
                    {elapsedStr(s.clockIn!, clock)}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>in at {s.clockIn}</div>
                </div>
              </Card>
            );
          })}
          {active.length === 0 && (
            <div
              style={{
                gridColumn: '1/-1',
                color: 'var(--ink-3)',
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 2px',
              }}
            >
              Nobody clocked in right now.
            </div>
          )}
        </div>

        <Eyebrow style={{ marginBottom: 12 }}>Starting later today</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {scheduled
            .sort((a, b) => toMin(a.start) - toMin(b.start))
            .map((s) => {
              const w = workerById(s.workerId)!;
              const late = nowMin > toMin(s.start) + 5;
              return (
                <Card key={s.id} pad={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar worker={w} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{w.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{s.role}</div>
                  </div>
                  {late ? (
                    <Badge tone="warning">
                      <Icon name="alert" size={12} /> Not clocked in
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Starts {s.start}</Badge>
                  )}
                </Card>
              );
            })}
          {scheduled.length === 0 && (
            <div style={{ color: 'var(--ink-3)', fontSize: 14, fontWeight: 600 }}>
              No more shifts scheduled today.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
