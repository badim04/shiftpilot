import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

export function EntryCard({
  icon,
  eyebrow,
  title,
  sub,
  bullets,
  onClick,
  accent = false,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  sub: string;
  bullets: ReactNode[];
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: 'left',
        padding: 28,
        borderRadius: 22,
        background: accent ? 'var(--accent-soft)' : 'var(--surface)',
        border: accent ? '1px solid var(--accent)' : '1px solid var(--line)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'transform .15s ease, box-shadow .15s ease',
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: accent ? 'var(--accent)' : 'var(--surface-3)',
          color: accent ? 'var(--accent-ink)' : 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={24} stroke={2} />
      </div>
      <div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: accent ? 'var(--accent)' : 'var(--ink-3)',
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 6, lineHeight: 1.5 }}>
          {sub}
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {bullets.map((b, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink-2)',
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: accent ? 'var(--accent)' : 'var(--positive-soft)',
                color: accent ? 'var(--accent-ink)' : 'var(--positive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="check" size={11} stroke={2.4} />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13.5,
          fontWeight: 700,
          color: 'var(--accent)',
          marginTop: 4,
        }}
      >
        Open demo <Icon name="arrowR" size={15} stroke={2.2} />
      </div>
    </button>
  );
}
