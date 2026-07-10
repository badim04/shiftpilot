import type { ReactNode } from 'react';
import { Avatar, Card, Eyebrow } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { COMPANIES, workerById } from '../data/seed';
import { workedHours } from '../data/helpers';
import { jamieShifts } from './selectors';
import type { RotaData } from '../data/types';

function MeRow({
  icon,
  label,
  detail,
  onClick,
  first,
}: {
  icon: string;
  label: string;
  detail?: ReactNode;
  onClick?: () => void;
  last?: boolean;
  first?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 15px',
        borderTop: first ? 'none' : '1px solid var(--line)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: 'var(--surface-3)',
          color: 'var(--ink-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={17} />
      </div>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
      {detail && <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>{detail}</span>}
      {onClick && <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)' }} />}
    </div>
  );
}

export function MeScreen({ data, onAvailability }: { data: RotaData; onAvailability: () => void }) {
  const jamie = workerById('jamie')!;
  const earned = jamieShifts(data)
    .filter((s) => s.status === 'completed')
    .reduce((a, s) => a + workedHours(s) * s.rate, 0);
  return (
    <div style={{ padding: '6px 18px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <Avatar worker={jamie} size={58} />
        <div>
          <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.3 }}>{jamie.name}</div>
          <div
            style={{
              fontSize: 13.5,
              color: 'var(--ink-2)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
            }}
          >
            <Icon name="briefcase" size={14} /> Multi-company worker · 3 employers
          </div>
        </div>
      </div>

      <Eyebrow style={{ marginBottom: 10 }}>Your companies</Eyebrow>
      <Card pad={0} style={{ marginBottom: 18, overflow: 'hidden' }}>
        {COMPANIES.map((c, i) => {
          const role = jamieShifts(data).find((s) => s.companyId === c.id);
          const rate = role ? role.rate : c.id === 'oak' ? jamie.rate : 12.5;
          return (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '13px 15px',
                borderTop: i ? '1px solid var(--line)' : 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: c.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {c.short[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{c.kind}</div>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink-2)' }}>£{rate.toFixed(2)}/hr</span>
            </div>
          );
        })}
      </Card>

      <Eyebrow style={{ marginBottom: 10 }}>Manage</Eyebrow>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <MeRow icon="clock" label="My availability" detail="Set weekly" onClick={onAvailability} first />
        <MeRow icon="pound" label="Earnings to date" detail={`£${earned.toFixed(0)}`} />
        <MeRow icon="bell" label="Notifications" detail="On" />
        <MeRow icon="settings" label="Account & pay details" last />
      </Card>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            color: 'var(--danger)',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <Icon name="logout" size={16} /> Sign out
        </span>
      </div>
    </div>
  );
}
