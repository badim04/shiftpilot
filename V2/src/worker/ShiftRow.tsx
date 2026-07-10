import { Card, CompanyChip } from '../ui/primitives';
import { companyById } from '../data/seed';
import { dur, payOf } from '../data/helpers';
import type { Shift } from '../data/types';
import { StatusBadge } from './StatusBadge';

export function ShiftRow({ s, onClick }: { s: Shift; onClick: () => void }) {
  const co = companyById(s.companyId);
  const hrs = dur(s.start, s.end);
  return (
    <Card onClick={onClick} pad={0} hover style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: 4, background: co.color, flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
          <div style={{ textAlign: 'center', minWidth: 46 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{s.start}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{s.end}</div>
          </div>
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {s.role}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <CompanyChip company={co} />
              <span style={{ color: 'var(--line-2)' }}>·</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                {hrs % 1 === 0 ? hrs : hrs.toFixed(1)}h
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <StatusBadge s={s} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)' }}>£{payOf(s).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
