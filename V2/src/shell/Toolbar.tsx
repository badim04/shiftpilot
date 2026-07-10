import { Btn, LiveDot, Segmented } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { Wordmark } from '../company/Wordmark';
import { ACCENTS, THEMES } from '../theme';
import type { ThemeKey } from '../theme';
import type { Mode } from '../data/types';

export function Toolbar({
  mode,
  setMode,
  themeKey,
  setThemeKey,
  accent,
  setAccent,
  signedIn,
  online,
  onSignOut,
  onReset,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  themeKey: ThemeKey;
  setThemeKey: (k: ThemeKey) => void;
  accent: string;
  setAccent: (a: string) => void;
  signedIn: boolean;
  online: boolean;
  onSignOut: () => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 22px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg-2)',
      }}
    >
      <button
        onClick={() => setMode('landing')}
        style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
        title="Home"
      >
        <Wordmark size={18} />
      </button>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 11px',
          borderRadius: 999,
          background: online ? 'var(--positive-soft)' : 'var(--surface-3)',
          color: online ? 'var(--positive)' : 'var(--ink-2)',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <LiveDot color={online ? 'var(--positive)' : 'var(--ink-3)'} />
        {online ? 'Live · synced' : 'Demo · local only'}
      </span>

      <div style={{ flex: 1 }} />

      {mode !== 'landing' && (
        <Segmented
          size="sm"
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          options={[
            { value: 'worker', label: 'Worker' },
            { value: 'company', label: 'Manager' },
          ]}
        />
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {(Object.keys(THEMES) as ThemeKey[]).map((k) => {
          const on = k === themeKey;
          return (
            <button
              key={k}
              onClick={() => setThemeKey(k)}
              title={THEMES[k].label}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                border: on ? '2px solid var(--accent)' : '1px solid var(--line-2)',
                background: THEMES[k].vars['--bg'],
                cursor: 'pointer',
                padding: 0,
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {ACCENTS.map((a, i) => {
          const on = a === accent;
          const bg = a || 'transparent';
          return (
            <button
              key={i}
              onClick={() => setAccent(a)}
              title={a || 'Theme default'}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: on ? '2px solid var(--ink)' : '1px solid var(--line-2)',
                background: bg,
                cursor: 'pointer',
                padding: 0,
                position: 'relative',
              }}
            >
              {!a && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 2,
                    borderRadius: '50%',
                    background:
                      'conic-gradient(#2F6BF0, #7A5AE0, #0E9E8E, #E0633A, #E0A845, #2F6BF0)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {signedIn ? (
        <Btn variant="ghost" size="sm" onClick={onSignOut}>
          <Icon name="logout" size={14} /> Sign out
        </Btn>
      ) : (
        <Btn variant="ghost" size="sm" onClick={onReset}>
          <Icon name="arrowR" size={14} /> Reset demo
        </Btn>
      )}
    </div>
  );
}
