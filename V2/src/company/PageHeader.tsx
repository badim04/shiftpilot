import type { ReactNode } from 'react';

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: '20px 26px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 21,
            fontWeight: 800,
            color: 'var(--ink)',
            letterSpacing: -0.4,
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {sub && (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{sub}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{right}</div>
    </div>
  );
}

export const MANAGER = { name: 'Sam Carter', role: 'Duty Manager', initials: 'SC', color: '#3B4252' };
