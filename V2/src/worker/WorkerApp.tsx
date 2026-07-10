import { useState } from 'react';
import { Avatar } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { useRotaClock } from '../ui/hooks';
import { NOW, workerById } from '../data/seed';
import { useStore } from '../data/store';
import { ShiftsScreen } from './ShiftsScreen';
import { PickupScreen } from './PickupScreen';
import { TimesheetScreen } from './TimesheetScreen';
import { MeScreen } from './MeScreen';
import { ShiftDetail } from './ShiftDetail';
import { AvailabilitySheet } from './AvailabilitySheet';

type Tab = 'shifts' | 'pickup' | 'time' | 'me';
const WTABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'shifts', label: 'Shifts', icon: 'calendar' },
  { id: 'pickup', label: 'Pick up', icon: 'plus' },
  { id: 'time', label: 'Timesheet', icon: 'pound' },
  { id: 'me', label: 'Account', icon: 'user' },
];

const TITLES: Record<Tab, string> = {
  shifts: 'Your shifts',
  pickup: 'Open shifts',
  time: 'Timesheet',
  me: 'Account',
};

export function WorkerApp() {
  const { data, actions } = useStore();
  const [tab, setTab] = useState<Tab>('shifts');
  const [detail, setDetail] = useState<string | null>(null);
  const [avail, setAvail] = useState(false);
  const clock = useRotaClock();
  const openCount = data.shifts.filter((s) => s.status === 'open').length;
  const jamie = workerById('jamie')!;

  return (
    <div style={{ position: 'relative', height: '100%', background: 'var(--bg)' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: 54,
          background: 'var(--bg)',
        }}
      >
        <div
          style={{
            padding: '2px 18px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>
              {tab === 'shifts'
                ? NOW.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Rota'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.6, marginTop: 1 }}>
              {TITLES[tab]}
            </div>
          </div>
          <button
            onClick={() => setTab('me')}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
          >
            <Avatar worker={jamie} size={40} />
          </button>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          paddingTop: 104,
          paddingBottom: 86,
        }}
      >
        {tab === 'shifts' && <ShiftsScreen data={data} actions={actions} clock={clock} onOpenShift={setDetail} />}
        {tab === 'pickup' && <PickupScreen data={data} actions={actions} onOpenShift={setDetail} />}
        {tab === 'time' && <TimesheetScreen data={data} onOpenShift={setDetail} />}
        {tab === 'me' && <MeScreen data={data} onAvailability={() => setAvail(true)} />}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
          paddingBottom: 26,
          paddingTop: 8,
          background: 'var(--bg)',
          borderTop: '1px solid var(--line)',
          display: 'flex',
        }}
      >
        {WTABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: on ? 'var(--accent)' : 'var(--ink-3)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon name={t.icon} size={23} fill={on && t.icon === 'user'} stroke={on ? 2.2 : 1.9} />
                {t.id === 'pickup' && openCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -9,
                      minWidth: 16,
                      height: 16,
                      padding: '0 4px',
                      borderRadius: 8,
                      background: 'var(--accent)',
                      color: 'var(--accent-ink)',
                      fontSize: 10,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {openCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700 }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <ShiftDetail
        shiftId={detail}
        data={data}
        actions={actions}
        clock={clock}
        onClose={() => setDetail(null)}
      />
      <AvailabilitySheet
        open={avail}
        availability={data.availability}
        actions={actions}
        onClose={() => setAvail(false)}
      />
    </div>
  );
}
