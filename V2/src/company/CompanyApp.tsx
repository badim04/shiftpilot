import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { companyById } from '../data/seed';
import { useStore } from '../data/store';
import { Wordmark } from './Wordmark';
import { MANAGER } from './PageHeader';
import { RotaView } from './RotaView';
import { LiveView } from './LiveView';
import { OpenView } from './OpenView';
import { ApproveView } from './ApproveView';
import { MessagesView } from './MessagesView';

type Tab = 'rota' | 'live' | 'open' | 'approve' | 'messages';
const CTABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'rota', label: 'Rota', icon: 'grid' },
  { id: 'live', label: 'On now', icon: 'pin' },
  { id: 'open', label: 'Open shifts', icon: 'briefcase' },
  { id: 'approve', label: 'Timesheets', icon: 'checkCircle' },
  { id: 'messages', label: 'Messages', icon: 'chat' },
];

export function CompanyApp() {
  const { data, actions } = useStore();
  const [tab, setTab] = useState<Tab>('rota');
  const oak = companyById('oak');
  const openCount = data.shifts.filter((s) => s.companyId === 'oak' && s.status === 'open').length;
  const pendingCount = data.shifts.filter(
    (s) => s.companyId === 'oak' && s.status === 'completed' && !s.approved,
  ).length;
  const unread = data.messages.filter((m) => m.unread).length;
  const counts: Partial<Record<Tab, number>> = { open: openCount, approve: pendingCount, messages: unread };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: 218,
          flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 8px 18px' }}>
          <Wordmark size={20} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 10px',
            borderRadius: 12,
            background: 'var(--surface-3)',
            marginBottom: 16,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: oak.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            O
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: 'var(--ink)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {oak.short}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>Hospitality</div>
          </div>
          <Icon name="chevD" size={15} style={{ color: 'var(--ink-3)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {CTABS.map((t) => {
            const on = tab === t.id;
            const n = counts[t.id] ?? 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 11px',
                  borderRadius: 11,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  background: on ? 'var(--accent-soft)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--ink-2)',
                  fontSize: 14,
                  fontWeight: 700,
                  transition: 'background .12s',
                }}
              >
                <Icon name={t.icon} size={19} stroke={on ? 2.1 : 1.8} />
                <span style={{ flex: 1 }}>{t.label}</span>
                {n > 0 && (
                  <span
                    style={{
                      minWidth: 19,
                      height: 19,
                      padding: '0 5px',
                      borderRadius: 10,
                      background: on ? 'var(--accent)' : 'var(--surface-3)',
                      color: on ? 'var(--accent-ink)' : 'var(--ink-2)',
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px',
            borderRadius: 12,
            border: '1px solid var(--line)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: MANAGER.color,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {MANAGER.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{MANAGER.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{MANAGER.role}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {tab === 'rota' && <RotaView data={data} actions={actions} />}
        {tab === 'live' && <LiveView data={data} />}
        {tab === 'open' && <OpenView data={data} actions={actions} />}
        {tab === 'approve' && <ApproveView data={data} actions={actions} />}
        {tab === 'messages' && <MessagesView data={data} actions={actions} />}
      </div>
    </div>
  );
}
