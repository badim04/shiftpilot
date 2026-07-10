import { useState } from 'react';
import { Badge, Btn, Card, CompanyChip } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { COMPANIES, companyById } from '../data/seed';
import { payOf, relDayLabel } from '../data/helpers';
import { sortKey } from './selectors';
import { EmptyState } from './EmptyState';
import type { Actions } from '../data/store';
import type { RotaData } from '../data/types';

function FilterChip({
  label,
  dot,
  on,
  onClick,
}: {
  label: string;
  dot?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        padding: '7px 13px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        background: on ? 'var(--accent)' : 'var(--surface)',
        color: on ? 'var(--accent-ink)' : 'var(--ink-2)',
        boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)',
      }}
    >
      {dot && (
        <span style={{ width: 8, height: 8, borderRadius: 3, background: on ? 'var(--accent-ink)' : dot }} />
      )}
      {label}
    </button>
  );
}

export function PickupScreen({
  data,
  actions,
  onOpenShift,
}: {
  data: RotaData;
  actions: Actions;
  onOpenShift: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>('all');
  let open = data.shifts.filter((s) => s.status === 'open').sort((a, b) => sortKey(a) - sortKey(b));
  if (filter !== 'all') open = open.filter((s) => s.companyId === filter);

  return (
    <div style={{ padding: '6px 18px 24px' }}>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 14, margin: '0 -2px' }}>
        <FilterChip label="All" on={filter === 'all'} onClick={() => setFilter('all')} />
        {COMPANIES.map((c) => (
          <FilterChip key={c.id} label={c.short} dot={c.color} on={filter === c.id} onClick={() => setFilter(c.id)} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {open.map((s) => {
          const co = companyById(s.companyId);
          return (
            <Card key={s.id} pad={15} hover>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <CompanyChip company={co} />
                <Badge tone="accent">£{s.rate.toFixed(2)}/hr</Badge>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{s.role}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '8px 0 14px', color: 'var(--ink-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600 }}>
                  <Icon name="calendar" size={15} />
                  {relDayLabel(s.date)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600 }}>
                  <Icon name="clock" size={15} />
                  {s.start}–{s.end}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <Btn variant="soft" size="md" onClick={() => onOpenShift(s.id)} style={{ flex: '0 0 auto' }}>
                  Details
                </Btn>
                <Btn variant="primary" size="md" full onClick={() => actions.acceptOpen(s.id)}>
                  Pick up · £{payOf(s).toFixed(0)}
                </Btn>
              </div>
            </Card>
          );
        })}
        {open.length === 0 && <EmptyState title="No open shifts" sub="You're all caught up. Check back soon." />}
      </div>
    </div>
  );
}
