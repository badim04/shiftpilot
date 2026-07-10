import { Icon } from '../ui/Icon';

export function Wordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: size * 1.1,
          height: size * 1.1,
          borderRadius: size * 0.32,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="calendar" size={size * 0.62} style={{ color: 'var(--accent-ink)' }} stroke={2.2} />
      </div>
      <span
        style={{
          fontSize: size,
          fontWeight: 800,
          letterSpacing: -0.5,
          color: light ? '#fff' : 'var(--ink)',
        }}
      >
        rota
      </span>
    </div>
  );
}
