import { Badge, Card, CompanyDot, Eyebrow } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { companyById, NOW, workerById } from '../data/seed';
import { fmtUK, parseKey, workedHours } from '../data/helpers';
import { jamieShifts, sortKey } from './selectors';
import type { RotaData } from '../data/types';

function MiniStat({ label, value, on }: { label: string; value: string | number; on?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>{value}</div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          opacity: on ? 0.8 : 1,
          color: on ? 'inherit' : 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function TimesheetScreen({ data, onOpenShift }: { data: RotaData; onOpenShift: (id: string) => void }) {
  const mine = jamieShifts(data)
    .filter((s) => s.status === 'completed')
    .sort((a, b) => sortKey(b) - sortKey(a));
  const inMonth = (s: { date: string }) => {
    const d = parseKey(s.date);
    return d.getMonth() === NOW.getMonth() && d.getFullYear() === NOW.getFullYear();
  };
  const monthShifts = mine.filter(inMonth);
  const totalHours = monthShifts.reduce((a, s) => a + workedHours(s), 0);
  const totalPay = monthShifts.reduce((a, s) => a + workedHours(s) * s.rate, 0);
  const pending = mine.filter((s) => !s.approved).length;
  const jamie = workerById('jamie')!;

  return (
    <div style={{ padding: '6px 18px 24px' }}>
      <div
        style={{
          borderRadius: 22,
          padding: 18,
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          marginBottom: 14,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8 }}>
          {NOW.toLocaleDateString('en-GB', { month: 'long' })} earnings
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: '4px 0 2px' }}>£{totalPay.toFixed(2)}</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
          <MiniStat label="Hours" value={totalHours.toFixed(1)} on />
          <MiniStat label="Shifts" value={monthShifts.length} on />
          <MiniStat label="Pending" value={pending} on />
        </div>
      </div>

      <Card pad={15} style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--positive-soft)',
            color: 'var(--positive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="sun" size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>Holiday accrued</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>
            12.07% of hours worked · all employers
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)' }}>{jamie.holiday}h</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>≈ {(jamie.holiday / 8).toFixed(1)} days</div>
        </div>
      </Card>

      <Eyebrow style={{ marginBottom: 10 }}>Recent timesheets</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mine.map((s) => {
          const co = companyById(s.companyId);
          return (
            <Card key={s.id} pad={0} hover onClick={() => onOpenShift(s.id)} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 4, alignSelf: 'stretch', background: co.color }} />
                <div style={{ flex: 1, padding: '13px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{s.role}</span>
                    {s.approved ? (
                      <Badge tone="positive">
                        <Icon name="check" size={12} /> Approved
                      </Badge>
                    ) : (
                      <Badge tone="warning">Pending</Badge>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12.5,
                      color: 'var(--ink-2)',
                      fontWeight: 600,
                    }}
                  >
                    <CompanyDot company={co} size={8} />
                    {co.short}
                    <span style={{ color: 'var(--line-2)' }}>·</span>
                    {fmtUK(s.date)}
                    <span style={{ color: 'var(--line-2)' }}>·</span>
                    {workedHours(s).toFixed(1)}h
                  </div>
                </div>
                <div style={{ padding: '0 16px', fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
                  £{(workedHours(s) * s.rate).toFixed(0)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
