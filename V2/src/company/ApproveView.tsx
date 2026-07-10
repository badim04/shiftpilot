import { Avatar, Badge, Btn, Card, Eyebrow } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { workerById } from '../data/seed';
import { dur, fmtUK, workedHours } from '../data/helpers';
import { sortKey } from '../worker/selectors';
import { PageHeader } from './PageHeader';
import { EmptyCard } from './modals';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

function TS({ label, value, flag }: { label: string; value: string; flag?: boolean }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 78 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 800,
          color: flag ? 'var(--warning)' : 'var(--ink)',
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function ApproveView({ data, actions }: { data: RotaData; actions: Actions }) {
  const all = data.shifts.filter((s) => s.companyId === 'oak' && s.status === 'completed');
  const pending = all.filter((s) => !s.approved).sort((a, b) => sortKey(b) - sortKey(a));
  const approved = all.filter((s) => s.approved);
  const totalDue = pending.reduce((a, s) => a + workedHours(s) * s.rate, 0);

  return (
    <>
      <PageHeader
        title="Timesheets"
        sub={`${pending.length} awaiting approval · £${totalDue.toFixed(2)} to sign off`}
        right={
          pending.length > 0 && (
            <Btn
              variant="positive"
              size="md"
              onClick={() => pending.forEach((s) => actions.approveTimesheet(s.id))}
            >
              <Icon name="check" size={16} /> Approve all
            </Btn>
          )
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 26px 28px' }}>
        <Eyebrow style={{ marginBottom: 12 }}>Awaiting approval</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
          {pending.map((s) => {
            const w = workerById(s.workerId)!;
            const sched = dur(s.start, s.end),
              actual = workedHours(s);
            const over = actual - (sched - (s.breakMins || 0) / 60);
            return (
              <Card key={s.id} pad={15}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <Avatar worker={w} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{w.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                      {s.role} · {fmtUK(s.date)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 22, marginRight: 8 }}>
                    <TS label="Rostered" value={`${s.start}–${s.end}`} />
                    <TS
                      label="Clocked"
                      value={`${s.clockIn}–${s.clockOut}`}
                      flag={Math.abs(over) > 0.12}
                    />
                    <TS label="Pay" value={`£${(actual * s.rate).toFixed(2)}`} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="soft" size="sm" onClick={() => actions.approveTimesheet(s.id)}>
                      Query
                    </Btn>
                    <Btn variant="positive" size="sm" onClick={() => actions.approveTimesheet(s.id)}>
                      <Icon name="check" size={15} /> Approve
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
          {pending.length === 0 && <EmptyCard title="All caught up" sub="No timesheets waiting for approval." />}
        </div>

        {approved.length > 0 && (
          <>
            <Eyebrow style={{ marginBottom: 12 }}>Recently approved</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {approved.map((s) => {
                const w = workerById(s.workerId)!;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 15px',
                      borderRadius: 13,
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <Avatar worker={w} size={32} />
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                      {w.name}{' '}
                      <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
                        · {s.role} · {fmtUK(s.date)}
                      </span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink-2)' }}>
                      £{(workedHours(s) * s.rate).toFixed(2)}
                    </span>
                    <Badge tone="positive">
                      <Icon name="check" size={12} /> Approved
                    </Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
