import { Btn, Card, LiveDot } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { elapsedStr } from '../ui/hooks';
import { companyById, TODAY_KEY } from '../data/seed';
import { dur, fmtLong, payOf, workedHours } from '../data/helpers';
import { Sheet, SheetHeader } from './Sheet';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

function Fact({
  icon,
  label,
  value,
  sub,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 15px',
        borderBottom: last ? 'none' : '1px solid var(--line)',
      }}
    >
      <Icon name={icon} size={18} style={{ color: 'var(--ink-3)' }} />
      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-3)', width: 74 }}>{label}</span>
      <div style={{ flex: 1, textAlign: 'right' }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function ShiftDetail({
  shiftId,
  data,
  actions,
  clock,
  onClose,
}: {
  shiftId: string | null;
  data: RotaData;
  actions: Actions;
  clock: Date;
  onClose: () => void;
}) {
  const s = shiftId ? data.shifts.find((x) => x.id === shiftId) : null;
  if (!s)
    return (
      <Sheet open={false}>
        <div />
      </Sheet>
    );
  const co = companyById(s.companyId);
  const active = s.status === 'active';
  const completed = s.status === 'completed';
  const open = s.status === 'open';
  const isToday = s.date === TODAY_KEY;
  const canClockIn = isToday && s.status === 'scheduled';
  const future = s.status === 'scheduled' && !isToday;

  return (
    <Sheet open={!!shiftId}>
      <SheetHeader title="Shift details" onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: co.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 19,
            }}
          >
            {co.short[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 700 }}>{co.name}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>{s.role}</div>
          </div>
        </div>

        {active && (
          <div
            style={{
              borderRadius: 16,
              padding: '14px 16px',
              background: 'var(--positive-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <LiveDot />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--positive)' }}>
                On shift · clocked in {s.clockIn}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                {elapsedStr(s.clockIn!, clock)} elapsed
              </div>
            </div>
          </div>
        )}

        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 14 }}>
          <Fact icon="calendar" label="Date" value={fmtLong(s.date)} />
          <Fact
            icon="clock"
            label="Time"
            value={`${s.start} – ${s.end}`}
            sub={`${dur(s.start, s.end)}h${s.breakMins ? ` · ${s.breakMins}m break` : ''}`}
          />
          <Fact
            icon="pound"
            label={completed ? 'Earned' : 'Estimated pay'}
            value={`£${(completed ? workedHours(s) * s.rate : payOf(s)).toFixed(2)}`}
            sub={`£${s.rate.toFixed(2)}/hr`}
          />
          {completed && (
            <Fact
              icon="checkCircle"
              label="Clocked"
              value={`${s.clockIn} – ${s.clockOut}`}
              sub={`${workedHours(s).toFixed(2)}h worked`}
              last
            />
          )}
          {!completed && <Fact icon="pin" label="Location" value={`${co.short} — main site`} last />}
        </Card>

        {completed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 14px',
              borderRadius: 13,
              background: s.approved ? 'var(--positive-soft)' : 'var(--warning-soft)',
              marginBottom: 14,
            }}
          >
            <Icon
              name={s.approved ? 'checkCircle' : 'clock'}
              size={18}
              style={{ color: s.approved ? 'var(--positive)' : 'var(--warning)' }}
            />
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: s.approved ? 'var(--positive)' : 'var(--warning)',
              }}
            >
              {s.approved ? 'Approved by manager' : 'Submitted — awaiting approval'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {canClockIn && (
            <Btn variant="primary" full size="lg" onClick={() => actions.clockIn(s.id)}>
              <Icon name="play" size={16} fill /> Clock in now
            </Btn>
          )}
          {active && (
            <Btn
              variant="positive"
              full
              size="lg"
              onClick={() => {
                actions.clockOut(s.id);
                onClose();
              }}
            >
              <Icon name="stop" size={15} fill /> Clock out
            </Btn>
          )}
          {open && (
            <Btn
              variant="primary"
              full
              size="lg"
              onClick={() => {
                actions.acceptOpen(s.id);
                onClose();
              }}
            >
              <Icon name="plus" size={17} /> Pick up this shift
            </Btn>
          )}
          {future && !s.swap && !s.drop && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="soft" full size="lg" onClick={() => actions.requestSwap(s.id)}>
                <Icon name="swap2" size={16} /> Request swap
              </Btn>
              <Btn variant="danger" full size="lg" onClick={() => actions.dropShift(s.id)}>
                <Icon name="x" size={16} /> Drop shift
              </Btn>
            </div>
          )}
          {s.swap && (
            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                borderRadius: 12,
                background: 'var(--warning-soft)',
                color: 'var(--warning)',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Swap requested — manager notified
            </div>
          )}
          {s.drop && (
            <div
              style={{
                textAlign: 'center',
                padding: '12px',
                borderRadius: 12,
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Drop requested — pending cover
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
