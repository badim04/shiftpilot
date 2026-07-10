import { useState } from 'react';
import { Badge, Btn, Card } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { dk, DAYS, WORKERS } from '../data/seed';
import { fmtDayNum, relDayLabel } from '../data/helpers';
import { sortKey } from '../worker/selectors';
import { PageHeader } from './PageHeader';
import { EmptyCard, Field, HOURS, ModalShell, Select } from './modals';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

function PostOpenModal({ actions, onClose }: { actions: Actions; onClose: () => void }) {
  const [date, setDate] = useState(dk(5));
  const [role, setRole] = useState('Floor');
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('23:00');
  const [rate, setRate] = useState('12.60');
  return (
    <ModalShell title="Post an open shift" onClose={onClose}>
      <Field label="Day">
        <Select
          value={date}
          onChange={setDate}
          options={DAYS.map((d, i) => ({ value: dk(i), label: `${d} ${fmtDayNum(dk(i))}` }))}
        />
      </Field>
      <Field label="Role">
        <div style={{ display: 'flex', gap: 7 }}>
          {['Bar', 'Floor', 'Kitchen', 'Host'].map((r) => (
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
        <Field label="Rate £/hr" style={{ width: 96 }}>
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: '1px solid var(--line-2)',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              borderRadius: 11,
              padding: '11px 12px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <Btn variant="ghost" full onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          full
          onClick={() => {
            actions.postOpenShift({ date, role, start, end, rate: parseFloat(rate) || 12.6 });
            onClose();
          }}
        >
          Post shift
        </Btn>
      </div>
    </ModalShell>
  );
}

export function OpenView({ data, actions }: { data: RotaData; actions: Actions }) {
  const [post, setPost] = useState(false);
  const open = data.shifts
    .filter((s) => s.companyId === 'oak' && s.status === 'open')
    .sort((a, b) => sortKey(a) - sortKey(b));

  return (
    <>
      <PageHeader
        title="Open shifts"
        sub="Posted to your team & connected workers"
        right={
          <Btn variant="primary" size="md" onClick={() => setPost(true)}>
            <Icon name="plus" size={16} /> Post open shift
          </Btn>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 26px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, maxWidth: 760 }}>
          {open.map((s) => (
            <Card key={s.id} pad={16}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{s.role}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
                    {relDayLabel(s.date)} · {s.start}–{s.end}
                  </div>
                </div>
                <Badge tone="accent">£{s.rate.toFixed(2)}/hr</Badge>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--line)',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="users" size={15} /> Visible to {WORKERS.length} staff
                </span>
                <button
                  onClick={() => actions.removeShift(s.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--ink-3)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Icon name="x" size={14} /> Unpost
                </button>
              </div>
            </Card>
          ))}
        </div>
        {open.length === 0 && (
          <EmptyCard
            title="No open shifts posted"
            sub="Post one and it appears instantly in connected workers' apps."
          />
        )}
      </div>
      {post && <PostOpenModal actions={actions} onClose={() => setPost(false)} />}
    </>
  );
}
