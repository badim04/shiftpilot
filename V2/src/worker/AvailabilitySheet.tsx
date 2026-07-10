import { Btn } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { DAYS } from '../data/seed';
import { Sheet, SheetHeader } from './Sheet';
import type { Actions } from '../data/store';
import type { Availability, Day, Period } from '../data/types';

const PERIODS: [Period, string, string][] = [
  ['morning', 'Morning', 'sun'],
  ['afternoon', 'Afternoon', 'coffee'],
  ['evening', 'Evening', 'moon'],
  ['night', 'Night', 'clock'],
];

export function AvailabilitySheet({
  open,
  availability,
  actions,
  onClose,
}: {
  open: boolean;
  availability: Availability;
  actions: Actions;
  onClose: () => void;
}) {
  return (
    <Sheet open={open}>
      <SheetHeader title="My availability" onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 30px' }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, margin: '0 0 18px', lineHeight: 1.5 }}>
          Tap to mark when you can work. Managers across all your companies see this when filling shifts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAYS.map((d) => (
            <div key={d}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: 0.3 }}>
                {d}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {PERIODS.map(([k, lbl, ic]) => {
                  const on = availability[d as Day] && availability[d as Day][k];
                  return (
                    <button
                      key={k}
                      onClick={() => actions.toggleAvailability(d as Day, k)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderRadius: 13,
                        padding: '11px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5,
                        background: on ? 'var(--accent)' : 'var(--surface)',
                        color: on ? 'var(--accent-ink)' : 'var(--ink-3)',
                        boxShadow: on ? 'none' : 'inset 0 0 0 1px var(--line)',
                        transition: 'background .15s',
                      }}
                    >
                      <Icon name={ic} size={17} />
                      <span style={{ fontSize: 10.5, fontWeight: 800 }}>{lbl}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 30px', flexShrink: 0 }}>
        <Btn variant="primary" full size="lg" onClick={onClose}>
          Save availability
        </Btn>
      </div>
    </Sheet>
  );
}
