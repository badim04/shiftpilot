import { useEffect, useState } from 'react';
import { Avatar, Badge, Btn, LiveDot } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { DAYS, dk, TODAY_KEY, WORKERS, workerById } from '../data/seed';
import { dur, fmtDayNum, fmtLong, fmtUK, payOf } from '../data/helpers';
import { PageHeader } from './PageHeader';
import { Field, HOURS, ModalShell, Select } from './modals';
import type { Actions } from '../data/store';
import type { RotaData, Shift, Worker } from '../data/types';

const ROLES = ['Bar', 'Floor', 'Kitchen', 'Host'];

function RowLabel({
  worker,
  title,
  sub,
}: {
  worker?: Worker;
  title?: string;
  sub?: string;
}) {
  if (worker)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 2px' }}>
        <Avatar worker={worker} size={32} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {worker.first}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>£{worker.rate.toFixed(2)}/hr</div>
        </div>
      </div>
    );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 2px' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          border: '1.5px dashed var(--accent)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="briefcase" size={16} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{sub}</div>
      </div>
    </div>
  );
}

function ShiftChip({ s, onRemove }: { s: Shift; onRemove: () => void }) {
  const tone: [string, string] =
    s.status === 'active'
      ? ['var(--positive)', 'var(--positive-soft)']
      : s.status === 'completed'
        ? ['var(--ink-2)', 'var(--surface-3)']
        : ['var(--accent)', 'var(--accent-soft)'];
  return (
    <div
      className="shift-chip"
      style={{ position: 'relative', borderRadius: 8, padding: '6px 8px', background: tone[1], minHeight: 42 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {s.status === 'active' && <LiveDot />}
        <span style={{ fontSize: 11.5, fontWeight: 800, color: tone[0] }}>{s.role}</span>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: tone[0], opacity: 0.85, marginTop: 1 }}>
        {s.start}–{s.end}
      </div>
      <button
        className="chip-x"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          position: 'absolute',
          top: 3,
          right: 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--surface)',
          color: 'var(--ink-2)',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <Icon name="x" size={11} />
      </button>
    </div>
  );
}

function AddShiftModal({
  init,
  actions,
  onClose,
}: {
  init: { date: string; workerId: string };
  actions: Actions;
  onClose: () => void;
}) {
  const [workerId, setW] = useState(init.workerId);
  const [date, setDate] = useState(init.date);
  const [role, setRole] = useState('Floor');
  const [start, setStart] = useState('17:00');
  const [end, setEnd] = useState('23:00');
  const w = workerById(workerId);
  const hrs = dur(start, end);
  const cost = hrs * (w ? w.rate : 12.6);

  return (
    <ModalShell title="Add shift" onClose={onClose}>
      <Field label="Staff member">
        <Select value={workerId} onChange={setW} options={WORKERS.map((x) => ({ value: x.id, label: x.name }))} />
      </Field>
      <Field label="Day">
        <Select
          value={date}
          onChange={setDate}
          options={DAYS.map((d, i) => ({ value: dk(i), label: `${d} ${fmtDayNum(dk(i))}` }))}
        />
      </Field>
      <Field label="Role">
        <div style={{ display: 'flex', gap: 7 }}>
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                background: role === r ? 'var(--accent)' : 'var(--surface-3)',
                color: role === r ? 'var(--accent-ink)' : 'var(--ink-2)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </Field>
      <div style={{ display: 'flex', gap: 12 }}>
        <Field label="Start" style={{ flex: 1 }}>
          <Select value={start} onChange={setStart} options={HOURS.map((h) => ({ value: h, label: h }))} />
        </Field>
        <Field label="End" style={{ flex: 1 }}>
          <Select value={end} onChange={setEnd} options={HOURS.map((h) => ({ value: h, label: h }))} />
        </Field>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: 12,
          background: 'var(--surface-3)',
          marginTop: 4,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
          {hrs}h · {w && w.first}
        </span>
        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>£{cost.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <Btn variant="ghost" full onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          full
          onClick={() => {
            actions.addShift({ workerId, date, role, start, end, rate: w ? w.rate : 12.6 });
            onClose();
          }}
        >
          Add to rota
        </Btn>
      </div>
    </ModalShell>
  );
}

function DayDetailSheet({
  date,
  data,
  actions,
  onClose,
  onAdd,
}: {
  date: string;
  data: RotaData;
  actions: Actions;
  onClose: () => void;
  onAdd: (workerId: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dayShifts = data.shifts.filter((s) => s.companyId === 'oak' && s.date === date);
  const open = dayShifts.filter((s) => s.status === 'open');
  const filled = WORKERS.map((w) => ({
    w,
    shifts: dayShifts.filter((s) => s.workerId === w.id),
  }));
  const staffed = filled.filter((r) => r.shifts.length > 0);
  const idle = filled.filter((r) => r.shifts.length === 0);
  const totalHrs = dayShifts
    .filter((s) => s.status !== 'open')
    .reduce((a, s) => a + dur(s.start, s.end), 0);
  const totalCost = dayShifts.filter((s) => s.status !== 'open').reduce((a, s) => a + payOf(s), 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 92%)',
          height: '100%',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--line)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'rotaSlideR .22s ease',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
            >
              {date === TODAY_KEY ? 'Today' : ''}
            </div>
            <h2
              style={{
                margin: '2px 0 4px',
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--ink)',
                letterSpacing: -0.4,
              }}
            >
              {fmtLong(date)}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>
              {staffed.length} staff · {totalHrs.toFixed(0)} hrs · £{totalCost.toFixed(0)} labour
              {open.length > 0 && (
                <>
                  {' · '}
                  <span style={{ color: 'var(--accent)' }}>{open.length} open</span>
                </>
              )}
            </div>
          </div>
          <Btn variant="primary" size="sm" onClick={() => onAdd(WORKERS[0].id)}>
            <Icon name="plus" size={14} /> Add shift
          </Btn>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--surface-3)',
              color: 'var(--ink-2)',
              width: 32,
              height: 32,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 28px' }}>
          {open.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  marginBottom: 9,
                }}
              >
                Open shifts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {open.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 14px',
                      borderRadius: 13,
                      border: '1.5px dashed var(--accent)',
                      background: 'var(--accent-soft)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--accent)',
                        color: 'var(--accent-ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="briefcase" size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{s.role}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                        {s.start}–{s.end} · £{s.rate.toFixed(2)}/hr
                      </div>
                    </div>
                    <Btn variant="ghost" size="sm" onClick={() => actions.removeShift(s.id)}>
                      <Icon name="x" size={13} /> Unpost
                    </Btn>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 9,
            }}
          >
            Rostered ({staffed.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            {staffed.map(({ w, shifts }) => (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '12px 14px',
                  borderRadius: 13,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                }}
              >
                <Avatar worker={w} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                    £{w.rate.toFixed(2)}/hr
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                  {shifts.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 9,
                        background:
                          s.status === 'active'
                            ? 'var(--positive-soft)'
                            : s.status === 'completed'
                              ? 'var(--surface-3)'
                              : 'var(--accent-soft)',
                        color:
                          s.status === 'active'
                            ? 'var(--positive)'
                            : s.status === 'completed'
                              ? 'var(--ink-2)'
                              : 'var(--accent)',
                      }}
                    >
                      {s.status === 'active' && <LiveDot />}
                      <span style={{ fontSize: 12.5, fontWeight: 800 }}>{s.role}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {s.start}–{s.end}
                      </span>
                      <button
                        onClick={() => actions.removeShift(s.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: 2,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <Btn variant="soft" size="sm" onClick={() => onAdd(w.id)}>
                  <Icon name="plus" size={13} /> Another
                </Btn>
              </div>
            ))}
            {staffed.length === 0 && (
              <div
                style={{
                  padding: '24px 14px',
                  textAlign: 'center',
                  color: 'var(--ink-3)',
                  fontSize: 13,
                  fontWeight: 600,
                  background: 'var(--surface)',
                  border: '1px dashed var(--line-2)',
                  borderRadius: 13,
                }}
              >
                Nobody rostered for this day yet.
              </div>
            )}
          </div>

          {idle.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  marginBottom: 9,
                }}
              >
                Not scheduled ({idle.length})
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))',
                  gap: 8,
                }}
              >
                {idle.map(({ w }) => (
                  <button
                    key={w.id}
                    onClick={() => onAdd(w.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <Avatar worker={w} size={28} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                      {w.first}
                    </span>
                    <Badge tone="accent">+</Badge>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RotaView({ data, actions }: { data: RotaData; actions: Actions }) {
  const [add, setAdd] = useState<{ date: string; workerId: string } | null>(null);
  const [published, setPublished] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const oakShifts = data.shifts.filter((s) => s.companyId === 'oak');
  const roster = WORKERS;
  const weekHours = oakShifts.filter((s) => s.status !== 'open').reduce((a, s) => a + dur(s.start, s.end), 0);
  const weekCost = oakShifts.filter((s) => s.status !== 'open').reduce((a, s) => a + payOf(s), 0);

  const openByDay = (i: number) => oakShifts.filter((s) => s.status === 'open' && s.date === dk(i));
  const cellShifts = (wid: string, i: number) =>
    oakShifts.filter((s) => s.workerId === wid && s.date === dk(i));
  const countByDay = (i: number) =>
    oakShifts.filter((s) => s.date === dk(i) && s.status !== 'open').length;

  return (
    <>
      <PageHeader
        title="Weekly rota"
        sub={`Week of ${fmtUK(dk(0))} · ${weekHours.toFixed(0)} hrs · £${weekCost.toFixed(0)} labour`}
        right={
          <>
            <Btn
              variant="ghost"
              size="md"
              onClick={() => setAdd({ date: TODAY_KEY, workerId: roster[0].id })}
            >
              <Icon name="plus" size={16} /> Add shift
            </Btn>
            <Btn variant={published ? 'positive' : 'primary'} size="md" onClick={() => setPublished(true)}>
              {published ? (
                <>
                  <Icon name="check" size={16} /> Published
                </>
              ) : (
                <>Publish rota</>
              )}
            </Btn>
          </>
        }
      />
      {published && (
        <div
          style={{
            flexShrink: 0,
            padding: '9px 26px',
            background: 'var(--positive-soft)',
            color: 'var(--positive)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Icon name="checkCircle" size={16} /> Rota published — all {roster.length} staff notified for week of {fmtUK(dk(0))}.
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 26px 28px' }}>
        <div style={{ minWidth: 780 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
            <div />
            {DAYS.map((d, i) => {
              const today = dk(i) === TODAY_KEY;
              const n = countByDay(i);
              return (
                <button
                  key={d}
                  onClick={() => setExpandedDay(dk(i))}
                  title="Open day"
                  style={{
                    textAlign: 'center',
                    padding: '6px 0',
                    borderRadius: 10,
                    background: today ? 'var(--accent-soft)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    position: 'relative',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={(e) => {
                    if (!today) e.currentTarget.style.background = 'var(--surface-3)';
                  }}
                  onMouseLeave={(e) => {
                    if (!today) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: today ? 'var(--accent)' : 'var(--ink-3)',
                      letterSpacing: 0.5,
                    }}
                  >
                    {d}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: today ? 'var(--accent)' : 'var(--ink)' }}>
                    {fmtDayNum(dk(i))}
                  </div>
                  {n > 0 && (
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: today ? 'var(--accent)' : 'var(--ink-3)',
                        marginTop: 1,
                        opacity: 0.85,
                      }}
                    >
                      {n} on
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
            <RowLabel title="Open shifts" sub="Unfilled" />
            {DAYS.map((d, i) => (
              <div key={d} style={{ minHeight: 54, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {openByDay(i).map((s) => (
                  <div
                    key={s.id}
                    style={{
                      borderRadius: 9,
                      padding: '7px 8px',
                      border: '1.5px dashed var(--accent)',
                      background: 'var(--accent-soft)',
                    }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)' }}>{s.role}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--accent)', opacity: 0.8 }}>
                      {s.start}–{s.end}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {roster.map((w) => (
            <div
              key={w.id}
              style={{ display: 'grid', gridTemplateColumns: '160px repeat(7,1fr)', gap: 8, marginBottom: 8 }}
            >
              <RowLabel worker={w} />
              {DAYS.map((d, i) => {
                const cs = cellShifts(w.id, i);
                return (
                  <div
                    key={d}
                    onClick={() => cs.length === 0 && setAdd({ date: dk(i), workerId: w.id })}
                    className="rota-cell"
                    style={{
                      minHeight: 54,
                      borderRadius: 9,
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: cs.length ? 5 : 0,
                      cursor: cs.length ? 'default' : 'pointer',
                    }}
                  >
                    {cs.map((s) => (
                      <ShiftChip key={s.id} s={s} onRemove={() => actions.removeShift(s.id)} />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {expandedDay && (
        <DayDetailSheet
          date={expandedDay}
          data={data}
          actions={actions}
          onClose={() => setExpandedDay(null)}
          onAdd={(workerId) => setAdd({ date: expandedDay, workerId })}
        />
      )}
      {add && <AddShiftModal init={add} actions={actions} onClose={() => setAdd(null)} />}
    </>
  );
}
