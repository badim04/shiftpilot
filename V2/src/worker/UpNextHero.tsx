import { Btn, Card, CompanyDot, Eyebrow } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { elapsedStr } from '../ui/hooks';
import { companyById, TODAY_KEY } from '../data/seed';
import { dur, payOf, relDayLabel } from '../data/helpers';
import type { Shift } from '../data/types';

function HeroStat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)', marginBottom: 4 }}>
        <Icon name={icon} size={13} />
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
    </div>
  );
}

export function UpNextHero({
  s,
  onOpen,
  onClockIn,
  onClockOut,
  clock,
}: {
  s: Shift | null;
  onOpen: () => void;
  onClockIn: () => void;
  onClockOut: () => void;
  clock: Date;
}) {
  if (!s)
    return (
      <Card style={{ textAlign: 'center', padding: '26px 18px' }}>
        <div style={{ color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 600 }}>No upcoming shifts.</div>
        <div style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>Pick one up from the open list.</div>
      </Card>
    );
  const co = companyById(s.companyId);
  const active = s.status === 'active';
  const isToday = s.date === TODAY_KEY;
  const canClockIn = isToday && s.status === 'scheduled';

  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: active ? 'var(--positive-soft)' : 'var(--accent-soft)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Eyebrow style={{ color: active ? 'var(--positive)' : 'var(--accent)' }}>
            {active ? 'On shift now' : isToday ? 'Up next · Today' : `Up next · ${relDayLabel(s.date)}`}
          </Eyebrow>
          <span onClick={onOpen} style={{ cursor: 'pointer', color: 'var(--ink-3)', display: 'flex' }}>
            <Icon name="arrowR" size={18} />
          </span>
        </div>
        <div onClick={onOpen} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>{s.role}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, marginBottom: 14 }}>
            <CompanyDot company={co} size={11} />
            <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink-2)' }}>{co.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 22, marginBottom: 16 }}>
            <HeroStat
              icon="clock"
              label={active ? 'Clocked in' : 'Starts'}
              value={active ? s.clockIn! : `${s.start}`}
              sub={active ? `${elapsedStr(s.clockIn!, clock)} elapsed` : `ends ${s.end}`}
            />
            <HeroStat
              icon="pound"
              label="Est. pay"
              value={`£${payOf(s).toFixed(0)}`}
              sub={`${dur(s.start, s.end)}h @ £${s.rate.toFixed(2)}`}
            />
          </div>
        </div>
        {canClockIn && (
          <Btn variant="primary" full size="lg" onClick={onClockIn}>
            <Icon name="play" size={17} fill /> Clock in
          </Btn>
        )}
        {active && (
          <Btn variant="positive" full size="lg" onClick={onClockOut}>
            <Icon name="stop" size={16} fill /> Clock out
          </Btn>
        )}
        {!canClockIn && !active && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              padding: '12px',
              borderRadius: 12,
              background: 'var(--surface-3)',
              color: 'var(--ink-2)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <Icon name="calendar" size={16} /> {relDayLabel(s.date)} · {s.start}–{s.end}
          </div>
        )}
      </div>
    </div>
  );
}
