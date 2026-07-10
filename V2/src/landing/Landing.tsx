import { Wordmark } from '../company/Wordmark';
import { LiveDot } from '../ui/primitives';
import { EntryCard } from './EntryCard';
import type { Mode } from '../data/types';

export function Landing({ setMode, demoBadge = false }: { setMode: (m: Mode) => void; demoBadge?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 28px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <Wordmark size={28} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'var(--surface-3)',
              color: 'var(--ink-2)',
            }}
          >
            <LiveDot /> {demoBadge ? 'Demo · sign in for live data' : 'Live · synced across both sides'}
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -1.2,
              color: 'var(--ink)',
              lineHeight: 1.05,
            }}
          >
            Shifts, sorted —<br />
            for both sides of the rota.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: 580,
              fontSize: 15.5,
              fontWeight: 500,
              lineHeight: 1.55,
              color: 'var(--ink-2)',
            }}
          >
            Pick a side to explore the demo. Anything you do — clock in, post a shift, approve a timesheet —
            shows up live on the other side too.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <EntryCard
            icon="user"
            eyebrow="For workers"
            title="Worker app"
            sub="Mobile shifts, open pickups, timesheets and availability — built for a thumb."
            onClick={() => setMode('worker')}
            bullets={[
              'See your week across every employer',
              'Clock in & out from your phone',
              'Grab open shifts the moment they post',
            ]}
          />
          <EntryCard
            icon="grid"
            eyebrow="For managers"
            title="Manager dashboard"
            sub="Build the rota, post open shifts, track who is on, approve timesheets — fast."
            onClick={() => setMode('company')}
            accent
            bullets={[
              'Drag-light weekly rota with one click publish',
              'Live view of who is clocked in right now',
              'Sign off timesheets with variance flags',
            ]}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 22,
            fontSize: 12.5,
            color: 'var(--ink-3)',
            fontWeight: 600,
          }}
        >
          <span>Use the toolbar to switch themes & accent.</span>
          <span>Hit "Reset demo" any time.</span>
        </div>
      </div>
    </div>
  );
}
